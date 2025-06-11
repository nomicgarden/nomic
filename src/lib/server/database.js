import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Determine database path: in-memory for test, file-based otherwise
const isTestEnvironment = process.env.NODE_ENV === 'test';
const dbFile = isTestEnvironment ? ':memory:' : 'nomic-garden.db';
let dbPath;

if (!isTestEnvironment) {
  dbPath = path.resolve(dbFile);
  // Ensure the directory for the database file exists for file-based DB
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} else {
  dbPath = dbFile; // For in-memory, the path is just ':memory:'
}

// Initialize the database
// The verbose option logs executed SQL statements to the console, useful for debugging.
// It's conditional to avoid spamming logs during tests unless specifically desired.
const dbInstance = new Database(dbPath, { verbose: !isTestEnvironment ? console.log : undefined });

// Export the db instance for use in other modules
export const db = dbInstance;

// Centralized initDb function, now using the exported db instance
function initDb(databaseInstance) {
  databaseInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_picture_url TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'draft', -- e.g., draft, proposed, active, rejected, implemented
        proposed_rule_text TEXT,
        manifold_market_url TEXT, -- Optional link to a Manifold market for voting/prediction
        FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposal_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        vote_value TEXT NOT NULL, -- Consider CHECK(vote_value IN ('yes', 'no', 'abstain'))
        voted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        rationale TEXT,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (proposal_id, user_id) -- Ensures a user can only vote once per proposal
    );
  `);
  console.log('Database initialized and `users`, `proposals`, and `votes` tables ensured.');
}

// Call initDb with the instance to ensure schema is set up
initDb(dbInstance);

if (isTestEnvironment) {
  console.log('SQLite database initialized in-memory for testing.');
} else {
  console.log(`SQLite database initialized at: ${dbPath}`);
}

// Function to allow re-initialization for testing or other purposes
// This is particularly useful for in-memory databases to get a fresh start.
export function reinitializeDbForTest() {
  if (!isTestEnvironment) {
    throw new Error('reinitializeDbForTest is only allowed in test environment.');
  }
  // Close existing connection if open, though for in-memory, creating a new instance is often enough.
  // dbInstance.close(); // This might invalidate the exported 'db'. Careful management needed.
  // For simplicity with better-sqlite3, re-running schema on the current in-memory DB
  // or creating a new in-memory instance and re-exporting/re-assigning 'db' might be options.
  // The simplest for an already in-memory DB is to clear tables and re-run init.
  // However, better-sqlite3 doesn't have a straightforward way to drop all tables if they exist.
  // So, for tests, it's often better to create a NEW in-memory DB for each test suite or test.
  // For this script, we'll rely on the initial single in-memory DB for all tests in one run.
  // A more robust test setup might involve passing a new DB instance to functions.
  console.log('Re-running schema for in-memory test database.');
  initDb(dbInstance); // Re-run schema on the same in-memory DB instance
}

// User interaction functions
export function createUser(username, email, passwordHash) {
  try {
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    const info = stmt.run(username, email, passwordHash);
    // Return the newly created user's ID and username.
    // The email is also included for completeness, though often just ID/username is sufficient.
    return { id: info.lastInsertRowid, username, email };
  } catch (err) {
    // Log the error for server-side debugging
    console.error('Error creating user:', err.message, `(Code: ${err.code})`);
    // Check for unique constraint violation
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const customError = new Error('User already exists (username or email).');
      customError.code = 'USER_ALREADY_EXISTS_DB'; // Custom code
      throw customError;
    }
    // Re-throw other errors with more context if possible, or just re-throw
    throw new Error(`Failed to create user due to a database error. Original: ${err.message}`);
  }
}

export function findUserByUsername(username) {
  try {
    const stmt = db.prepare(
      'SELECT id, username, email, password_hash, profile_picture_url, bio, created_at FROM users WHERE username = ?'
    );
    const user = stmt.get(username);
    return user || null;
  } catch (error) {
    console.error('Error finding user by username:', error.message);
    throw new Error('Database query failed while finding user by username.');
  }
}

export function findUserByEmail(email) {
  try {
    const stmt = db.prepare(
      'SELECT id, username, email, password_hash, profile_picture_url, bio, created_at FROM users WHERE email = ?'
    );
    const user = stmt.get(email);
    return user || null;
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw new Error('Database query failed while finding user by email.');
  }
}

// Placeholder CRUD Functions for Proposals

/**
 * Creates a new proposal.
 * @param {object} data - The proposal data.
 * @param {string} data.title - The title of the proposal.
 * @param {string} data.description - The detailed description of the proposal.
 * @param {number} data.author_id - The ID of the user creating the proposal.
 * @param {string} [data.proposed_rule_text] - The specific text of the rule being proposed.
 * @param {string} [data.status='draft'] - The initial status of the proposal.
 * @param {string} [data.manifold_market_url] - Optional URL to a Manifold market.
 * @returns {object} Placeholder for the created proposal, e.g., { id: newId, ...data }.
 */
export function createProposal(data) {
  const {
    title,
    description,
    author_id,
    proposed_rule_text = null,
    status = 'draft',
    manifold_market_url = null
  } = data;

  if (!title || !description || typeof author_id === 'undefined') {
    // Basic check for required fields at the database function level,
    // though endpoint validation should catch this first.
    throw new Error('Title, description, and author_id are required to create a proposal.');
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO proposals (title, description, author_id, proposed_rule_text, status, manifold_market_url) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      title,
      description,
      author_id,
      proposed_rule_text,
      status,
      manifold_market_url
    );

    // Fetch the created_at timestamp which is set by DEFAULT CURRENT_TIMESTAMP
    const newProposal = db
      .prepare('SELECT created_at FROM proposals WHERE id = ?')
      .get(info.lastInsertRowid);

    return {
      id: info.lastInsertRowid,
      title,
      description,
      author_id,
      proposed_rule_text,
      status,
      manifold_market_url,
      created_at: newProposal.created_at // Include the actual timestamp from DB
    };
  } catch (error) {
    console.error('Error creating proposal:', error.message);
    // Check for foreign key constraint violation (e.g., invalid author_id)
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw new Error(`Invalid author_id: ${author_id}. User does not exist.`);
    }
    // Check for NOT NULL constraint (though handled by the initial check, good for defense)
    if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      console.error('A NOT NULL constraint was violated. Data provided:', data);
      throw new Error('A required field was missing for the proposal.');
    }
    throw new Error('Failed to create proposal due to a database error.');
  }
}

/**
 * Retrieves a proposal by its ID.
 * @param {number} id - The ID of the proposal to retrieve.
 * @returns {object | null} Placeholder for the proposal object or null if not found.
 */
export function getProposalById(id) {
  try {
    const stmt = db.prepare(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.author_id,
        u.username AS author_username,
        p.created_at,
        p.status,
        p.proposed_rule_text,
        p.manifold_market_url
      FROM proposals p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `);
    // Ensure id is an integer before passing to query
    const proposal = stmt.get(Number(id));
    return proposal || null;
  } catch (error) {
    console.error(`Error fetching proposal by ID (${id}):`, error.message);
    // Depending on how you want to handle DB errors, you might re-throw,
    // or return null/undefined, or a specific error object.
    // For now, re-throwing to be caught by the calling server load function.
    throw new Error(`Database query failed while fetching proposal ID ${id}.`);
  }
}

/**
 * Retrieves multiple proposals based on options.
 * @param {object} [options={}] - Filtering options (e.g., { status: 'proposed', author_id: 1 }).
 * @returns {Array<object>} Placeholder for an array of proposal objects.
 */
export function getProposals(options = {}) {
  // Basic query structure
  let query = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.author_id,
      u.username AS author_username,
      p.created_at,
      p.status,
      p.proposed_rule_text,
      p.manifold_market_url
    FROM proposals p
    JOIN users u ON p.author_id = u.id
  `;
  const params = [];
  const conditions = [];

  // Example: Filter by status
  if (options.status) {
    conditions.push('p.status = ?');
    params.push(options.status);
  }

  // Example: Filter by author_id
  if (options.author_id) {
    conditions.push('p.author_id = ?');
    params.push(options.author_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Default ordering
  query += ' ORDER BY p.created_at DESC';

  // Limit and offset for pagination (optional, can be added later)
  if (options.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }

  try {
    const stmt = db.prepare(query);
    const proposals = stmt.all(...params); // Use spread for params array
    return proposals;
  } catch (error) {
    console.error('Error fetching proposals:', error.message);
    throw new Error('Database query failed while fetching proposals.');
  }
}

/**
 * Updates the status of a proposal.
 * @param {number} id - The ID of the proposal to update.
 * @param {string} status - The new status for the proposal.
 * @returns {object} Object indicating the number of changes, e.g., { changes: number }.
 */
// Updates the status of a proposal.
// Intended for use by admin functionalities or automated system processes
// to move proposals through their lifecycle (e.g., 'draft' -> 'open_for_voting').
// Future enhancements could include more robust status transition validation.
export function updateProposalStatus(id, status) {
  // Basic validation for status - should not be empty.
  // A more robust validation would check against a predefined list of allowed statuses.
  // e.g., const ALLOWED_STATUSES = ['draft', 'pending_review', ...];
  // if (!ALLOWED_STATUSES.includes(status)) {
  //   throw new Error(`Invalid status value: ${status}`);
  // }
  if (typeof status !== 'string' || status.trim() === '') {
    throw new Error('Status must be a non-empty string.');
  }

  try {
    const stmt = db.prepare('UPDATE proposals SET status = ? WHERE id = ?');
    const info = stmt.run(status, Number(id));

    if (info.changes === 0) {
      // Check if the proposal ID exists to differentiate between "not found" and "status unchanged"
      const existsStmt = db.prepare('SELECT id FROM proposals WHERE id = ?');
      if (!existsStmt.get(Number(id))) {
        throw new Error(`Proposal with ID ${id} not found.`);
      }
      // If it exists but changes is 0, it means the status was already set to the new value.
      // This is not an error, but good to be aware of.
    }
    return { changes: info.changes };
  } catch (error) {
    console.error(`Error updating status for proposal ID ${id} to "${status}":`, error.message);
    throw new Error(`Database query failed while updating status for proposal ID ${id}.`);
  }
}

/**
 * Updates the details of a proposal.
 * @param {number} id - The ID of the proposal to update.
 * @param {object} data - An object containing the fields to update (e.g., { title, description }).
 * @returns {object} Placeholder for success/failure, e.g., { success: true, updatedFields: Object.keys(data) }.
 */
export function updateProposalDetails(id, data) {
  const validFields = ['title', 'description', 'proposed_rule_text', 'manifold_market_url'];
  const fieldsToUpdate = {};

  for (const key in data) {
    if (validFields.includes(key) && typeof data[key] !== 'undefined') {
      // Allow empty string for optional fields, but use null if explicitly passed or for consistency
      fieldsToUpdate[key] =
        data[key] === '' && (key === 'proposed_rule_text' || key === 'manifold_market_url')
          ? null
          : data[key];
    }
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    // It's not necessarily an error to submit no changes,
    // but the DB layer can indicate nothing was done.
    return { changes: 0, message: 'No valid or changed fields provided for update.' };
  }

  const setClauses = Object.keys(fieldsToUpdate)
    .map((field) => `${field} = ?`)
    .join(', ');
  const params = [...Object.values(fieldsToUpdate), Number(id)];

  try {
    const stmt = db.prepare(`UPDATE proposals SET ${setClauses} WHERE id = ?`);
    const info = stmt.run(...params);

    if (info.changes === 0) {
      // This might happen if the ID doesn't exist, or if the values submitted are the same as current.
      // Check if proposal exists to differentiate.
      const existsStmt = db.prepare('SELECT id FROM proposals WHERE id = ?');
      if (!existsStmt.get(Number(id))) {
        throw new Error(`Proposal with ID ${id} not found.`);
      }
    }
    return { changes: info.changes };
  } catch (error) {
    console.error(`Error updating proposal details for ID ${id}:`, error.message);
    // Check for specific constraints if necessary, e.g. NOT NULL if a required field was set to null
    if (
      error.code === 'SQLITE_CONSTRAINT_NOTNULL' &&
      (fieldsToUpdate.title === null || fieldsToUpdate.description === null)
    ) {
      throw new Error('Title and description cannot be empty.');
    }
    throw new Error(`Database query failed while updating proposal ID ${id}.`);
  }
}

// CONCEPTUAL NOTE ON CLOSING VOTING & DETERMINING PROPOSAL OUTCOME:
// 1. Trigger for Closing Votes:
//    - Could be a scheduled job that checks proposal end dates/durations.
//    - Could be a manual action by an administrator via a separate admin interface.
//
// 2. Determining Outcome:
//    - After voting closes (e.g., status becomes 'voting_closed' via updateProposalStatus),
//      fetch all votes using getVotesByProposalId(proposalId).
//    - Calculate final tally (e.g., yesVotes vs. noVotes).
//    - Apply predefined logic (e.g., simple majority, specific threshold).
//
// 3. Updating Proposal Status:
//    - Based on the outcome, call updateProposalStatus(proposalId, 'accepted') or
//      updateProposalStatus(proposalId, 'rejected').
//    - Further statuses like 'implemented' could follow based on off-chain actions.
//
// This process is currently not automated within the application and would
// require additional components (admin panel, scheduled tasks) for full automation.

// CRUD Functions for Votes

/**
 * Records a vote for a proposal.
 * @param {object} data - Vote data.
 * @param {number} data.proposal_id - ID of the proposal being voted on.
 * @param {number} data.user_id - ID of the user voting.
 * @param {string} data.vote_value - The user's vote (e.g., 'yes', 'no', 'abstain').
 * @param {string} [data.rationale] - Optional rationale for the vote.
 * @returns {object} Placeholder for the created vote, e.g., { id: newVoteId, ...data }.
 */
export function createVote(data) {
  const { proposal_id, user_id, vote_value, rationale = null } = data;

  if (typeof proposal_id === 'undefined' || typeof user_id === 'undefined' || !vote_value) {
    throw new Error('Proposal ID, User ID, and Vote Value are required to create a vote.');
  }
  // Add validation for vote_value if specific values are expected e.g. ['yes', 'no', 'abstain']
  // if (!['yes', 'no', 'abstain'].includes(vote_value)) {
  //   throw new Error(`Invalid vote_value: ${vote_value}`);
  // }

  try {
    const stmt = db.prepare(
      'INSERT INTO votes (proposal_id, user_id, vote_value, rationale) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(Number(proposal_id), Number(user_id), vote_value, rationale);
    const newVote = db.prepare('SELECT voted_at FROM votes WHERE id = ?').get(info.lastInsertRowid);
    return {
      id: info.lastInsertRowid,
      proposal_id: Number(proposal_id),
      user_id: Number(user_id),
      vote_value,
      rationale,
      voted_at: newVote.voted_at
    };
  } catch (error) {
    console.error('Error creating vote:', error.message);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('User has already voted on this proposal.');
    }
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      // Could be proposal_id or user_id is invalid
      throw new Error('Invalid proposal_id or user_id.');
    }
    if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      throw new Error('A required field for the vote was missing.');
    }
    throw new Error('Failed to create vote due to a database error.');
  }
}

/**
 * Retrieves all votes for a specific proposal, including voter information.
 * @param {number} proposal_id - The ID of the proposal.
 * @returns {Array<object>} An array of vote objects, each including voter's username.
 */
export function getVotesByProposalId(proposal_id) {
  try {
    const stmt = db.prepare(`
      SELECT
        v.id,
        v.proposal_id,
        v.user_id,
        v.vote_value,
        v.voted_at,
        v.rationale,
        u.username AS voter_username
      FROM votes v
      JOIN users u ON v.user_id = u.id
      WHERE v.proposal_id = ?
      ORDER BY v.voted_at DESC
    `);
    const votes = stmt.all(Number(proposal_id));
    return votes;
  } catch (error) {
    console.error(`Error fetching votes for proposal ID ${proposal_id}:`, error.message);
    throw new Error('Database query failed while fetching votes for proposal.');
  }
}

/**
 * Retrieves a specific user's vote for a given proposal.
 * @param {number} proposal_id - The ID of the proposal.
 * @param {number} user_id - The ID of the user.
 * @returns {object | null} The vote object if found, otherwise null.
 */
export function getUserVoteForProposal(proposal_id, user_id) {
  try {
    const stmt = db.prepare('SELECT * FROM votes WHERE proposal_id = ? AND user_id = ?');
    const vote = stmt.get(Number(proposal_id), Number(user_id));
    return vote || null;
  } catch (error) {
    console.error(
      `Error fetching user vote for proposal ${proposal_id}, user ${user_id}:`,
      error.message
    );
    throw new Error('Database query failed while fetching user vote.');
  }
}

/**
 * Updates an existing vote.
 * @param {number} vote_id - The ID of the vote to update.
 * @param {object} data - Data to update, e.g., { vote_value, rationale }.
 * @returns {object} Object indicating the number of changes, e.g., { changes: number }.
 */
export function updateVote(vote_id, data) {
  const { vote_value, rationale } = data;

  if (!vote_value) {
    // vote_value is required for an update
    throw new Error('Vote value is required to update a vote.');
  }
  // Add validation for vote_value if specific values are expected
  // if (!['yes', 'no', 'abstain'].includes(vote_value)) {
  //   throw new Error(`Invalid vote_value: ${vote_value}`);
  // }

  try {
    // Update voted_at to reflect the time of the last change to the vote
    const stmt = db.prepare(
      'UPDATE votes SET vote_value = ?, rationale = ?, voted_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    const info = stmt.run(vote_value, rationale === undefined ? null : rationale, Number(vote_id));

    if (info.changes === 0) {
      const existsStmt = db.prepare('SELECT id FROM votes WHERE id = ?');
      if (!existsStmt.get(Number(vote_id))) {
        throw new Error(`Vote with ID ${vote_id} not found.`);
      }
    }
    return { changes: info.changes };
  } catch (error) {
    console.error(`Error updating vote ID ${vote_id}:`, error.message);
    if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      throw new Error('A required field for the vote update was missing or invalid.');
    }
    throw new Error(`Database query failed while updating vote ID ${vote_id}.`);
  }
}

import assert from 'assert';
import {
  db,
  initDb, // Assuming initDb can be called to reset schema on the in-memory DB
  createUser,
  createProposal,
  getProposalById,
  updateProposalStatus,
  updateProposalDetails,
  getProposals
} from './src/lib/server/database.js';

// Helper to reset DB for tests (in-memory)
async function resetDatabase() {
  // For better-sqlite3 in-memory, re-running initDb effectively clears and recreates schema
  // For file-based, you'd delete and recreate the file.
  // The modified database.js uses a single in-memory instance, so we re-initialize its schema.
  db.exec(`
    DROP TABLE IF EXISTS proposals;
    DROP TABLE IF EXISTS users;
  `);
  initDb(db); // Pass the actual db instance to initDb
  console.log("Test Database schema re-initialized.");
}

let testUser;

async function setupUser() {
  try {
    testUser = createUser('testuser', 'test@example.com', 'password123');
    assert(testUser && testUser.id, 'Test user creation failed or did not return ID.');
    console.log('Test user created successfully.');
  } catch (e) {
    // If user already exists from a previous partial run (less likely with in-memory reset)
    if (e.message.includes('UNIQUE constraint failed: users.username') || e.message.includes('Username or email already exists')) {
      console.log('Test user already exists, fetching...');
      testUser = findUserByUsername('testuser');
      assert(testUser && testUser.id, 'Failed to fetch existing test user.');
    } else {
      throw e; // Re-throw other errors
    }
  }
}

async function testCreateAndGetProposal() {
  console.log('Running: testCreateAndGetProposal');
  await resetDatabase();
  await setupUser();

  const proposalData = {
    title: 'Test Proposal 1',
    description: 'Description for test proposal 1.',
    author_id: testUser.id,
    proposed_rule_text: 'Rule text here.',
    status: 'draft',
    manifold_market_url: 'http://manifold.market/test1'
  };
  const created = createProposal(proposalData);
  assert(created && created.id, 'createProposal should return an object with an id.');
  assert.strictEqual(created.title, proposalData.title, 'Created proposal title mismatch.');

  const fetched = getProposalById(created.id);
  assert(fetched, `getProposalById should fetch the created proposal with id ${created.id}.`);
  assert.strictEqual(fetched.id, created.id, 'Fetched proposal ID mismatch.');
  assert.strictEqual(fetched.title, proposalData.title, 'Fetched proposal title mismatch.');
  assert.strictEqual(fetched.description, proposalData.description, 'Fetched proposal description mismatch.');
  assert.strictEqual(fetched.author_id, proposalData.author_id, 'Fetched proposal author_id mismatch.');
  assert.strictEqual(fetched.author_username, testUser.username, 'Fetched proposal author_username mismatch.');
  assert.strictEqual(fetched.status, proposalData.status, 'Fetched proposal status mismatch.');
  console.log('testCreateAndGetProposal: PASS');
}

async function testUpdateStatus() {
  console.log('Running: testUpdateStatus');
  await resetDatabase();
  await setupUser();

  const proposalData = { title: 'Status Update Test', description: 'Desc', author_id: testUser.id, status: 'draft' };
  const created = createProposal(proposalData);
  assert(created && created.id, 'Failed to create proposal for status update test.');

  const newStatus = 'open_for_voting';
  const updateResult = updateProposalStatus(created.id, newStatus);
  assert(updateResult && updateResult.changes > 0, 'updateProposalStatus should indicate changes.');

  const fetched = getProposalById(created.id);
  assert(fetched, 'Failed to fetch proposal after status update.');
  assert.strictEqual(fetched.status, newStatus, `Proposal status should be updated to ${newStatus}.`);
  console.log('testUpdateStatus: PASS');
}

async function testUpdateDetails() {
  console.log('Running: testUpdateDetails');
  await resetDatabase();
  await setupUser();

  const initialData = { title: 'Detail Update Test', description: 'Initial Desc', author_id: testUser.id };
  const created = createProposal(initialData);
  assert(created && created.id, 'Failed to create proposal for detail update test.');

  const updates = {
    title: 'Updated Title',
    description: 'Updated Description',
    proposed_rule_text: 'Updated rule text.',
    manifold_market_url: 'http://manifold.market/updated'
  };
  const updateResult = updateProposalDetails(created.id, updates);
  assert(updateResult && updateResult.changes > 0, 'updateProposalDetails should indicate changes.');

  const fetched = getProposalById(created.id);
  assert(fetched, 'Failed to fetch proposal after detail update.');
  assert.strictEqual(fetched.title, updates.title, 'Proposal title should be updated.');
  assert.strictEqual(fetched.description, updates.description, 'Proposal description should be updated.');
  assert.strictEqual(fetched.proposed_rule_text, updates.proposed_rule_text, 'Proposal rule text should be updated.');
  assert.strictEqual(fetched.manifold_market_url, updates.manifold_market_url, 'Proposal market URL should be updated.');
  console.log('testUpdateDetails: PASS');
}

async function testGetProposals() {
  console.log('Running: testGetProposals');
  await resetDatabase();
  await setupUser();

  const proposal1Data = { title: 'Proposal A', description: 'A', author_id: testUser.id };
  const proposal2Data = { title: 'Proposal B', description: 'B', author_id: testUser.id, status: 'open_for_voting' };
  createProposal(proposal1Data);
  createProposal(proposal2Data);

  const allProposals = getProposals();
  assert(Array.isArray(allProposals), 'getProposals should return an array.');
  assert.strictEqual(allProposals.length, 2, 'getProposals should return all created proposals.');
  // Check if titles are present (order might vary based on default sort in getProposals)
  assert(allProposals.some(p => p.title === 'Proposal A'), 'Proposal A not found in getProposals result.');
  assert(allProposals.some(p => p.title === 'Proposal B'), 'Proposal B not found in getProposals result.');

  const draftProposals = getProposals({ status: 'draft' });
  assert.strictEqual(draftProposals.length, 1, 'getProposals with status filter "draft" failed.');
  assert.strictEqual(draftProposals[0].title, 'Proposal A', 'Filtered draft proposal title mismatch.');

  console.log('testGetProposals: PASS');
}

async function runAllTests() {
  // Set NODE_ENV to test for the database to use in-memory
  process.env.NODE_ENV = 'test';

  try {
    await testCreateAndGetProposal();
    await testUpdateStatus();
    await testUpdateDetails();
    await testGetProposals();
    console.log('\nAll proposal database tests PASSED!');
  } catch (error) {
    console.error('\nTest FAILED:', error);
    process.exitCode = 1; // Indicate failure
  }
}

runAllTests();

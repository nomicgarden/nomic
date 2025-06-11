import assert from 'assert';
import {
  db,
  reinitializeDbForTest,
  createUser,
  findUserByUsername, // Needed for setupTestUser if user might exist
  createProposal,
  getProposalById, // For setupTestProposal verification
  createVote,
  getUserVoteForProposal,
  updateVote,
  getVotesByProposalId
} from './src/lib/server/database.js'; // Adjust path if this file is not in root

// Test Setup
let testUser1, testUser2, testProposal1;

async function resetDatabase() {
  // Ensure all relevant tables are dropped. Order matters due to foreign keys.
  // db.exec(`
  //   DROP TABLE IF EXISTS votes;
  //   DROP TABLE IF EXISTS proposals;
  //   DROP TABLE IF EXISTS users;
  // `);
  // initDb(db); // Pass the actual db instance
  // console.log('Test Database schema re-initialized (Users, Proposals, Votes).');
  // The reinitializeDbForTest function handles its own logging and table dropping/creation.
  reinitializeDbForTest();
}

async function setupTestUser(usernameSuffix = '', emailSuffix = '') {
  const username = `testuser${usernameSuffix}`;
  const email = `test${emailSuffix}@example.com`;
  try {
    const user = createUser(username, email, 'password123');
    assert(user && user.id, `Test user ${username} creation failed or did not return ID.`);
    console.log(`Test user ${username} created successfully.`);
    return user;
  } catch (e) {
    if (e.message.includes('UNIQUE constraint') || e.message.includes('already exists')) {
      console.log(`Test user ${username} already exists, fetching...`);
      const existingUser = findUserByUsername(username);
      assert(existingUser && existingUser.id, `Failed to fetch existing test user ${username}.`);
      return existingUser;
    }
    throw e;
  }
}

async function setupTestProposal(authorId, titleSuffix = '') {
  const proposalData = {
    title: `Test Proposal ${titleSuffix}`,
    description: `Description for test proposal ${titleSuffix}.`,
    author_id: authorId,
    status: 'open_for_voting' // Default to open for voting for vote tests
  };
  const proposal = createProposal(proposalData);
  assert(proposal && proposal.id, `Test proposal "${proposalData.title}" creation failed.`);
  console.log(`Test proposal "${proposalData.title}" created successfully.`);
  return proposal;
}

// Test Cases
async function testCreateAndGetUserVote() {
  console.log('Running: testCreateAndGetUserVote');
  await resetDatabase();
  testUser1 = await setupTestUser('Vote1');
  testProposal1 = await setupTestProposal(testUser1.id, 'VoteTest1');

  const voteData = {
    proposal_id: testProposal1.id,
    user_id: testUser1.id,
    vote_value: 'yes',
    rationale: 'I agree with this proposal.'
  };
  const createdVote = createVote(voteData);
  assert(createdVote && createdVote.id, 'createVote should return an object with an id.');
  assert.strictEqual(
    createdVote.proposal_id,
    voteData.proposal_id,
    'Created vote proposal_id mismatch.'
  );
  assert.strictEqual(createdVote.user_id, voteData.user_id, 'Created vote user_id mismatch.');
  assert.strictEqual(
    createdVote.vote_value,
    voteData.vote_value,
    'Created vote vote_value mismatch.'
  );
  assert.strictEqual(createdVote.rationale, voteData.rationale, 'Created vote rationale mismatch.');
  assert(createdVote.voted_at, 'Created vote should have a voted_at timestamp.');

  const fetchedVote = getUserVoteForProposal(testProposal1.id, testUser1.id);
  assert(fetchedVote, 'getUserVoteForProposal should fetch the created vote.');
  assert.strictEqual(fetchedVote.id, createdVote.id, 'Fetched vote ID mismatch.');
  assert.strictEqual(
    fetchedVote.vote_value,
    voteData.vote_value,
    'Fetched vote value mismatch after creation.'
  );

  // Test UNIQUE constraint: try to create the same vote again
  try {
    createVote(voteData); // Should throw
    assert.fail('Should have thrown an error for duplicate vote.');
  } catch (error) {
    assert(
      error.message.includes('User has already voted on this proposal.') ||
        error.code === 'SQLITE_CONSTRAINT_UNIQUE',
      `Expected UNIQUE constraint error, but got: ${error.message}`
    );
    console.log('Caught expected error for duplicate vote.');
  }
  console.log('testCreateAndGetUserVote: PASS');
}

async function testCreateVoteValidation() {
  console.log('Running: testCreateVoteValidation');
  await resetDatabase();
  testUser1 = await setupTestUser('CreateVoteValidationUser');
  testProposal1 = await setupTestProposal(testUser1.id, 'CreateVoteValidationProp');

  const invalidVoteValue = 'maybe_invalid';
  try {
    createVote({
      proposal_id: testProposal1.id,
      user_id: testUser1.id,
      vote_value: invalidVoteValue,
      rationale: 'Trying an invalid value.'
    });
    assert.fail('Should have thrown an error for invalid vote_value in createVote.');
  } catch (error) {
    assert(
      error.message.startsWith('Invalid vote_value:'),
      `Expected invalid vote_value error, but got: ${error.message}`
    );
    console.log('Caught expected error for invalid vote_value in createVote.');
  }

  const validVoteValues = ['yes', 'no', 'abstain'];
  // Need to ensure each vote is unique, either by different user or different proposal if testing multiple valid votes by same user.
  // For this test, let's use different users for simplicity to avoid UNIQUE constraint on (proposal_id, user_id).
  // Ensure unique email suffixes for each user.
  let userYes = await setupTestUser('ValidVoteUserYes', 'Yes');
  const voteYes = createVote({
    proposal_id: testProposal1.id,
    user_id: userYes.id,
    vote_value: 'yes',
    rationale: 'Valid yes vote.'
  });
  assert(voteYes && voteYes.id, 'Creating a "yes" vote should succeed.');

  let userNo = await setupTestUser('ValidVoteUserNo', 'No');
  const voteNo = createVote({
    proposal_id: testProposal1.id,
    user_id: userNo.id,
    vote_value: 'no',
    rationale: 'Valid no vote.'
  });
  assert(voteNo && voteNo.id, 'Creating a "no" vote should succeed.');

  let userAbstain = await setupTestUser('ValidVoteUserAbstain', 'Abstain');
  const voteAbstain = createVote({
    proposal_id: testProposal1.id,
    user_id: userAbstain.id,
    vote_value: 'abstain',
    rationale: 'Valid abstain vote.'
  });
  assert(voteAbstain && voteAbstain.id, 'Creating an "abstain" vote should succeed.');

  console.log('testCreateVoteValidation: PASS');
}

async function testUpdateVote() {
  console.log('Running: testUpdateVote');
  await resetDatabase();
  testUser1 = await setupTestUser('UpdateVoteUser');
  testProposal1 = await setupTestProposal(testUser1.id, 'UpdateVoteProp');

  const initialVoteData = {
    proposal_id: testProposal1.id,
    user_id: testUser1.id,
    vote_value: 'yes',
    rationale: 'Initial thought.'
  };
  const createdVote = createVote(initialVoteData);
  assert(createdVote && createdVote.id, 'Failed to create initial vote for update test.');
  const initialVotedAt = createdVote.voted_at;

  // Wait a bit to ensure timestamp changes - in a real scenario this might need more robust handling or specific DB time functions
  // Increased timeout to > 1s to ensure CURRENT_TIMESTAMP has a chance to change at second-granularity.
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const updatedVoteData = { vote_value: 'no', rationale: 'Changed my mind.' };
  const updateResult = updateVote(createdVote.id, updatedVoteData);
  assert(updateResult && updateResult.changes > 0, 'updateVote should indicate changes.');

  const fetchedVote = getUserVoteForProposal(testProposal1.id, testUser1.id);
  assert(fetchedVote, 'Failed to fetch vote after update.');
  assert.strictEqual(
    fetchedVote.vote_value,
    updatedVoteData.vote_value,
    'Vote value should be updated.'
  );
  assert.strictEqual(
    fetchedVote.rationale,
    updatedVoteData.rationale,
    'Vote rationale should be updated.'
  );
  assert.notStrictEqual(
    fetchedVote.voted_at,
    initialVotedAt,
    'Vote voted_at timestamp should be updated.'
  );
  console.log('testUpdateVote: PASS');
}

async function testUpdateVoteValidation() {
  console.log('Running: testUpdateVoteValidation');
  await resetDatabase();
  testUser1 = await setupTestUser('UpdateVoteValidationUser');
  testProposal1 = await setupTestProposal(testUser1.id, 'UpdateVoteValidationProp');

  const initialVote = createVote({
    proposal_id: testProposal1.id,
    user_id: testUser1.id,
    vote_value: 'yes',
    rationale: 'Initial vote for update validation.'
  });
  assert(initialVote && initialVote.id, 'Failed to create initial vote for update validation test.');

  const invalidVoteValue = 'maybe_again_invalid';
  try {
    updateVote(initialVote.id, { vote_value: invalidVoteValue, rationale: 'Trying to update to invalid.' });
    assert.fail('Should have thrown an error for invalid vote_value in updateVote.');
  } catch (error) {
    assert(
      error.message.startsWith('Invalid vote_value:'),
      `Expected invalid vote_value error for update, but got: ${error.message}`
    );
    console.log('Caught expected error for invalid vote_value in updateVote.');
  }

  const validVoteValues = ['yes', 'no', 'abstain'];
  for (const value of validVoteValues) {
    const updateResult = updateVote(initialVote.id, { vote_value: value, rationale: `Updating to ${value}` });
    assert(updateResult && updateResult.changes >= 0, `updateVote to ${value} should succeed or report no change.`);
    const fetched = getUserVoteForProposal(testProposal1.id, testUser1.id);
    assert.strictEqual(fetched.vote_value, value, `Vote value should be updated to ${value}.`);
  }
  console.log('testUpdateVoteValidation: PASS');
}

async function testGetVotesForProposal() {
  console.log('Running: testGetVotesForProposal');
  await resetDatabase();
  testUser1 = await setupTestUser('MultiVoteUser1', 'Multi1');
  testUser2 = await setupTestUser('MultiVoteUser2', 'Multi2');
  testProposal1 = await setupTestProposal(testUser1.id, 'MultiVoteProp');

  createVote({
    proposal_id: testProposal1.id,
    user_id: testUser1.id,
    vote_value: 'yes',
    rationale: 'User 1 agrees.'
  });
  createVote({
    proposal_id: testProposal1.id,
    user_id: testUser2.id,
    vote_value: 'no',
    rationale: 'User 2 disagrees.'
  });

  const allVotes = getVotesByProposalId(testProposal1.id);
  assert(Array.isArray(allVotes), 'getVotesByProposalId should return an array.');
  assert.strictEqual(
    allVotes.length,
    2,
    'getVotesByProposalId should return all votes for the proposal.'
  );

  const voteUser1 = allVotes.find((v) => v.user_id === testUser1.id);
  const voteUser2 = allVotes.find((v) => v.user_id === testUser2.id);

  assert(voteUser1, 'Vote from testUser1 not found.');
  assert.strictEqual(voteUser1.vote_value, 'yes', 'Vote value for testUser1 mismatch.');
  assert.strictEqual(
    voteUser1.voter_username,
    testUser1.username,
    'Voter username for testUser1 mismatch.'
  );

  assert(voteUser2, 'Vote from testUser2 not found.');
  assert.strictEqual(voteUser2.vote_value, 'no', 'Vote value for testUser2 mismatch.');
  assert.strictEqual(
    voteUser2.voter_username,
    testUser2.username,
    'Voter username for testUser2 mismatch.'
  );

  console.log('testGetVotesForProposal: PASS');
}

async function runAllTests() {
  process.env.NODE_ENV = 'test'; // Ensure DB is in-memory

  try {
    console.log('Starting Vote Database Tests...');
    await testCreateAndGetUserVote();
    await testCreateVoteValidation();
    await testUpdateVote();
    await testUpdateVoteValidation();
    await testGetVotesForProposal();
    console.log('\nAll vote database tests PASSED!');
  } catch (error) {
    console.error('\nTest FAILED:', error);
    process.exitCode = 1; // Indicate failure
  }
}

runAllTests();

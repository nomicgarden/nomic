import { error, fail, redirect } from '@sveltejs/kit';
import { getProposalById, getUserVoteForProposal, createVote, updateVote, getVotesByProposalId } from '$lib/server/database.js';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ params, locals }) {
  const proposalId = params.id;
  const currentUser = locals.user || null;
  let userVote = null;

  try {
    const proposal = getProposalById(proposalId);

    if (!proposal) {
      throw error(404, { message: 'Proposal not found' });
    }

    if (currentUser) {
      userVote = getUserVoteForProposal(proposalId, currentUser.id);
    }

    const allVotes = getVotesByProposalId(proposalId);
    let yesVotes = 0;
    let noVotes = 0;

    allVotes.forEach(vote => {
      if (vote.vote_value === 'yes') {
        yesVotes++;
      } else if (vote.vote_value === 'no') {
        noVotes++;
      }
    });

    const totalVotes = yesVotes + noVotes;
    const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;

    return {
      proposal,
      currentUser,
      userVote,
      voteResults: {
        yesVotes,
        noVotes,
        totalVotes,
        yesPercentage,
        noPercentage,
        allVotes
      }
    };
  } catch (dbError) {
    console.error(`Failed to load proposal ${proposalId}, user vote, or all votes:`, dbError);
    throw error(500, { message: 'Failed to load proposal data due to a server error.' });
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  castVote: async ({ request, locals, params }) => {
    const currentUser = locals.user; // Renamed for clarity to match load function
    if (!currentUser) {
      return fail(401, { voteError: 'You must be logged in to vote.' });
    }

    const formData = await request.formData();
    const vote_value = formData.get('vote_value')?.toString();
    const rationale = formData.get('rationale')?.toString() || null;

    // Validate vote_value
    if (!vote_value || !['yes', 'no'].includes(vote_value)) { // Assuming 'yes' and 'no' are the only valid values for now
      return fail(400, { voteError: 'Invalid vote value submitted.', vote_value, rationale });
    }

    const proposalIdStr = params.id; // This is a string
    const proposalId = Number(proposalIdStr);


    try {
      const proposal = getProposalById(proposalId);
      if (!proposal) {
        return fail(404, { voteError: 'Proposal not found.' });
      }

      // IMPORTANT: Check proposal status.
      // This logic is crucial for ensuring votes are only cast when a proposal is in the correct state.
      // The actual list of proposal statuses and their transition logic (e.g., from 'open_for_voting'
      // to 'voting_closed', then to 'accepted' or 'rejected') is managed externally or by admin actions
      // for this phase of development (see conceptual notes in database.js).
      if (proposal.status !== 'open_for_voting') {
        return fail(403, { voteError: `Voting is not currently open for this proposal. Status is: ${proposal.status}` });
      }

      const userId = currentUser.id;
      const existingVote = getUserVoteForProposal(proposalId, userId);

      let result;
      if (existingVote) {
        // User is changing their vote
        result = updateVote(existingVote.id, { vote_value, rationale });
        console.log(`User ${userId} changed vote to ${vote_value} for proposal ${proposalId}`);
      } else {
        // New vote
        result = createVote({
          proposal_id: proposalId,
          user_id: userId,
          vote_value,
          rationale
        });
        console.log(`User ${userId} cast new vote ${vote_value} for proposal ${proposalId}`);
      }

      // Successfully cast or updated vote, redirect to refresh the page.
      // SvelteKit's redirect will be caught by the browser and cause a GET request.
      throw redirect(303, `/proposals/${proposalIdStr}?vote_success=true`);

    } catch (dbError) {
      console.error('Vote casting database error:', dbError);
      // Check for UNIQUE constraint error specifically if it's a createVote that should have been an update
      // This scenario implies a race condition or an unexpected state if existingVote was null but DB has a vote.
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE' && !existingVote) {
         return fail(409, { voteError: 'You have already voted on this proposal. If you meant to change your vote, please try again.', vote_value, rationale});
      }
      return fail(500, { voteError: dbError.message || 'Failed to cast vote due to a server error. Please try again.' });
    }
  }
};

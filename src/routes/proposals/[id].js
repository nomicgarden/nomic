import { error } from '@sveltejs/kit';
import { getProposalById } from '$lib/server/database.js';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ params, locals }) {
  // params.id will be a string, ensure it's a number for database query if necessary,
  // though better-sqlite3 might handle it. getProposalById now does Number(id).
  const proposalId = params.id;

  try {
    const proposal = getProposalById(proposalId);

    if (!proposal) {
      throw error(404, { message: 'Proposal not found' });
    }

    // The `proposal` object now includes `author_username` due to the JOIN in getProposalById.
    // `locals.user` (the currently logged-in user) can be passed if needed for conditional UI
    // (e.g., show edit button if locals.user.id === proposal.author_id).
    // For now, just returning the proposal is sufficient for viewing.
    return {
      proposal,
      currentUser: locals.user || null // Pass current user for any conditional UI
    };
  } catch (dbError) {
    // Catch errors from getProposalById (e.g., database connection issues)
    console.error(`Failed to load proposal ${proposalId}:`, dbError);
    throw error(500, { message: 'Failed to load proposal due to a server error.' });
  }
}

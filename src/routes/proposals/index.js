import { error } from '@sveltejs/kit';
import { getProposals } from '$lib/server/database.js';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ locals }) {
  try {
    // Fetch all proposals by default.
    // Options can be added here if filtering is implemented on the page, e.g., getProposals({ status: 'proposed' })
    const proposals = getProposals();

    return {
      proposals,
      currentUser: locals.user || null // Pass current user for conditional UI (e.g., "Create New Proposal" button)
    };
  } catch (dbError) {
    console.error('Failed to load proposals list:', dbError);
    // Using SvelteKit's error helper to render a standard error page
    throw error(500, { message: 'Failed to load proposals due to a server error.' });
  }
}

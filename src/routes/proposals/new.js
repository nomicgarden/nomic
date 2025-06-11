import { redirect, fail } from '@sveltejs/kit';
import { createProposal } from '$lib/server/database.js';

/** @type {import('@sveltejs/kit').ServerLoad} */
export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/auth/login?redirectTo=/proposals/new');
  }
  // Pass the user data if needed by the page for display purposes,
  // though $page.data.user should already be available from the root layout.
  return {
    user: locals.user
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'You must be logged in to create a proposal.' });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString()?.trim();
    const description = formData.get('description')?.toString()?.trim();
    const proposed_rule_text = formData.get('proposed_rule_text')?.toString()?.trim();
    // manifold_market_url is optional, can be added later if needed in the form
    // const manifold_market_url = formData.get('manifold_market_url')?.toString()?.trim();

    const errors = {};
    if (!title) {
      errors.title = 'Title is required.';
    }
    if (!description) {
      errors.description = 'Description is required.';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { title, description, proposed_rule_text }
      });
    }

    const author_id = locals.user.id;

    try {
      const newProposal = createProposal({
        title,
        description,
        author_id,
        proposed_rule_text: proposed_rule_text || null, // Ensure null if empty
        status: 'draft' // Default status for new proposals
        // manifold_market_url: manifold_market_url || null
      });

      if (newProposal && newProposal.id) {
        // Redirect to the newly created proposal's page
        throw redirect(303, `/proposals/${newProposal.id}`);
      } else {
        // This case should ideally not be hit if createProposal throws an error on failure
        // or returns an object without an id.
        return fail(500, {
          error: 'Failed to create proposal. Received unexpected result from database.',
          values: { title, description, proposed_rule_text }
        });
      }
    } catch (error) {
      console.error('Error in create proposal action:', error);
      return fail(500, {
        error: error.message || 'An unexpected error occurred while creating the proposal.',
        values: { title, description, proposed_rule_text }
      });
    }
  }
};

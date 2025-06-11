import { error, redirect, fail } from '@sveltejs/kit';
import { getProposalById, updateProposalDetails } from '$lib/server/database.js';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ params, locals }) {
  const proposalId = params.id;
  const user = locals.user;

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=/proposals/${proposalId}/edit`);
  }

  const proposal = getProposalById(proposalId);

  if (!proposal) {
    throw error(404, 'Proposal not found');
  }

  if (user.id !== proposal.author_id) {
    throw error(403, 'You are not authorized to edit this proposal.');
  }

  if (proposal.status !== 'draft') {
    throw error(403, 'This proposal cannot be edited as it is not in draft status.');
  }

  return {
    proposal // Pass the proposal data to the Svelte page
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, params, locals }) => {
    const proposalId = params.id;
    const user = locals.user;

    if (!user) {
      return fail(401, { error: 'You must be logged in to edit proposals.' });
    }

    // Fetch the proposal again to ensure it exists and to check current status/author
    const currentProposal = getProposalById(proposalId);
    if (!currentProposal) {
      return fail(404, { error: 'Proposal not found.' });
    }

    if (user.id !== currentProposal.author_id) {
      return fail(403, { error: 'You are not authorized to edit this proposal.' });
    }

    if (currentProposal.status !== 'draft') {
      return fail(403, { error: 'This proposal cannot be edited as it is no longer in draft status.' });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString()?.trim();
    const description = formData.get('description')?.toString()?.trim();
    const proposed_rule_text = formData.get('proposed_rule_text')?.toString(); // Allow empty, will be nullified by DB function if empty
    const manifold_market_url = formData.get('manifold_market_url')?.toString()?.trim();

    const formValues = { title, description, proposed_rule_text, manifold_market_url };

    // Validation
    const errors = {};
    if (!title) {
      errors.title = 'Title is required.';
    }
    if (!description) {
      errors.description = 'Description is required.';
    }
    // Basic URL validation for manifold_market_url if provided
    if (manifold_market_url) {
        try {
            new URL(manifold_market_url);
        } catch (_) {
            errors.manifold_market_url = 'Invalid URL format for Manifold Market.';
        }
    }


    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, values: formValues });
    }

    try {
      const updateData = {
        title,
        description,
        proposed_rule_text: proposed_rule_text || null, // Ensure null if empty string was submitted and DB expects null
        manifold_market_url: manifold_market_url || null,
      };

      const result = updateProposalDetails(proposalId, updateData);

      if (result.changes > 0) {
        throw redirect(303, `/proposals/${proposalId}`);
      } else if (result.changes === 0 && !result.message) {
         // No changes were made, but no explicit error. Could be same data submitted.
         // Redirecting back is often fine, or return a specific message.
         // For simplicity, we'll consider this a "soft" success.
         throw redirect(303, `/proposals/${proposalId}?notice=no_changes`);
      } else {
        // Handle cases like "No valid or changed fields provided for update." from DB function
        return fail(400, { error: result.message || 'No changes were applied.', values: formValues });
      }
    } catch (e) {
      console.error('Error updating proposal:', e);
      return fail(500, { error: e.message || 'Failed to update proposal.', values: formValues });
    }
  }
};

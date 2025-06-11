<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores'; // For potential query params like ?notice=no_changes

  export let data; // From load function: { proposal }
  export let form; // From form action submission

  const { proposal } = data;

  let submitting = false;

  // Initialize form values from the loaded proposal data,
  // or from `form.values` if an action returned validation errors.
  let title = form?.values?.title || proposal.title || '';
  let description = form?.values?.description || proposal.description || '';
  let proposed_rule_text = form?.values?.proposed_rule_text || proposal.proposed_rule_text || '';
  let manifold_market_url = form?.values?.manifold_market_url || proposal.manifold_market_url || '';

  // Update local variables if form data (from server after validation) changes
  $: {
    title = form?.values?.title !== undefined ? form.values.title : title;
    description = form?.values?.description !== undefined ? form.values.description : description;
    proposed_rule_text = form?.values?.proposed_rule_text !== undefined ? form.values.proposed_rule_text : proposed_rule_text;
    manifold_market_url = form?.values?.manifold_market_url !== undefined ? form.values.manifold_market_url : manifold_market_url;
  }

  // Clear field-specific errors when user types
  $: if (title && form?.errors?.title) form.errors.title = null;
  $: if (description && form?.errors?.description) form.errors.description = null;
  $: if (manifold_market_url && form?.errors?.manifold_market_url) form.errors.manifold_market_url = null;

</script>

<svelte:head>
  <title>Edit Proposal: {proposal.title}</title>
</svelte:head>

<div class="edit-proposal-container">
  <h1>Edit Proposal: "{proposal.title}"</h1>

  {#if $page.url.searchParams.get('notice') === 'no_changes'}
    <p class="notice-message global-notice">
      No changes were detected in your submission. The proposal remains the same.
    </p>
  {/if}

  {#if form?.error && !form?.errors}
    <p class="error-message global-error">{form.error}</p>
  {/if}

  <form method="POST" use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update();
      submitting = false;
    };
  }}>
    <div class="form-group">
      <label for="title">Proposal Title</label>
      <input type="text" id="title" name="title" bind:value={title} required
             aria-describedby={form?.errors?.title ? 'title-error' : undefined} />
      {#if form?.errors?.title}
        <p id="title-error" class="error-message field-error">{form.errors.title}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="description">Detailed Description</label>
      <textarea id="description" name="description" rows="10" bind:value={description} required
                aria-describedby={form?.errors?.description ? 'description-error' : undefined}></textarea>
      {#if form?.errors?.description}
        <p id="description-error" class="error-message field-error">{form.errors.description}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="proposed_rule_text">Proposed Rule Text (Optional)</label>
      <p class="label-description">
        If this proposal involves adding or changing a specific rule, enter the exact proposed text here.
      </p>
      <textarea id="proposed_rule_text" name="proposed_rule_text" rows="7" bind:value={proposed_rule_text}></textarea>
      {#if form?.errors?.proposed_rule_text}
        <p id="proposed_rule_text-error" class="error-message field-error">{form.errors.proposed_rule_text}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="manifold_market_url">Manifold Market URL (Optional)</label>
      <input type="url" id="manifold_market_url" name="manifold_market_url" bind:value={manifold_market_url}
             placeholder="https://manifold.markets/..."
             aria-describedby={form?.errors?.manifold_market_url ? 'manifold_market_url-error' : undefined} />
      {#if form?.errors?.manifold_market_url}
        <p id="manifold_market_url-error" class="error-message field-error">{form.errors.manifold_market_url}</p>
      {/if}
    </div>

    <div class="form-actions">
      <a href="/proposals/{proposal.id}" class="button cancel-button">Cancel</a>
      <button type="submit" disabled={submitting} class="button save-button">
        {#if submitting}Saving Changes...{:else}Save Changes{/if}
      </button>
    </div>
  </form>
</div>

<style>
  .edit-proposal-container {
    max-width: 750px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.8rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  .label-description {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.5rem;
    margin-top: -0.25rem;
  }

  input[type="text"],
  input[type="url"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
    line-height: 1.5;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  input:focus,
  textarea:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    display: inline-block;
  }

  .save-button {
    background-color: #007bff; /* Blue for save */
    color: white;
    transition: background-color 0.2s ease;
  }
  .save-button:hover {
    background-color: #0056b3;
  }
  .save-button:disabled {
    background-color: #a0cfff;
    cursor: not-allowed;
  }

  .cancel-button {
    background-color: #6c757d; /* Gray for cancel */
    color: white;
    transition: background-color 0.2s ease;
  }
  .cancel-button:hover {
    background-color: #545b62;
  }

  .error-message {
    color: #d9534f;
    font-size: 0.875rem;
  }
  .field-error {
     margin-top: 0.25rem;
     padding: 0.25rem 0.5rem;
     background-color: #fddede;
     border-left: 3px solid #d9534f;
  }
  .global-error {
    padding: 0.75rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  .global-notice {
    padding: 0.75rem;
    background-color: #d1ecf1; /* Bootstrap's alert-info background */
    border: 1px solid #bee5eb; /* Bootstrap's alert-info border */
    color: #0c5460; /* Bootstrap's alert-info text */
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
</style>

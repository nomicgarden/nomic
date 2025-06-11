<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores'; // For accessing $page.data.user if needed, and form action data via `form` prop

  export let form; // Action data from server (errors, values)

  let submitting = false;

  // Initialize form values from `form?.values` if they exist (e.g., after server validation error)
  let title = form?.values?.title || '';
  let description = form?.values?.description || '';
  let proposed_rule_text = form?.values?.proposed_rule_text || '';

  // Update local variables when form data changes
  $: {
    title = form?.values?.title || title || '';
    description = form?.values?.description || description || '';
    proposed_rule_text = form?.values?.proposed_rule_text || proposed_rule_text || '';
  }

  // Reactive statement to clear field-specific errors when user types
  $: if (title && form?.errors?.title) form.errors.title = null;
  $: if (description && form?.errors?.description) form.errors.description = null;

</script>

<svelte:head>
  <title>New Proposal</title>
</svelte:head>

<div class="new-proposal-container">
  <h1>Create New Proposal</h1>

  {#if $page.data.user}
    <p class="user-info">
      You are creating a proposal as: <strong>{$page.data.user.username}</strong>
    </p>
  {:else}
    <!-- This should not typically be shown due to the load function redirect -->
    <p class="error-message global-error">
      You must be logged in to create a proposal. <a href="/auth/login?redirectTo=/proposals/new">Login here</a>.
    </p>
  {/if}

  {#if form?.error && !form?.errors}
    <p class="error-message global-error">{form.error}</p>
  {/if}

  <form method="POST" use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update(); // This will update `form`
      submitting = false;
      // If successful (no specific errors after update), SvelteKit's redirect in action will take over.
      // If there are errors, they will be in `form.errors` or `form.error`.
    };
  }}>
    <div class="form-group">
      <label for="title">Proposal Title</label>
      <input type="text" id="title" name="title" bind:value={title} required
             aria-describedby={form?.errors?.title ? "title-error" : undefined} />
      {#if form?.errors?.title}
        <p id="title-error" class="error-message field-error">{form.errors.title}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="description">Detailed Description</label>
      <textarea id="description" name="description" rows="8" bind:value={description} required
                aria-describedby={form?.errors?.description ? "description-error" : undefined}></textarea>
      {#if form?.errors?.description}
        <p id="description-error" class="error-message field-error">{form.errors.description}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="proposed_rule_text">Proposed Rule Text (Optional)</label>
      <p class="label-description">
        If this proposal involves adding or changing a specific rule, enter the exact proposed text here.
      </p>
      <textarea id="proposed_rule_text" name="proposed_rule_text" rows="5" bind:value={proposed_rule_text}></textarea>
      {#if form?.errors?.proposed_rule_text}
        <!-- Though not explicitly validated on server yet, good for future -->
        <p id="proposed_rule_text-error" class="error-message field-error">{form.errors.proposed_rule_text}</p>
      {/if}
    </div>

    <!-- Optional: Manifold Market URL (can be added later) -->
    <!--
    <div class="form-group">
      <label for="manifold_market_url">Manifold Market URL (Optional)</label>
      <input type="url" id="manifold_market_url" name="manifold_market_url" />
    </div>
    -->

    <button type="submit" disabled={submitting || !$page.data.user}>
      {#if submitting}Submitting...{:else}Submit Proposal{/if}
    </button>
  </form>
</div>

<style>
  .new-proposal-container {
    max-width: 700px;
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
  }

  .user-info {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background-color: #e7f3ff;
    border: 1px solid #b3d7ff;
    color: #004085;
    border-radius: 4px;
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
  }

  input:focus,
  textarea:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  button[type="submit"] {
    width: 100%;
    padding: 0.85rem;
    background-color: #28a745; /* Green for submit */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button[type="submit"]:hover {
    background-color: #218838; /* Darker green */
  }

  button[type="submit"]:disabled {
    background-color: #94d3a2; /* Lighter green when disabled */
    cursor: not-allowed;
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
</style>

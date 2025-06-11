<script>
  export let data; // Received from the load function in [id].js

  const { proposal, currentUser } = data;

  // Function to format date string (basic example)
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  }
</script>

<svelte:head>
  <title>Proposal: {proposal.title}</title>
</svelte:head>

<div class="proposal-view-container">
  <header class="proposal-header">
    <h1>{proposal.title}</h1>
    <p class="meta-info">
      Proposed by <span class="author">{@html proposal.author_username || 'Unknown User'}</span> on
      <span class="date">{formatDate(proposal.created_at)}</span>
    </p>
    <p class="status">Current Status: <span class="status-badge status-{proposal.status.toLowerCase()}">{proposal.status}</span></p>
  </header>

  <section class="proposal-body">
    <h2>Description</h2>
    <div class="description-content">
      {@html proposal.description.replace(/\n/g, '<br />') || 'No description provided.'}
    </div>

    {#if proposal.proposed_rule_text}
      <h2>Proposed Rule Text</h2>
      <pre class="rule-text-box">{@html proposal.proposed_rule_text}</pre>
    {/if}

    {#if proposal.manifold_market_url}
      <h2>Manifold Market</h2>
      <p>
        Track or participate in the prediction market for this proposal:
        <a href={proposal.manifold_market_url} target="_blank" rel="noopener noreferrer" class="manifold-link">
          {proposal.manifold_market_url}
        </a>
      </p>
    {/if}
  </section>

  {#if currentUser && proposal.author_id === currentUser.id && proposal.status === 'draft'}
  <div class="proposal-actions">
    <a href="/proposals/{proposal.id}/edit" class="button edit-button">Edit Proposal</a>
  </div>
  {/if}

</div>

<style>
  .proposal-view-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .proposal-header {
    border-bottom: 2px solid #eee;
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .proposal-header h1 {
    font-size: 2.2rem;
    color: #333;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .meta-info {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 0.5rem;
  }
  .meta-info .author {
    font-weight: bold;
    color: #0056b3; /* Link-like color for author */
  }
  .meta-info .date {
    font-style: italic;
  }

  .status {
    font-size: 1rem;
    color: #333;
  }
  .status-badge {
    display: inline-block;
    padding: 0.3em 0.6em;
    font-size: 0.9em;
    font-weight: bold;
    border-radius: 0.25em;
    color: #fff;
    text-transform: capitalize;
  }
  .status-draft { background-color: #6c757d; } /* Gray */
  .status-proposed { background-color: #007bff; } /* Blue */
  .status-active { background-color: #28a745; } /* Green */
  .status-rejected { background-color: #dc3545; } /* Red */
  .status-implemented { background-color: #17a2b8; } /* Teal */


  .proposal-body h2 {
    font-size: 1.5rem;
    color: #444;
    margin-top: 2rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.5rem;
  }

  .description-content {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #333;
    white-space: pre-wrap; /* Preserve line breaks from description */
  }

  .rule-text-box {
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.95rem;
    white-space: pre-wrap; /* Preserve line breaks and spacing */
    overflow-x: auto; /* Allow horizontal scrolling if text is too wide */
  }

  .manifold-link {
    color: #007bff;
    text-decoration: none;
    word-break: break-all; /* Break long URLs */
  }
  .manifold-link:hover {
    text-decoration: underline;
  }

  .proposal-actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
    text-align: right;
  }
  .button.edit-button {
    background-color: #ffc107; /* Yellow for edit */
    color: #212529;
    padding: 0.6rem 1.2rem;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
  }
  .button.edit-button:hover {
    background-color: #e0a800;
  }

</style>

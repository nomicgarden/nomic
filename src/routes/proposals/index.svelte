<script>
  export let data;
  const { proposals, currentUser } = data;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  }
</script>

<svelte:head>
  <title>Proposals</title>
</svelte:head>

<div class="proposals-list-container">
  <header class="list-header">
    <h1>All Proposals</h1>
    {#if currentUser}
      <a href="/proposals/new" class="button new-proposal-button">Create New Proposal</a>
    {:else}
      <p><a href="/auth/login?redirectTo=/proposals/new">Login</a> to create a proposal.</p>
    {/if}
  </header>

  {#if proposals && proposals.length > 0}
    <ul class="proposals-list">
      {#each proposals as proposal (proposal.id)}
        <li class="proposal-item">
          <a href="/proposals/{proposal.id}" class="proposal-link">
            <h2 class="proposal-title">{proposal.title}</h2>
          </a>
          <p class="proposal-meta">
            By: <span class="author">{proposal.author_username || 'Unknown'}</span> |
            Status: <span class="status-badge status-{proposal.status.toLowerCase()}">{proposal.status}</span> |
            Created: <span class="date">{formatDate(proposal.created_at)}</span>
          </p>
          <p class="proposal-description-excerpt">
            {proposal.description.substring(0, 150)}{proposal.description.length > 150 ? '...' : ''}
          </p>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-proposals-message">
      No proposals have been submitted yet.
      {#if currentUser}Be the first to <a href="/proposals/new">create one</a>!{/if}
    </p>
  {/if}
</div>

<style>
  .proposals-list-container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem 2rem; /* Adjusted padding */
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
  }

  .list-header h1 {
    font-size: 2rem;
    color: #333;
  }

  .new-proposal-button {
    background-color: #28a745;
    color: white;
    padding: 0.6rem 1.2rem;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .new-proposal-button:hover {
    background-color: #218838;
  }

  .list-header p a {
    color: #007bff;
  }

  .proposals-list {
    list-style: none;
    padding: 0;
  }

  .proposal-item {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s ease-in-out;
  }

  .proposal-item:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .proposal-link {
    text-decoration: none;
  }

  .proposal-title {
    font-size: 1.6rem;
    color: #0056b3; /* Darker blue for link */
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  .proposal-link:hover .proposal-title {
    text-decoration: underline;
  }

  .proposal-meta {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.75rem;
  }
  .proposal-meta .author {
    font-weight: 500;
  }
  .proposal-meta .date {
    font-style: italic;
  }
  .status-badge {
    display: inline-block;
    padding: 0.2em 0.5em;
    font-size: 0.8em;
    font-weight: bold;
    border-radius: 0.25em;
    color: #fff;
    text-transform: capitalize;
  }
  .status-draft { background-color: #6c757d; } /* Gray */
  .status-pending_review { background-color: #ffc107; color: #212529;} /* Yellow, dark text */
  .status-open_for_voting { background-color: #007bff; } /* Blue */
  .status-voting_closed { background-color: #fd7e14; } /* Orange */
  .status-accepted { background-color: #28a745; } /* Green */
  .status-rejected { background-color: #dc3545; } /* Red */
  .status-implemented { background-color: #17a2b8; } /* Teal */
  .status-archived { background-color: #f8f9fa; color: #6c757d; border: 1px solid #6c757d;} /* Light gray, dark text */


  .proposal-description-excerpt {
    font-size: 1rem;
    color: #444;
    line-height: 1.6;
  }

  .no-proposals-message {
    text-align: center;
    font-size: 1.1rem;
    color: #555;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 6px;
  }
  .no-proposals-message a {
    color: #007bff;
    font-weight: 500;
  }
</style>

<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores'; // To read query params like ?vote_success=true
  export let data; // Received from the load function in [id].js
  export let form; // From the castVote form action

  const { proposal, currentUser, userVote, voteResults } = data; // voteResults is now available

  let submittingVote = false;
  let currentVoteValue = userVote?.vote_value || '';
  let currentRationale = userVote?.rationale || '';

  // Update local state if form action returns values (e.g. on error)
  // or if userVote data changes (e.g. after successful vote and page reload)
  $: currentVoteValue = form?.vote_value || userVote?.vote_value || '';
  $: currentRationale = form?.rationale || userVote?.rationale || '';


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

  <!-- Status Specific Messages & Admin Actions -->
  <section class="status-actions-section">
    {#if proposal.status === 'draft'}
      <p class="status-message info-message">This proposal is currently a draft and not yet open for voting.</p>
      {#if currentUser && proposal.author_id === currentUser.id}
        <div class="admin-actions">
          <a href="/proposals/{proposal.id}/edit" class="button edit-button">Edit Proposal</a>
          <!-- Placeholder for a "Submit for Review" button or similar -->
          <!-- <button class="button submit-review-button">Submit for Review</button> -->
        </div>
      {/if}
    {:else if proposal.status === 'pending_review'}
      <p class="status-message info-message">This proposal is pending review before voting can begin.</p>
    {:else if proposal.status === 'open_for_voting'}
      {#if currentUser}
        <div class="voting-section"> <!-- Moved voting form here -->
          <h2>Cast Your Vote</h2>
          <form method="POST" action="?/castVote" use:enhance={() => {
            submittingVote = true;
            return async ({ update }) => {
              await update();
              submittingVote = false;
            };
          }}>
            <div class="vote-options">
              <label class="vote-label {currentVoteValue === 'yes' ? 'selected' : ''}">
                <input type="radio" name="vote_value" value="yes" bind:group={currentVoteValue} /> Yes
              </label>
              <label class="vote-label {currentVoteValue === 'no' ? 'selected' : ''}">
                <input type="radio" name="vote_value" value="no" bind:group={currentVoteValue} /> No
              </label>
            </div>
            <div class="form-group rationale-group">
              <label for="rationale">Rationale (Optional)</label>
              <textarea id="rationale" name="rationale" rows="3" placeholder="Explain your vote..." bind:value={currentRationale}></textarea>
            </div>
            {#if form?.voteError}
              <p class="error-message global-error">{form.voteError}</p>
            {/if}
            {#if $page.url.searchParams.get('vote_success') === 'true' && !form?.voteError && !$page.error}
               <p class="success-message global-success">Your vote has been recorded!</p>
            {/if}
            <button type="submit" class="button vote-submit-button" disabled={submittingVote || !currentVoteValue}>
              {#if submittingVote}Submitting...{:else if userVote?.id && (userVote?.vote_value === currentVoteValue) && (userVote?.rationale === currentRationale)}Vote Submitted (No Changes){:else if userVote?.id}Update Vote{:else}Submit Vote{/if}
            </button>
          </form>
        </div>
      {:else}
         <p class="status-message info-message">Voting is open for this proposal. Please <a href="/auth/login?redirectTo={$page.url.pathname}">login</a> to cast your vote.</p>
      {/if}
    {:else if proposal.status === 'voting_closed'}
      <p class="status-message info-message">Voting has ended for this proposal. Results are being tallied or awaiting final decision.</p>
    {:else if proposal.status === 'accepted'}
      <p class="status-message success-message outcome-message">Outcome: Accepted</p>
    {:else if proposal.status === 'rejected'}
      <p class="status-message error-message outcome-message">Outcome: Rejected</p>
    {:else if proposal.status === 'implemented'}
      <p class="status-message success-message outcome-message">Status: Implemented</p>
    {:else if proposal.status === 'archived'}
      <p class="status-message info-message">This proposal has been archived.</p>
    {/if}
  </section>

  <!-- Vote Results Section - Display if there are votes OR if voting is closed/accepted/rejected to show final tally -->
  {#if voteResults && (voteResults.totalVotes > 0 || ['voting_closed', 'accepted', 'rejected', 'implemented'].includes(proposal.status))}
  <section class="vote-results-section">
    <h2>Vote Tally</h2>
    <div class="vote-summary">
      <p><strong>Total Votes:</strong> {voteResults.totalVotes}</p>
      <div class="vote-bar-container">
        <div class="vote-bar yes-bar" style="width: {voteResults.yesPercentage}%" title="Yes: {voteResults.yesPercentage.toFixed(1)}% ({voteResults.yesVotes})">
          {voteResults.yesVotes > 0 ? `${voteResults.yesPercentage.toFixed(0)}%` : ''}
        </div>
        <div class="vote-bar no-bar" style="width: {voteResults.noPercentage}%" title="No: {voteResults.noPercentage.toFixed(1)}% ({voteResults.noVotes})">
          {voteResults.noVotes > 0 ? `${voteResults.noPercentage.toFixed(0)}%` : ''}
        </div>
      </div>
      <p><span class="yes-text">Yes:</span> {voteResults.yesVotes} ({voteResults.yesPercentage.toFixed(1)}%)</p>
      <p><span class="no-text">No:</span> {voteResults.noVotes} ({voteResults.noPercentage.toFixed(1)}%)</p>
    </div>

    {#if voteResults.allVotes && voteResults.allVotes.length > 0}
      <div class="detailed-votes">
        <h3>Detailed Votes:</h3>
        <ul>
          {#each voteResults.allVotes as vote (vote.id)}
            <li>
              <strong>{vote.voter_username}:</strong>
              <span class="vote-value-{vote.vote_value.toLowerCase()}">{vote.vote_value}</span>
              {#if vote.rationale}<p class="rationale-text"><em>"{vote.rationale}"</em></p>{/if}
              <span class="vote-timestamp">({formatDate(vote.voted_at)})</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </section>
  {:else if proposal.status === 'open_for_voting' || proposal.status === 'voting_closed' || proposal.status === 'accepted' || proposal.status === 'rejected'}
    <section class="vote-results-section">
      <h2>Current Vote Tally</h2>
      <p>No votes have been cast yet for this proposal.</p>
    </section>
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

  .status-actions-section, .vote-results-section { /* Combined common styles */
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  .admin-actions {
    text-align: right;
    margin-top: 1rem; /* Space above admin buttons if status message is also present */
  }

  .voting-section h2, .vote-results-section h2 { /* Specific h2 for these sections */
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .vote-options {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .vote-label {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.2rem;
    border: 2px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    font-size: 1rem;
  }
  .vote-label input[type="radio"] {
    margin-right: 0.5em;
    accent-color: #007bff; /* Modern way to color radio buttons */
  }
  .vote-label:hover {
    border-color: #007bff;
  }
  .vote-label.selected {
    background-color: #e7f3ff;
    border-color: #007bff;
    font-weight: bold;
  }

  .form-group.rationale-group { /* This class is part of voting form */
    margin-bottom: 1rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: 500;
    color: #555;
  }

  textarea[name="rationale"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
    line-height: 1.5;
    resize: vertical;
    min-height: 60px;
  }

  .vote-submit-button {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    /* Ensure .button common styles are applied if this is used alongside .button */
  }
  .vote-submit-button:hover {
    background-color: #0056b3;
  }
  .vote-submit-button:disabled {
    background-color: #a0cfff;
    cursor: not-allowed;
  }

  .vote-summary {
    margin-bottom: 1.5rem;
  }
  .vote-summary p {
    margin: 0.3rem 0;
    font-size: 1rem;
  }
  .vote-bar-container {
    display: flex;
    height: 24px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin: 0.5rem 0;
  }
  .vote-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    transition: width 0.3s ease-in-out;
  }
  .yes-bar { background-color: #28a745; }
  .no-bar { background-color: #dc3545; }
  .yes-text { color: #28a745; font-weight: bold; }
  .no-text { color: #dc3545; font-weight: bold; }

  .detailed-votes ul {
    list-style-type: none;
    padding-left: 0;
  }
  .detailed-votes li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .detailed-votes li:last-child {
    border-bottom: none;
  }
  .vote-value-yes { color: #28a745; font-weight: bold; }
  .vote-value-no { color: #dc3545; font-weight: bold; }
  .rationale-text {
    font-size: 0.9rem;
    color: #555;
    margin-left: 1em;
    padding: 0.3em 0;
    white-space: pre-wrap;
  }
  .vote-timestamp {
    font-size: 0.8rem;
    color: #777;
    margin-left: 0.5em;
  }

  .status-message {
    padding: 0.8rem 1.2rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    font-size: 1.05rem;
    text-align: center;
  }
  .info-message {
    background-color: #e7f3ff; /* Light blue for info */
    border: 1px solid #b3d7ff;
    color: #004085;
  }
  .outcome-message { /* For accepted/rejected, can be more prominent */
    font-weight: bold;
    font-size: 1.1rem;
  }
  .success-message.outcome-message { /* For 'Accepted' or 'Implemented' */
     background-color: #d4edda;
     border-color: #c3e6cb;
     color: #155724;
  }
  .error-message.outcome-message { /* For 'Rejected' */
     background-color: #f8d7da;
     border-color: #f5c6cb;
     color: #721c24;
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

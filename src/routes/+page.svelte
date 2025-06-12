<script>
import { onMount } from "svelte";
import { apiData, drinkNames } from './store.js';

onMount(async () => {
  fetch("https://manifold.markets/api/v0/group/by-id/vAEfB4ijB8QlYdDYetaN/markets")
  .then(response => response.json())
  .then(data => {
		console.log(data);
    apiData.set(data);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>
<main>
<div class="feature-links">
  <h2>Explore Nomic Garden Features</h2>

  <div class="feature-card">
    <h3>User Authentication & Profiles</h3>
    <p>Manage your account, view your activity, and customize your profile.</p>
    <ul>
      <li><a href="/auth/login">Login / Register</a></li>
      <li><a href="/profile/me">Your Profile</a></li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>Proposal System</h3>
    <p>Participate in the governance of Nomic Garden. View existing proposals or create your own.</p>
    <ul>
      <li><a href="/proposals">View Proposals</a></li>
      <li><a href="/proposals/new">Create a New Proposal</a></li>
    </ul>
  </div>

  <div class="feature-card">
    <h3>Voting Mechanism</h3>
    <p>Make your voice heard by voting on active proposals and shaping the future of the garden.</p>
    <ul>
      <li><a href="/proposals">View Active Polls & Vote</a></li>
    </ul>
  </div>
</div>
    <h1>Open Questions</h1>
    <div class="flex">
    {#each $drinkNames as {isResolved, url, question}}
    {#if !isResolved}
    <iframe src={url} title={question}></iframe>
    {/if}
    {/each}
    </div>
    <h1>Resolved Questions</h1>
    <div class="flex">
    {#each $drinkNames as {isResolved, url, question}}
    {#if isResolved}
    <iframe src={url} title={question}></iframe>
    {/if}
    {/each}
    </div>
</main>
<style>
/* In the <style> tag of +page.svelte */
.feature-links {
  text-align: center;
  padding: 2rem 0;
}

.feature-links h2 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.feature-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem;
  background-color: #f9f9f9;
  display: inline-block; /* Or use flex/grid for parent container */
  width: calc(33% - 2rem); /* Adjust for spacing, assuming 3 cards per row */
  min-width: 280px; /* Minimum width for smaller screens */
  vertical-align: top; /* Align cards nicely if they have different heights */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.feature-card p {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card ul li a {
  text-decoration: none;
  color: #007bff;
  display: block;
  padding: 0.25rem 0;
}

.feature-card ul li a:hover {
  text-decoration: underline;
  color: #0056b3;
}

/* Adjustments for the existing iframe sections if needed */
/* The existing .flex class might need adjustment if it conflicts */
/* For example, to ensure feature cards stack nicely on smaller screens */
@media (max-width: 900px) {
  .feature-card {
    width: calc(50% - 2rem); /* Two cards per row */
  }
}

@media (max-width: 600px) {
  .feature-card {
    width: calc(100% - 2rem); /* One card per row */
    display: block;
  }
}
  .flex {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  iframe {
      width: 400px;
      height: 400px;
      margin: 0.15em;
      border: thick gray solid;
      resize: both;
      overflow: auto;
    }
</style>

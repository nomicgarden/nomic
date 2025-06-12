<script>
  import { page } from '$app/stores';
  import logo from './svelte-logo.svg';
  import { isUserActive } from '../../routes/store.js'; // Import the store
  import { goto } from '$app/navigation'; // Import goto for navigation

  // $page.data.user logic is no longer used here for auth status
  // $isUserActive store now controls auth-related UI elements

  function handleLogout() {
    $isUserActive = false;
    goto('/auth/login'); // Redirect to login page
  }
</script>

<header>
  <div class="corner logo-area">
    <a href="/">
      <img src={logo} alt="Nomic Garden Logo" />
      <span class="app-name">Nomic Garden</span>
    </a>
  </div>

  <nav class="main-nav">
    <ul>
      <!-- <li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li> -->
      <!-- <li class:active={$page.url.pathname === '/treasury'}><a sveltekit:prefetch href="/treasury">Treasury</a></li> -->
      <li class:active={$page.url.pathname === '/proposals' || $page.url.pathname.startsWith('/proposals/')} data-testid="proposals-link">
        <a sveltekit:prefetch href="/proposals">Proposals</a>
      </li>
      <li class:active={$page.url.pathname === '/proposals' || $page.url.pathname.startsWith('/proposals/')} data-testid="voting-link">
        <a sveltekit:prefetch href="/proposals">Voting</a>
      </li>
      {#if $isUserActive}
      <li class:active={$page.url.pathname === '/proposals/new'} data-testid="create-proposal-link">
        <a sveltekit:prefetch href="/proposals/new">Create Proposal</a>
      </li>
      {/if}
      {#if $isUserActive}
      <li class:active={$page.url.pathname === '/profile/me'} data-testid="profile-link">
        <a sveltekit:prefetch href="/profile/me">Profile</a>
      </li>
      {/if}
    </ul>
  </nav>

  <div class="corner auth-links">
    {#if $isUserActive}
      <a href="#" on:click|preventDefault={handleLogout} class="auth-link logout-link">Logout</a>
    {:else}
      <a href="/auth/login" class="auth-link login-link" class:active={$page.url.pathname === '/auth/login'}>Login</a>
    {/if}
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Vertically align items */
    padding: 0.5rem 1rem; /* Add some padding */
    background-color: #f8f9fa; /* Light background color */
    border-bottom: 1px solid #e0e0e0; /* Subtle border */
  }

  .corner {
    display: flex; /* Use flexbox for alignment within corners */
    align-items: center;
  }

  .logo-area a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--heading-color);
  }

  .logo-area img {
    width: 2.5em; /* Slightly larger logo */
    height: 2.5em;
    object-fit: contain;
    margin-right: 0.5em; /* Space between logo and app name */
  }
  .app-name {
    font-weight: bold;
    font-size: 1.2rem;
  }


  .main-nav {
    flex-grow: 1; /* Allow main nav to take up available space */
    display: flex;
    justify-content: center;
  }

  .main-nav ul {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    /* background: var(--background); */ /* Original background style */
    /* background-size: contain; */
  }

  .main-nav li {
    position: relative;
    height: 100%;
  }

  .main-nav li.active::before {
    --size: 6px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    /* border-top: var(--size) solid var(--accent-color); */ /* Using accent color from original */
    border-top: var(--size) solid #007bff; /* Example accent color */
  }

  .main-nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 1em;
    color: var(--heading-color);
    font-weight: 700;
    font-size: 0.9rem; /* Slightly adjusted font size */
    text-transform: uppercase;
    letter-spacing: 0.05em; /* Slightly reduced letter spacing */
    text-decoration: none;
    transition: color 0.2s linear;
  }

  .main-nav a:hover {
    /* color: var(--accent-color); */
    color: #0056b3; /* Darker shade on hover */
  }

  .auth-links {
    display: flex;
    align-items: center;
  }

  .user-greeting { /* This class is no longer used but kept for potential future use */
    margin-right: 1rem;
    font-size: 0.9rem;
    color: #555;
  }

  .auth-link {
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    color: #007bff;
    font-size: 0.9rem;
    border-radius: 4px;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .auth-link:hover {
    background-color: #007bff;
    color: white;
  }

  .auth-link.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }

  .logout-link { /* Style for the new logout link */
    color: #dc3545; /* Red color for logout */
  }
  .logout-link:hover {
    background-color: #dc3545;
    color: white;
  }

  /* Removing the SVG path elements for a cleaner look, can be re-added if desired */
  /*
  nav svg {
    width: 2em;
    height: 3em;
    display: block;
  }

  nav path {
    fill: var(--background);
  }
  */
</style>

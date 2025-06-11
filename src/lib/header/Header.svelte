<script>
  import { page } from '$app/stores';
  import logo from './svelte-logo.svg';

  // $page.data.user will contain the user object if logged in, or null otherwise
</script>

<header>
  <div class="corner logo-area">
    <a href="/">
      <img src={logo} alt="Nomic Garden Logo" />
      <span class="app-name">Nomic Garden</span>
    </a>
  </div>

  <nav class="main-nav">
    <!-- Standard navigation links can go here if any -->
    <!-- Example:
    <svg viewBox="0 0 2 3" aria-hidden="true">
      <path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
    </svg>
    <ul>
      <li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
      <li class:active={$page.url.pathname === '/treasury'}><a sveltekit:prefetch href="/treasury">Treasury</a></li>
    </ul>
    <svg viewBox="0 0 2 3" aria-hidden="true">
      <path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
    </svg>
    -->
  </nav>

  <div class="corner auth-links">
    {#if $page.data.user}
      <a href="/profile/me" class="user-greeting auth-link">Hello, {$page.data.user.username}</a>
      <a href="/auth/logout" class="auth-link logout-link">Logout</a>
    {:else}
      <a href="/auth/login" class="auth-link login-link" class:active={$page.url.pathname === '/auth/login'}>Login</a>
      <a href="/auth/register" class="auth-link register-link" class:active={$page.url.pathname === '/auth/register'}>Register</a>
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

  .user-greeting {
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

  .logout-link {
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
  header {
    display: flex;
    justify-content: space-between;
  }

  .corner {
    width: 3em;
    height: 3em;
  }

  .corner a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .corner img {
    width: 2em;
    height: 2em;
    object-fit: contain;
  }

  nav {
    display: flex;
    justify-content: center;
    --background: rgba(255, 255, 255, 0.7);
  }

  svg {
    width: 2em;
    height: 3em;
    display: block;
  }

  path {
    fill: var(--background);
  }

  ul {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    background: var(--background);
    background-size: contain;
  }

  li {
    position: relative;
    height: 100%;
  }

  li.active::before {
    --size: 6px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid var(--accent-color);
  }

  nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 1em;
    color: var(--heading-color);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
  }

  a:hover {
    color: var(--accent-color);
  }
</style>

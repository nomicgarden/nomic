<script context="module">
  import { redirect } from '@sveltejs/kit';

  /** @type {import('./$types').Actions} */
  export const actions = {
    default: async ({ cookies }) => {
      // Clear the session cookie
      cookies.delete('session', { path: '/' });

      // Redirect to the homepage
      throw redirect(303, '/');
    }
  };
</script>

<script>
  // Optional: For a more user-friendly experience without JavaScript needing to submit,
  // or to show a message. For this task, a simple button is sufficient.
  // import { onMount } from 'svelte';
  // import { goto } from '$app/navigation';
  // onMount(() => {
  //   // If you wanted to auto-submit or just redirect if JS is enabled
  //   // document.getElementById('logout-form').submit();
  //   // Or, if this page was purely for the action and you wanted a client-side redirect
  //   // goto('/');
  // });
</script>

<svelte:head>
  <title>Logout</title>
</svelte:head>

<div class="logout-container">
  <h1>Logout</h1>
  <p>Are you sure you want to logout?</p>

  <form method="POST" id="logout-form">
    <button type="submit">Logout</button>
  </form>

  <p style="margin-top: 1rem;">
    <a href="/">Cancel and return to homepage</a>
  </p>
</div>

<style>
  .logout-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    text-align: center;
  }

  h1 {
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    margin-bottom: 1.5rem;
    color: #555;
  }

  button[type="submit"] {
    padding: 0.75rem 1.5rem;
    background-color: #d9534f; /* Bootstrap danger color for logout */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button[type="submit"]:hover {
    background-color: #c9302c; /* Darker shade for hover */
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>

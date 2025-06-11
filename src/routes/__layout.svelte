<script context="module">
  /** @type {import('@sveltejs/kit').LayoutLoad} */
  export async function load({ locals, data }) {
    // locals.user is populated by hooks.server.js
    // data contains props from parent layouts if any (none for root layout)
    return {
      user: locals.user || null // This will be available in $page.data.user
    };
  }
</script>

<script>
  import "../app.css";

  /** @type {import('./$types').LayoutData} */
  export let data; // This 'data' prop receives the return value from the load function

  // $: console.log('Layout data:', data); // For debugging
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<nav>
  <a href=".">NOMIC</a>
  <a href="/treasury">TREASURY</a>
  <!-- Dynamic auth links will be added in Header.svelte -->
</nav>

<slot/>

<!--
  The $page store will automatically get the 'user' object from the load function's return value.
  So, $page.data.user will be available in Header.svelte and other components that need user info.
-->

<style>
  nav {
    padding: 1rem;
    box-shadow: -1px 1px 11px 4px #898989;
  }
  a {
    text-decoration: none;
    color: gray;
    margin-right: 1rem;
  }
</style>

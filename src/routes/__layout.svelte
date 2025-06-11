<script context="module">
  /** @type {import('@sveltejs/kit').Load} */
  export async function load({ session, stuff, status, error, page, fetch, host, path, params, url, locals }) {
    // In older SvelteKit versions, user data from hooks might be directly in `session` or via `locals`.
    // Given our hooks.server.js setup, `locals.user` is where the user object is.
    // We need to pass it to the props of the layout and subsequently to $page.data
    return {
      props: {
        user: locals.user || null // Ensure user is explicitly null if not authenticated
      }
    };
  }
</script>

<script>
  import "../app.css";
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
  The $page store will automatically get the 'user' prop from the load function.
  So, $page.data.user will be available in Header.svelte and other components.
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

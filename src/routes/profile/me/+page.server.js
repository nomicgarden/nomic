import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').ServerLoad} */
export async function load({ locals }) {
  // Access user from locals, which should be populated by hooks.server.js
  const user = locals.user;

  if (!user) {
    // User is not authenticated, redirect to login
    // Optionally, add a redirectTo query parameter for better UX after login
    throw redirect(303, '/auth/login?redirectTo=/profile/me');
  }

  // If the root layout's load function already provides `user` to $page.data,
  // returning it here might seem redundant for display in me.svelte.
  // However, this load function *ensures* that this specific route
  // is protected. If `locals.user` is null, it redirects.
  // The `user` object from `locals` is implicitly passed to the page component
  // through the layout hierarchy if the layout's load function passes it.
  // For clarity or if this page needed *additional* server-loaded data for the user,
  // you could return { user } explicitly.
  // Since the root layout already handles passing `locals.user` to `$page.data.user`,
  // we don't strictly need to return it here again for the page to access it via $page.data.user.
  // The primary purpose of this load function is protection.
  return {};
}

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
  event.locals.user = null; // Initialize user as null

  // Add security headers
  const response = await resolve(event);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';");

  // The original cookie logic for 'userid' is no longer needed if 'session' cookie handles authenticated user identity.
  // If 'userid' was for anonymous users, it might still have a place, but typically JWT handles logged-in users.
  // For this implementation, we assume 'session' JWT replaces the old 'userid' logic for authenticated users.
  // If you need to maintain the old 'userid' for anonymous users, you'd need to merge that logic carefully.
  // For example, only set 'userid' if no 'session' token is present or valid.

  return response;
};

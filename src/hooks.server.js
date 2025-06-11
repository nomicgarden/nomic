import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  event.locals.user = null; // Initialize user as null

  if (token) {
    try {
      // Check if JWT_SECRET is loaded. It should be, but good practice to ensure.
      if (!JWT_SECRET) {
        console.error(
          'JWT_SECRET is not available in hooks.server.js. Ensure it is set in .env and accessible via $env/static/private.'
        );
        // Depending on policy, might want to clear cookie or just proceed without auth
      } else {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
          // Add any other necessary user properties from the token to event.locals.user
          event.locals.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
            // Add other fields from payload if they exist e.g. roles, permissions
          };
        } else {
          console.warn('JWT verification returned unexpected payload:', decoded);
          // Clear cookie if payload is not as expected
          event.cookies.delete('session', { path: '/' });
        }
      }
    } catch (error) {
      // Common errors: TokenExpiredError, JsonWebTokenError (e.g. invalid signature)
      console.warn(`Token verification failed: ${error.name} - ${error.message}`);
      event.locals.user = null;
      // Clear the invalid/expired cookie
      event.cookies.delete('session', { path: '/' });
    }
  }

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

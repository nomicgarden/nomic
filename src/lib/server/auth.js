import jwt from 'jsonwebtoken';
import * as env from '$env/dynamic/private';
const JWT_SECRET = env.JWT_SECRET;

// Check if JWT_SECRET is loaded
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined. Please check your .env file and SvelteKit configuration.'
  );
}

/**
 * Generates a JWT for a given user.
 * @param {{ id: number, username: string, email: string }} user - The user object to encode in the token.
 * @returns {string} The generated JWT.
 */
export function generateToken(user) {
  if (!user || typeof user.id === 'undefined' || !user.username || !user.email) {
    throw new Error('Invalid user object provided for token generation.');
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
    // You can add other non-sensitive user details here if needed
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
}

// Optional: A function to verify tokens, though this might primarily be used in hooks
/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object | null} The decoded payload if verification is successful, otherwise null.
 */
export function verifyToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Invalid or expired token:', error.message);
    return null;
  }
}

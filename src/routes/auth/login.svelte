<script context="module">
  import { findUserByEmail } from '$lib/server/database';
  import { generateToken } from '$lib/server/auth';
  import bcrypt from 'bcrypt';
  import { fail, redirect } from '@sveltejs/kit';
  import { enhance } from '$app/forms'; // For progressive enhancement
  import { page } from '$app/stores'; // To access form action data

  /** @type {import('./$types').Actions} */
  export const actions = {
    default: async (event) => {
      const { request, cookies } = event;
      const data = await request.formData();
      const email = data.get('email')?.toString();
      const password = data.get('password')?.toString();

      // --- Basic Validation ---
      if (!email || !password) {
        return fail(400, {
          error: 'Email and password are required.',
          values: { email }
        });
      }

      // --- User Retrieval ---
      try {
        const user = await findUserByEmail(email);

        if (!user) {
          return fail(401, {
            error: 'Invalid credentials. Please check your email and password.',
            values: { email }
          });
        }

        // --- Password Verification ---
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
          return fail(401, {
            error: 'Invalid credentials. Please check your email and password.',
            values: { email }
          });
        }

        // --- Successful Login ---
        const tokenUser = { id: user.id, username: user.username, email: user.email };
        const token = generateToken(tokenUser);

        cookies.set('session', token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use true in production
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Redirect to home page or a profile page
        throw redirect(303, '/');

      } catch (e) {
        console.error('Login error:', e);
        return fail(500, {
          error: 'An internal server error occurred during login.',
          values: { email } // Pass back email
        });
      }
    }
  };
</script>

<script>
  export let form; // Action data from the server
  let submitting = false; // Local submitting state for the form
  let email = form?.values?.email || ''; // Initialize email from form data if available

  // Update local email if form data changes (e.g., after a server error)
  $: {
    email = form?.values?.email || '';
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="auth-container">
  <h1>Login to Your Account</h1>

  {#if form?.error && !form?.errors} <!-- Display general error if no specific field errors -->
    <p class="error-message global-error">{form.error}</p>
  {/if}
  {#if form?.success}
    <p class="success-message global-success">{form.message} {#if form.username}(Welcome back, {form.username}!){/if}</p>
  {/if}

  <form method="POST" use:enhance={() => {
    submitting = true; // Set submitting state to true when form submission starts
    return async ({ update }) => {
      await update(); // Wait for the server response and page update
      submitting = false; // Reset submitting state
    };
  }}>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" bind:value={email} required
             aria-describedby={form?.errors?.email ? "email-error" : undefined} />
      {#if form?.errors?.email}
        <p id="email-error" class="error-message field-error">{form.errors.email}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required
             aria-describedby={form?.errors?.password ? "password-error" : undefined} />
      {#if form?.errors?.password}
        <p id="password-error" class="error-message field-error">{form.errors.password}</p>
      {/if}
    </div>

    <button type="submit" disabled={submitting}>
      {#if submitting}Logging in...{:else}Login{/if}
    </button>
  </form>
  <p class="auth-link">
    Don't have an account? <a href="/auth/register">Register here</a>
  </p>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
  }

  input:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

  button[type="submit"]:disabled {
    background-color: #a0cfff;
    cursor: not-allowed;
  }

  .error-message {
    color: #d9534f;
    font-size: 0.875rem;
  }
  .field-error {
     margin-top: 0.25rem;
     padding: 0.25rem 0.5rem;
     background-color: #fddede;
     border-left: 3px solid #d9534f;
  }
  .global-error {
    padding: 0.75rem;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  .global-success {
    padding: 0.75rem;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .auth-link {
    text-align: center;
    margin-top: 1.5rem;
  }
  .auth-link a {
    color: #007bff;
    text-decoration: none;
  }
  .auth-link a:hover {
    text-decoration: underline;
  }
</style>

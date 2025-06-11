<script context="module">
  import { createUser, findUserByUsername, findUserByEmail } from '$lib/server/database';
  import { generateToken } from '$lib/server/auth';
  import bcrypt from 'bcrypt';
  import { fail, redirect } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores'; // To access form action data

  /** @type {import('./$types').Actions} */
  export const actions = {
    default: async (event) => {
      const { request, cookies } = event;
      const data = await request.formData();
      const username = data.get('username')?.toString();
      const email = data.get('email')?.toString();
      const password = data.get('password')?.toString();
      const confirm_password = data.get('confirm_password')?.toString();

      // --- Basic Validation ---
      if (!username || !email || !password || !confirm_password) {
        return fail(400, {
          error: 'All fields are required.',
          values: { username, email }
        });
      }

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return fail(400, {
          error: 'Invalid email format.',
          values: { username, email }
        });
      }

      // Password complexity (e.g., minimum 8 characters)
      if (password.length < 8) {
        return fail(400, {
          error: 'Password must be at least 8 characters long.',
          values: { username, email }
        });
      }

      if (password !== confirm_password) {
        return fail(400, {
          error: 'Passwords do not match.',
          values: { username, email }
        });
      }

      // --- Database Checks ---
      try {
        const existingUserByUsername = await findUserByUsername(username);
        if (existingUserByUsername) {
          return fail(400, {
            error: 'Username already taken.',
            values: { username, email }
          });
        }

        const existingUserByEmail = await findUserByEmail(email);
        if (existingUserByEmail) {
          return fail(400, {
            error: 'Email already registered.',
            values: { username, email }
          });
        }

        // --- Create User ---
        const saltRounds = 10; // Standard practice
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await createUser(username, email, hashedPassword);

        if (newUser) {
          const tokenUser = { id: newUser.id, username: newUser.username, email: newUser.email };
          const token = generateToken(tokenUser);

          cookies.set('session', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use true in production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          });

          // Redirect to home page or a profile page after successful registration
          throw redirect(303, '/');
        } else {
          // This case should ideally be caught by earlier checks or createUser's error handling
          return fail(500, {
            error: 'Failed to create user due to an unexpected error.',
            values: { username, email } // Pass back username and email
          });
        }
      } catch (e) {
        console.error('Registration error:', e);
        const errorMessage = e instanceof Error ? e.message : 'An internal server error occurred during registration.';
        return fail(500, {
          error: errorMessage,
          values: { username, email } // Pass back username and email
        });
      }
    }
  };
</script>

<script>
  export let form; // Action data
  let submitting = false; // Local submitting state
  let username = form?.values?.username || '';
  let email = form?.values?.email || '';

  // Update local variables when form data changes (e.g. after server error)
  $: {
    username = form?.values?.username || '';
    email = form?.values?.email || '';
  }
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<div class="auth-container">
  <h1>Create an Account</h1>

  {#if form?.error && !form?.errors}
    <p class="error-message global-error">{form.error}</p>
  {/if}
  {#if form?.success}
    <p class="success-message global-success">{form.message}</p>
  {/if}

  <form method="POST" use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update();
      submitting = false;
    };
  }}>
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" bind:value={username} required aria-describedby={form?.errors?.username ? "username-error" : undefined} />
      {#if form?.errors?.username}
        <p id="username-error" class="error-message field-error">{form.errors.username}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" bind:value={email} required aria-describedby={form?.errors?.email ? "email-error" : undefined} />
      {#if form?.errors?.email}
        <p id="email-error" class="error-message field-error">{form.errors.email}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" minlength="8" required aria-describedby={form?.errors?.password ? "password-error" : undefined} />
      {#if form?.errors?.password}
        <p id="password-error" class="error-message field-error">{form.errors.password}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="confirm_password">Confirm Password</label>
      <input type="password" id="confirm_password" name="confirm_password" minlength="8" required aria-describedby={form?.errors?.confirm_password ? "confirm_password-error" : undefined} />
      {#if form?.errors?.confirm_password}
        <p id="confirm_password-error" class="error-message field-error">{form.errors.confirm_password}</p>
      {/if}
    </div>

    <button type="submit" disabled={submitting}>
      {#if submitting}Registering...{:else}Register{/if}
    </button>
  </form>

  <p class="auth-link">
    Already have an account? <a href="/auth/login">Login here</a>
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

  input[type="text"],
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
    color: #d9534f; /* Bootstrap's text-danger color */
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  .field-error {
     margin-top: 0.25rem;
     padding: 0.25rem 0.5rem;
     background-color: #fddede;
     border-left: 3px solid #d9534f;
  }
  .global-error {
    padding: 0.75rem;
    background-color: #f8d7da; /* Bootstrap's alert-danger background */
    border: 1px solid #f5c6cb; /* Bootstrap's alert-danger border */
    color: #721c24; /* Bootstrap's alert-danger text */
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
   .global-success {
    padding: 0.75rem;
    background-color: #d4edda; /* Bootstrap's alert-success background */
    border: 1px solid #c3e6cb; /* Bootstrap's alert-success border */
    color: #155724; /* Bootstrap's alert-success text */
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

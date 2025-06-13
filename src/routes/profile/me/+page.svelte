<script>
  import { page } from '$app/stores';

  // $page.data.user is populated by the root layout's load function
  // and this route is protected by src/routes/profile/me.js
  const user = $page.data.user;
</script>

<svelte:head>
  <title>{user ? user.username + "'s Profile" : 'Profile'}</title>
</svelte:head>

<div class="profile-container">
  {#if user}
    <h1>{$page.data.user.username}'s Profile</h1>
    <div class="profile-details">
      <p><strong>User ID:</strong> {$page.data.user.id}</p>
      <p><strong>Username:</strong> {$page.data.user.username}</p>
      <p><strong>Email:</strong> {$page.data.user.email}</p>

      {#if $page.data.user.bio}
        <p><strong>Bio:</strong> {$page.data.user.bio}</p>
      {:else}
        <p><em>No bio provided.</em></p>
      {/if}

      <!-- Placeholder for profile picture -->
      <!--
      {#if $page.data.user.profile_picture_url}
        <img src={$page.data.user.profile_picture_url} alt="Profile Picture" class="profile-picture"/>
      {:else}
        <div class="profile-picture-placeholder">No Profile Picture</div>
      {/if}
      -->
    </div>

    <!-- Link to edit profile (future feature) -->
    <!-- <a href="/profile/edit" class="edit-profile-link">Edit Profile</a> -->

  {:else}
    <!-- This part should ideally not be reached if the route protection in me.js works correctly,
         as unauthenticated users would be redirected.
         However, it's a fallback or could be shown briefly during loading/redirect. -->
    <h1>Access Denied</h1>
    <p>You need to be logged in to view this page. You should be redirected shortly.</p>
    <p><a href="/auth/login?redirectTo=/profile/me">Login Now</a></p>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .profile-details p {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    color: #555;
    line-height: 1.6;
  }

  .profile-details p strong {
    color: #333;
    margin-right: 0.5em;
  }

  .profile-picture {
    display: block;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 1rem auto;
    object-fit: cover;
    border: 3px solid #007bff;
  }

  .profile-picture-placeholder {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 1rem auto;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    border: 3px dashed #ccc;
  }

  .edit-profile-link {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .edit-profile-link:hover {
    background-color: #0056b3;
  }
</style>

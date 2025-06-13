<script>
  import zxcvbn from 'zxcvbn';
  import * as bip39 from 'bip39'; // Import all as bip39
  import { isUserActive } from '../store.js'; // Import the store

  let username = '';
  let password = '';
  let passwordStrength = { score: 0, feedback: { suggestions: [], warning: '' }, guesses_log10: 0 };
  let isPasswordStrongEnough = false;

  let generatedMnemonic = '';
  let isGenerating = false;
  let errorMessage = '';

  const TARGET_GUESSES_LOG10 = 20; // Target for a strong password

  $: {
    if (password) {
      passwordStrength = zxcvbn(password);
      isPasswordStrongEnough = passwordStrength.guesses_log10 >= TARGET_GUESSES_LOG10;
    } else {
      passwordStrength = { score: 0, feedback: { suggestions: [], warning: '' }, guesses_log10: 0 };
      isPasswordStrongEnough = false;
    }
  }

  $: progressBarColor = () => {
    if (!password) return 'lightgrey';
    if (passwordStrength.guesses_log10 < TARGET_GUESSES_LOG10 / 2) return 'var(--strength-weak, #ff4d4d)';
    if (passwordStrength.guesses_log10 < TARGET_GUESSES_LOG10) return 'var(--strength-moderate, #ffa500)';
    return 'var(--strength-strong, #4caf50)';
  };

  $: buttonDisabled = !isPasswordStrongEnough || username.trim() === '' || isGenerating;

  async function handleSubmit() {
    isGenerating = true;
    generatedMnemonic = '';
    errorMessage = '';
    // $isUserActive = false; // Reset user active state on new attempt, if desired. Or manage elsewhere.

    try {
      const combinedInput = username + password;
      const encoder = new TextEncoder();
      const combinedInputBuffer = encoder.encode(combinedInput);
      const saltBuffer = encoder.encode(username);

      const importedKey = await window.crypto.subtle.importKey(
        'raw',
        combinedInputBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 32768,
          hash: 'SHA-256'
        },
        importedKey,
        128
      );

      const entropyBytes = new Uint8Array(derivedBits);
      let entropyHex = '';
      for (let i = 0; i < entropyBytes.length; i++) {
        entropyHex += entropyBytes[i].toString(16).padStart(2, '0');
      }

      generatedMnemonic = bip39.entropyToMnemonic(entropyHex);
      if (generatedMnemonic) { // Check if mnemonic was successfully generated
        $isUserActive = true; // Set user as active
      }

    } catch (err) {
      console.error('Mnemonic generation error:', err);
      if (err instanceof Error) {
        errorMessage = `Error generating mnemonic: ${err.message}. Please try again.`;
      } else {
        errorMessage = 'An unknown error occurred during mnemonic generation. Please try again.';
      }
      $isUserActive = false; // Ensure user is not active if there's an error
    } finally {
      isGenerating = false;
    }
  }

  function clearMnemonicAndDeactivate() {
    generatedMnemonic = '';
    $isUserActive = false;
    errorMessage = ''; // Also clear any errors when user explicitly clears mnemonic
  }
</script>

<h1>Login / Create Account</h1>

<form on:submit|preventDefault={handleSubmit}>
  <div>
    <label for="username">Username</label>
    <input type="text" name="username" id="username" bind:value={username} required disabled={isGenerating} />
  </div>
  <div>
    <label for="password">Password</label>
    <input type="password" name="password" id="password" bind:value={password} required disabled={isGenerating} />
  </div>

  {#if password}
    <div class="strength-meter">
      <label for="password-strength">Password Strength:</label>
      <progress id="password-strength" value={passwordStrength.guesses_log10} max={TARGET_GUESSES_LOG10} style="--progress-color: {progressBarColor()};"></progress>
      <p class="strength-score">Strength indicator: {passwordStrength.guesses_log10.toFixed(2)} / {TARGET_GUESSES_LOG10} (aim for {TARGET_GUESSES_LOG10}+)</p>
      {#if passwordStrength.feedback.warning}
        <p class="feedback warning">{passwordStrength.feedback.warning}</p>
      {/if}
      {#if passwordStrength.feedback.suggestions && passwordStrength.feedback.suggestions.length > 0}
        <p class="feedback suggestions-title">Suggestions to improve:</p>
        <ul class="feedback suggestions">
          {#each passwordStrength.feedback.suggestions as suggestion}
            <li>{suggestion}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <button type="submit" disabled={buttonDisabled}>
    {#if isGenerating}
      Generating...
    {:else}
      Proceed
    {/if}
  </button>

  {#if errorMessage && !generatedMnemonic} <!-- Only show error if no mnemonic is displayed -->
    <p class="error-message">{errorMessage}</p>
  {/if}
</form>

{#if generatedMnemonic}
  <div class="mnemonic-display">
    <h2>Your Secure Mnemonic Phrase</h2>
    <p class="mnemonic-phrase">{generatedMnemonic}</p>
    <div class="warning-critical">
      <strong>IMPORTANT:</strong> This is your private key. Write it down, store it securely offline, and then clear it from your screen.
      Anyone with this phrase can access your account/funds.
    </div>
    <button on:click={clearMnemonicAndDeactivate}>Clear Mnemonic & Deactivate</button>
  </div>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  div:not(.strength-meter):not(.mnemonic-display):not(.warning-critical) {
    display: flex;
    flex-direction: column;
  }
  label {
    margin-bottom: 0.35rem;
    font-weight: bold;
    font-size: 0.9rem;
  }
  input {
    padding: 0.65rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  button {
    padding: 0.85rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease;
    margin-top: 0.5rem;
  }
  button:hover {
    background-color: #0056b3;
  }
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .strength-meter {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fff;
  }
  .strength-meter label {
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.25rem;
  }
  progress {
    width: 100%;
    height: 12px;
    border-radius: 6px;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    -webkit-appearance: none;
    appearance: none;
  }
  progress::-webkit-progress-bar {
    background-color: #e0e0e0;
    border-radius: 6px;
  }
  progress::-webkit-progress-value {
    background-color: var(--progress-color, #757575);
    border-radius: 6px;
    transition: background-color 0.3s ease-in-out, width 0.3s ease-in-out;
  }
  progress::-moz-progress-bar {
    background-color: var(--progress-color, #757575);
    border-radius: 6px;
    transition: background-color 0.3s ease-in-out, width 0.3s ease-in-out;
  }

  .strength-score {
    font-size: 0.8rem;
    color: #333;
    margin-bottom: 0.5rem;
    text-align: right;
  }
  .feedback {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  .feedback.warning {
    color: #c0392b;
    font-weight: bold;
    padding: 0.5rem;
    background-color: #f9e0de;
    border-radius: 3px;
  }
  .feedback.suggestions-title {
    font-weight: bold;
    color: #2980b9;
    margin-top: 0.75rem;
  }
  .feedback.suggestions {
    list-style-type: disc;
    padding-left: 1.5rem;
    color: #34495e;
  }
  .feedback.suggestions li {
    margin-bottom: 0.3rem;
  }

  .error-message {
    color: #c0392b;
    background-color: #f9e0de;
    padding: 0.75rem;
    border-radius: 4px;
    margin-top: 1rem;
    text-align: center;
  }

  .mnemonic-display {
    margin-top: 2rem;
    padding: 1.5rem;
    border: 1px solid #007bff;
    border-radius: 8px;
    background-color: #e7f3ff;
    text-align: center;
  }
  .mnemonic-display h2 {
    color: #0056b3;
    margin-bottom: 1rem;
  }
  .mnemonic-phrase {
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.1rem;
    color: #333;
    padding: 1rem;
    background-color: #fff;
    border: 1px dashed #007bff;
    border-radius: 4px;
    margin-bottom: 1rem;
    word-wrap: break-word;
  }
  .warning-critical {
    padding: 1rem;
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  .warning-critical strong {
    display: block;
    margin-bottom: 0.5rem;
  }
</style>

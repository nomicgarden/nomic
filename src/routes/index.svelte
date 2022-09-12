<script>
import { onMount } from "svelte";
import { apiData, drinkNames } from './store.js';

onMount(async () => {
  fetch("https://manifold.markets/api/v0/group/by-id/vAEfB4ijB8QlYdDYetaN/markets")
  .then(response => response.json())
  .then(data => {
		console.log(data);
    apiData.set(data);
  }).catch(error => {
    console.log(error);
    return [];
  });
});
</script>
<main>
    <h1>Open Questions</h1>
    <div class="flex">
    {#each $drinkNames as {isResolved, url, question}}
    {#if !isResolved}
    <iframe src={url} title={question}></iframe>
    {/if}
    {/each}
    </div>
    <h1>Resolved Questions</h1>
    <div class="flex">
    {#each $drinkNames as {isResolved, url, question}}
    {#if isResolved}
    <iframe src={url} title={question}></iframe>
    {/if}
    {/each}
    </div>
</main>
<style>
  .flex {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  iframe {
      width: 400px;
      height: 400px;
      margin: 0.15em;
      border: thick gray solid;
      resize: both;
      overflow: auto;
    }
</style>

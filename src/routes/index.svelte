<script>
import { onMount } from "svelte";
import { apiData, drinkNames } from './store.js';

onMount(async () => {
  fetch("https://manifold.markets/api/v0/markets?limit=10")
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
    <h1>NOMIC</h1>
    <iframe src="https://manifold.markets/embed/cos/will-i-spend-more-than-30-hours-wri" title="Will I spend more than 30 hours writing code for Nomic in September?" frameborder="0"></iframe>
    <iframe src="https://manifold.markets/embed/cos/will-nomic-garden-feature-dynamic-e" title="Will Nomic Garden feature dynamic elements in September?" frameborder="0"></iframe>
    <iframe src="https://manifold.markets/embed/cos/win-100-how-much-cash-will-nomic-ha-be4cb3906a73" title="[Win $100] How much cash will Nomic have in its treasury on December 31st, 2022?" frameborder="0"></iframe>
    <iframe src="https://manifold.markets/embed/cos/how-many-unique-users-will-my-digit" title="How many unique users will my digital futarchy have on July 31st, 2023 if I name it &quot;Nomic&quot;?" frameborder="0"></iframe>
	<h1>Random Questions</h1>
	<ul>
	{#each $drinkNames as drinkName}
		<li>{drinkName}</li>
	{/each}
	</ul>
</main>
<style>
  iframe {
      width: 300px;
      height: 400px;
      border: none;
    }
</style>

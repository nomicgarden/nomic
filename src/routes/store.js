import { writable, derived } from 'svelte/store';

/** Store for your data. 
This assumes the data you're pulling back will be an array.
If it's going to be an object, default this to an empty object.
**/
export const apiData = writable([]);

/** Data transformation.
For our use case, we only care about the drink names, not the other information.
Here, we'll create a derived store to hold the drink names.
**/
export const drinkNames = derived(apiData, ($apiData) => {
  if ($apiData) {
    return $apiData.map((drink) => ({
      isResolved: drink.isResolved,
      url: drink.url,
      question: drink.question
    }));
  }
  return [];
});

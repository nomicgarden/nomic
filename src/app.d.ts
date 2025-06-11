/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface User {
    id: number; // Assuming id is a number, adjust if string or other type
    username: string;
    email: string;
    // Add other fields from payload if they exist e.g. roles, permissions
  }

  interface Locals {
    user: User | null;
    // userid: string; // This was the old property, removing if 'user' object replaces its role for auth
  }

  // interface PageData {} // You can define this if you have common PageData shapes

  // interface Error {} // You can define this for custom error shapes

  // interface Platform {}

  // interface Session {}

  // interface Stuff {}
}

declare module '$env/static/private' {
  export const JWT_SECRET: string;
  // Add other private env variables here if any
}

// If you have public env variables (prefix PUBLIC_), you can declare them too:
// declare module '$env/static/public' {
//   export const PUBLIC_SOME_VAR: string;
// }

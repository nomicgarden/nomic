import { api } from './_api';
import { json, redirect as kitRedirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ locals }) {
  if (!locals.user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }
  const response = await api('get', `todos/${locals.user.id}`);

  if (response.status === 404) {
    return json({ todos: [] }); // Return empty list if not found
  }

  if (response.status === 200) {
    return json({ todos: await response.json() });
  }

  return new Response(response.body, { status: response.status });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }
  const form = await request.formData();
  const text = form.get('text');

  if (!text) {
    return json({ message: 'Text is required' }, { status: 400 });
  }

  await api('post', `todos/${locals.user.id}`, { text });

  return new Response(null, { status: 201 }); // Created
}

// If the user has JavaScript disabled, the URL will change to
// include the method override unless we redirect back to /todos
// This redirect object needs to be invoked via throw kitRedirect(...)
const svelteKitRedirectResponse = (location) => {
  throw kitRedirect(303, location);
};

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PATCH({ request, locals }) {
  if (!locals.user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }
  const form = await request.formData();
  const uid = form.get('uid');

  if (!uid) {
    return json({ message: 'UID is required' }, { status: 400 });
  }

  await api('patch', `todos/${locals.user.id}/${uid}`, {
    text: form.has('text') ? form.get('text') : undefined,
    done: form.has('done') ? !!form.get('done') : undefined
  });

  return svelteKitRedirectResponse('/todos');
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ request, locals }) {
  if (!locals.user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }
  const form = await request.formData();
  const uid = form.get('uid');

  if (!uid) {
    return json({ message: 'UID is required' }, { status: 400 });
  }

  await api('delete', `todos/${locals.user.id}/${uid}`);

  return svelteKitRedirectResponse('/todos');
}

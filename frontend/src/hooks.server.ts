import {redirect} from '@sveltejs/kit'

export async function handle({ event, resolve }) {
    const sessionID = event.cookies.get('lu_session_id')
    if (!sessionID && event.url.pathname.startsWith('/admin') && !event.url.pathname.startsWith('/admin/signin')) {
        throw redirect(303, '/admin/signin')
    }

    const response = await resolve(event);
    return response;
}
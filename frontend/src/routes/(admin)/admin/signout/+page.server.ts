import { redirect } from '@sveltejs/kit';
 
export function load({cookies}) {
    cookies.delete('lu_session_id', { path: '/' })
    throw redirect(302, '/admin/signin');
}
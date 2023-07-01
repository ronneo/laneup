import {getAuthURL} from '$lib/server/utils'
import {validatePassword} from '$lib/utils'
import {fail,redirect} from '@sveltejs/kit'

export const load = async ({cookies}) => {
}

export const actions = {
    default: async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const password:string = data.get('password')?.toString() || ''
        const passwordConfirm:string = data.get('passwordconfirm')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''

        if (!validatePassword(password)) {
            return fail(400, { passworderror: true });
        }
        if (password != passwordConfirm) {
            return fail(400, { passwordmatch: true });
        }

        try {
            const response = await fetch(getAuthURL(url.origin)+'admin/', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'password':password}),
            });
            const results = await response.json()

            if (results.error) {
                return fail(400, { invalid: true });
            } else {
                return { success:true }
            }

        } catch (error) {
            console.log('final error')
            return fail(400, { invalid: true });
        }
    }
    
}
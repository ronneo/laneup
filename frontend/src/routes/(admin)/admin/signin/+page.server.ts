import {env} from '$env/dynamic/private'
import {getAuthURL} from '$lib/server/utils'
import {fail,redirect} from '@sveltejs/kit'
import {validateEmail} from '$lib/utils'

export const load = async ({url}) => {
}

export const actions = {
    default: async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const email:string = data.get('email')?.toString() || '';
        const password:string = data.get('password')?.toString() || '';;
        const remember:boolean = data.get('remember')!=null
        let loginSuccess:boolean = false

        if (!validateEmail(email)) {
            console.log('invalid')
            return fail(400, { email, incorrect: true });
        }

        try {
            const response = await fetch(getAuthURL(url.origin)+'login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'email':email,'password':password,'cid':env.COMPANY_ID}),
            });
            const user = await response.json()
            loginSuccess = true

            if (user.error) {
                loginSuccess = false
            }

            cookies.set('lu_session_id', user.sessionid, {
                path: '/',
                httpOnly: env.SET_HTTPS=='1'?false:true,
                sameSite: 'strict',
                secure: env.SET_HTTPS=='1'?true:false,
                maxAge: remember?(60 * 60 * 24 * 30):(60 * 60 * 24)
            });
        } catch (error) {
            console.error(`Error in load function for /: ${error}`);
        }

        if (loginSuccess) {
            throw redirect(303, '/admin')
        } else {
            return fail(400, { invalid: true });
        }
    }
    
}
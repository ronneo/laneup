import {env} from '$env/dynamic/private'
import {getAuthURL} from '$lib/server/utils'
import {validateEmail} from '$lib/utils'
import {fail,redirect} from '@sveltejs/kit'

export const load = async ({url}) => {
    let results
    try {
        const response = await fetch(getAuthURL(url.origin)+'install/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        results = await response.json()

    } catch (error) {
        console.error(`Error in load function for /: ${error}`);
    }
    if (results.installed === true) {
        throw redirect(307, '/admin/signin')
    }
}

export const actions = {
    default: async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const email:string = data.get('email')?.toString() || '';
        const password:string = data.get('password')?.toString() || '';;
        const passwordConfirm:string = data.get('passwordc')?.toString() || '';;
        let createSuccess:boolean = false

        if (!validateEmail(email)) {
            return fail(400, { email, incorrect: true });
        }
        if (password != passwordConfirm) {
            return fail(400, { email, passwordIncorrect: true });
        }

        try {
            const response = await fetch(getAuthURL(url.origin)+'create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'email':email,'password':password,'cid':env.COMPANY_ID}),
            });
            const user = await response.json();
            createSuccess = true;

            if (user.error) {
                createSuccess = false;
                return fail(400, { email, incorrect: true });
            }

        } catch (error) {
            console.error(`Error in load function for /: ${error}`);
        }

        if (createSuccess) {
            throw redirect(303, '/admin/signin')
        } 
    }
    
}
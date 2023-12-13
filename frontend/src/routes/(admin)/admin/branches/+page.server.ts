import {getManageURL, getBaseURL} from '$lib/server/utils'
import {fail,redirect} from '@sveltejs/kit'

export const load = async ({cookies, url}) => {
    let sessionID:string = cookies.get('lu_session_id') || ''
    let results
    try {
        const response = await fetch(getManageURL(url.origin)+'branch/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionID
            },
        });
        results = await response.json()

    } catch (error) {
        console.error(`Error in load function for /: ${error}`);
    }
    if (results.error) {
        if (results.error == 'Invalid Authorization') {
            throw redirect(307, '/admin/signin')
        }
    } else {
        return {
            branches:results,
            apiURL: getManageURL(url.origin)
        }
    }

}

export const actions = {
    addbranch:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const branchName:string = data.get('branchName')?.toString() || ''
        const branchKey:string = data.get('branchKey')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''
        console.log('going in', sessionID)
        if (branchName == '' || branchKey == '') {
            return fail(400, { invalidentry: true, branchName:branchName });
        }

        try {
            const response = await fetch(getManageURL(url.origin)+'branch/', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'branchName':branchName,'branchKey':branchKey}),
            });
            const results = await response.json()

            if (results.error) {
                return fail(400, { invalid: true });
            } else {
                return { success:true }
            }

        } catch (error) {
            return fail(400, { invalid: true });
        }
    },
    updatebranch:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const branchID:string = data.get('branchID')?.toString() || ''
        const branchName:string = data.get('branchName')?.toString() || ''
        const branchKey:string = data.get('branchKey')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''
        if (branchName == '' || branchKey == '') {
            return fail(400, { invalidentry: true, branchName:branchName });
        }

        try {
            //check for duplicate key
            const branchResponse = await fetch(getBaseURL(url.origin)+'branch/'+branchKey, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let branchInfo = await branchResponse.json();
            
            if (branchInfo.branchID != null && branchInfo.branchID != branchID) {
                return fail(400, { duplicateentry: true, branchName:branchName });
            }
            
            const response = await fetch(getManageURL(url.origin)+'branch/'+branchID, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'branchName':branchName,'branchKey':branchKey}),
            });
            const results = await response.json()

            if (results.error) {
                return fail(400, { invalid: true });
            } else {
                return { updatesuccess:true }
            }

        } catch (error) {
            return fail(400, { invalid: true });
        }
    },
    deletebranch:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const branchID:string = data.get('branchID')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''

        try {
            const response = await fetch(getManageURL(url.origin)+'branch/'+branchID, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'delete':1}),
            });
            const results = await response.json()

            if (results.error) {
                return fail(400, { invalid: true });
            } else {
                return { deletesuccess:true }
            }

        } catch (error) {
            return fail(400, { invalid: true });
        }
    },
}
import {getManageURL} from '$lib/server/utils'
import {fail,redirect} from '@sveltejs/kit'

export const load = async ({cookies, url}) => {
    let sessionID:string = cookies.get('lu_session_id') || ''
    let results
    let branchresults
    try {
        const response = await fetch(getManageURL(url.origin)+'group/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionID
            },
        });
        results = await response.json()
        const branchresponse = await fetch(getManageURL(url.origin)+'branch/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionID
            },
        });
        branchresults = await branchresponse.json()

    } catch (error) {
        console.error(`Error in load function for /: ${error}`);
    }
    if (results.error) {
        if (results.error == 'Invalid Authorization') {
            throw redirect(307, '/admin/signin')
        }
    } else {
        return {
            groups:results,
            branches:branchresults,
            apiURL: getManageURL(url.origin)
        }
    }

}

export const actions = {
    addgroup:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const groupName:string = data.get('groupName')?.toString() || ''
        const queueSeed:string = data.get('queueSeed')?.toString() || ''
        const queuePrefix:string = data.get('queuePrefix')?.toString() || ''
        const branchID:string = data.get('branchID')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''

        if (groupName == '' || isNaN(parseInt(queueSeed))) {
            return fail(400, { invalidentry: true, groupName:groupName });
        }

        try {
            const response = await fetch(getManageURL(url.origin)+'group/', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'groupName':groupName,'queueSeed':queueSeed, 'queuePrefix':queuePrefix, 'branchID':branchID }),
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
    updategroup:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const groupName:string = data.get('groupName')?.toString() || ''
        const queueSeed:string = data.get('queueSeed')?.toString() || ''
        const queuePrefix:string = data.get('queuePrefix')?.toString() || ''
        const branchID:string = data.get('branchID')?.toString() || ''
        const groupID:string = data.get('groupID')?.toString() || ''

        let sessionID:string = cookies.get('lu_session_id') || ''
        if (groupName == '' || isNaN(parseInt(queueSeed))) {
            return fail(400, { invalidentry: true, groupName:groupName });
        }

        try {
            const response = await fetch(getManageURL(url.origin)+'group/'+groupID, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionID
                },
                body: JSON.stringify({'groupName':groupName,'queueSeed':queueSeed, 'queuePrefix':queuePrefix, 'branchID':branchID }),
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
    deletegroup:async ({ cookies, request, url }) => {
        const data:FormData = await request.formData();
        const groupID:string = data.get('groupID')?.toString() || ''
        let sessionID:string = cookies.get('lu_session_id') || ''

        try {
            const response = await fetch(getManageURL(url.origin)+'group/'+groupID, {
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
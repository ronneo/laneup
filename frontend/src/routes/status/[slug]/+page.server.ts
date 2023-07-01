import {getBaseURL} from '$lib/server/utils'
import type {StatusInfo} from '$lib/types'

export const load = async ({ params, url, fetch }) => {
    let queueDetails:StatusInfo = {
        timestamp:'',
        queue:'',
        status:'',
        branchKey:''
    };
    try {
        const response = await fetch(getBaseURL(url.origin)+'status/'+params.slug, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        queueDetails = await response.json();
    } catch (error) {
        console.error(`Error in load function for /: ${error}`);
    }
 
    return {
        link: 'status/'+params.slug,
        reset: url.searchParams.get('reset')?true:false,
        details: queueDetails,
        key: params.slug,
        branchKey:queueDetails.branchKey,
        ApiURL:getBaseURL(url.origin)
    }
};
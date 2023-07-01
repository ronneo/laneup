import {env} from '$env/dynamic/private'
import {getBaseURL} from '$lib/server/utils'
import type {BranchGroups, BranchInfo} from '$lib/types'
import {redirect} from '@sveltejs/kit'

export const load = async ({params, fetch, url}) => {
    let groupList:Array<BranchGroups>  = []
    let branchID:number = 0
    try {
        const branchResponse = await fetch(getBaseURL(url.origin)+'branch/'+params.slug, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        let branchInfo = await branchResponse.json();
        
        if (branchInfo.branchID == null) {
            throw Error('Branch Not found')
        }
        branchID = parseInt(branchInfo.branchID)
        const response = await fetch(getBaseURL(url.origin)+'group/'+branchID, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        groupList = await response.json();
    } catch (error) {
        console.error(`Error in load function for /: ${error}`);
        throw redirect(303, '/panel/?e=1')
    }
    return {
        'groups': groupList,
        'branchID': branchID,
    }
}
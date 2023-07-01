import {getBaseURL} from '$lib/server/utils'
import {redirect} from '@sveltejs/kit'

import type {BranchGroups} from '$lib/types'

export const load = async ({params, url}) => {
    let groupList:Array<BranchGroups> = [];
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
        throw redirect(303, '/new/?e=1')
    }
    return {
        groups:groupList,
        ApiURL:getBaseURL(url.origin)
    }
};
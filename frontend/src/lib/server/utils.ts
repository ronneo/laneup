import {env} from '$env/dynamic/private'

let API_SERVER:string = env.API_SERVER || ''
if (API_SERVER.endsWith('/')) {
    API_SERVER = API_SERVER.substring(0, API_SERVER.length-1)
}

const API_URL:string = API_SERVER+'/api/' || '/api/'
const AUTH_URL:string = API_SERVER+'/auth/' || '/auth/'
const MANAGER_URL:string = API_SERVER+'/manage/' || '/manager/'
const HTTPS:number = parseInt(env.SET_HTTPS || "0")

const getBaseURL = (hostname?:string):string => {
    if (API_URL.indexOf('http') == -1 && hostname != null) {
        //Sveltekit automatically set to https in production mode
        if (hostname.indexOf('https') != -1 && HTTPS == 0) {
            hostname = hostname.replace("https", "http")
        }
        return hostname+API_URL
    } else {
        return API_URL
    }
}

const getAuthURL = (hostname?:string):string => {
    
    if (AUTH_URL.indexOf('http') == -1 && hostname != null) {
        //Sveltekit automatically set to https in production mode
        if (hostname.indexOf('https') != -1 && HTTPS == 0) {
            hostname = hostname.replace("https", "http")
        }
        return hostname+AUTH_URL
    } else {
        return AUTH_URL
    }
}

const getManageURL = (hostname?:string):string => {
    
    if (MANAGER_URL.indexOf('http') == -1 && hostname != null) {
        //Sveltekit automatically set to https in production mode
        if (hostname.indexOf('https') != -1 && HTTPS == 0) {
            hostname = hostname.replace("https", "http")
        }
        return hostname+MANAGER_URL
    } else {
        return MANAGER_URL
    }
}


export {
    getBaseURL,
    getAuthURL,
    getManageURL
}
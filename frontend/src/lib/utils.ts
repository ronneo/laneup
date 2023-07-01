
const validateEmail = (email:string):boolean => {
    const val = String(email)
        .toLowerCase()
        .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (val == null || val.length == 0) return false
    return true
};

const validatePassword = (password:string):boolean => {
    const val = String(password)
        .match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    )
    if (val == null || val.length == 0) return false
    return true
}

const getWSUrl = (servername:string, port:string):string => {
    let wsurl:string = ''

    if (servername == '/') {
        if (window.location.protocol === "https:") {
            wsurl = 'wss://'
        } else {
            wsurl = 'ws://'
        }
        wsurl += window.location.hostname + ':' + port
    } else {
        if (servername.indexOf("https") != -1) {
            wsurl = 'wss://'+servername.replace('https://','')
        } else if (servername.indexOf("http") != -1) {
            wsurl = 'ws://'+servername.replace('http://','')
        } else {
            wsurl = 'ws://'+servername
        }
        wsurl +=  ':' + port
    }
    return wsurl

}

export {
    validateEmail,
    validatePassword,
    getWSUrl
}
import crypto from 'crypto'

export const generateKey = (id, mobile) => {
    return crypto.createHash('md5').update(id+mobile+Date.now()+generateString(5)).digest('hex')
}

const generateString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

export const generateSession = (id, source) => {
    return crypto.createHash('md5').update(id+source+Date.now()+generateString(5)).digest('hex')
}

export const generateSalt = (length) => {
    return crypto.randomBytes(16).toString('base64');
}

export const generatePasswordHash = (password, salt) => {
    return crypto.createHash('sha256').update(salt+password).digest('hex')
}

export const validateEmail = (email) => {
    let results = String(email)
        .toLowerCase()
        .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (results === null) return false;
    return true;
};

export const validatePassword = (password) => {
    //password requirement
    //at least 8 characters with lowercase, uppercase, digit and "@.#$!%*?&" symbol
    let results = String(password)
        .match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[a-zA-Z\d@.#$!%*?&]{8,}$/
    );
    if (results === null) return false;
    return true;
}
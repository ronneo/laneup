import express from 'express'
import db from '../db/queries.js'
import {authorization} from '../middleware/authorization.js'
import {
    generateSalt,
    generatePasswordHash,
    generateSession,
    validateEmail
} from '../lib/utils.js'

let router = express.Router()

router.post('/create/',(request, response) => {
    const email = request.body.email
    const password = request.body.password
    const companyID = request.body.cid

    const salt = generateSalt(16)
    const hash = generatePasswordHash(password, salt)

    db.getAdminCount().then(results => {
        if (results.count > 0) {
            return Promise.reject('Admin already exist');
        } else {
            return db.createAdmin(email, hash, salt, companyID);
        }
    })
    .then(results => {
        response.status(200).json({'id':results.adminID})
    }).catch(err => {
        console.error('Creating Admin failed: ', err);
        response.status(500).send();
    })
})

router.get('/install/', (request, response) => {
    db.getAdminCount().then(results => {
        let returnRes = {'installed':false}
        if (results.count > 0) {
            returnRes = {'installed':true}
        }
        response.status(200).json(returnRes)
    }).catch(err => {
        console.error(err)
    })

})

router.post('/login/',(request, response) => {
    const email = request.body.email
    const password = request.body.password
    const companyID = request.body.cid
    const ipAddress = request.socket.remoteAddress;
    const source = request.body.source?request.body.source:'web'

    //validation
    if (!validateEmail(email)) {
        return response.status(401).json({error:'Invalid Authorization'})
    }

    db.getAdmin(email).then(results => {
        const hash = generatePasswordHash(password, results.salt)
        if (hash !== results.password || results.companyID != companyID) {
            throw new Error("Invalid password")
        } else {
            //create session
            const newSession = generateSession(results.adminID, source)
            return db.createSession(results.adminID, newSession, source, ipAddress)
        }
    }).then(createResults => {
        response.status(200).json({'sessionid':createResults.sessionID})
    }).catch(err => {
        return response.status(401).json({error:'Invalid Authorization'})
    })
})

router.post('/logout/',(request, response) => {
    const key = request.params.key
    db.deleteSession(key).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.error(err)
    })
})

router.patch('/admin/', authorization,(request, response) => {
    const password = request.body.password
    
    if (!response.locals.user) {
        return response.status(403).json({ error: 'Invalid Authorization' })
    }
    const salt = generateSalt(16)
    const hash = generatePasswordHash(password, salt)

    db.updateAdmin(response.locals.user, hash, salt).then(results => {
        return response.status(200).json({'success':true})
    }).catch(err => {
        return response.status(403).json({ error: 'Invalid Authorization' })
    })
})

export default router
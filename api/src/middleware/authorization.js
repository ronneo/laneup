import db from '../db/queries.js'
const source = 'web'

const authorization = (req, res, next) => {
    const sessionID = req.headers.authorization
    if (!sessionID) {
        return res.status(403).json({ error: 'Invalid Authorization' })
    } else {
        db.getSession(sessionID, source).then(results => {
            res.locals.user = results.adminID
            res.locals.cid = results.companyID
            next()
        }).catch(err => {
            console.error(err)
            return res.status(403).json({ error: 'Invalid Authorization' })
        })
    }
}

export {
    authorization
}
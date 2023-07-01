import express from 'express'
import db from '../db/queries.js'

let router = {}
router.wsconn = null
router.routes = express.Router()

router.routes.post('/status/delete/:id', (request, response) => { 
    const key = request.params.id
    const status = request.body.status
    db.setQueueStatusByKey(key,status).then(results => {
        response.status(200).json({'id':results.id})
        router.wsconn.broadcastNewEntry(results.groupID)
    }).catch(err => {
        console.error(err)
    })
})
router.routes.get('/status/:key',(request, response) => {
    const key = request.params.key
    db.getQueueEntryStatus(key).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.error(err)
    })
})
router.routes.get('/branch/:key',(request, response) => {
    const key = request.params.key
    db.getBranchByKey(key).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.error(err)
    })
})
router.routes.get('/group/:id', (request, response) => {
    const gid = parseInt(request.params.id)
    db.getGroups(gid).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.error(err)
    })
})
router.routes.post('/user/', (request, response) => { 
    const id = parseInt(request.body.id)
    const mobile = request.body.mobile

    db.submitQueue(id, mobile).then(results => {
        response.status(200).json({'key':results.key})
        router.wsconn.broadcastNewEntry(results.groupID)
    }).catch(err => {
        console.error(err)
    })

})

router.routes.post('/user/:id', (request, response) => { 
    //TODO authentication
    const userGroupID = parseInt(request.params.id)
    const status = request.body.status

    db.setQueueStatus(userGroupID, status).then(results => {
        response.status(200).json({'id':userGroupID})
        router.wsconn.broadcastNewEntry(results.groupID)
    }).catch(err => {
        console.error(err)
    })
})

export default router

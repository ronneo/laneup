import express from 'express'
import db from '../db/queries.js'
import messaging from '../lib/messaging/twilio.js'

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
        
        Promise.all([
            db.getQueueEntryStatus(results.key),
            db.getQueueStatus(results.key)
        ]).then(([statusResults, QueueResults]) => {
            let waittime = Math.ceil(parseInt(QueueResults.time)/60);
            messaging.submtQueueMessage(statusResults.mobile, statusResults.queue, waittime);
        })
        
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
        response.status(200).json({'id':userGroupID});
        router.wsconn.broadcastNewEntry(results.groupID);

        //check for the next entry and alert them. By number
        //we need a flag to indicate if we can trigger the alert, 
        //in cases if the queue is jumped
        if (request.body.next) {
            db.getNextQueueStatus(userGroupID, 2).then(nextResults => {
                let waittime = Math.ceil(parseInt(nextResults.time)/60);
                messaging.reminderMessage(nextResults.mobile, waittime);
            })
        }
    }).catch(err => {
        console.error(err)
    })
})

export default router

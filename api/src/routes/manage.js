import express from 'express'
import db from '../db/queries.js'
import {authorization} from '../middleware/authorization.js'

let router = express.Router()

router.get('/branch/', authorization,(request, response) => {
    const companyID = response.locals.cid
    db.getBranches(companyID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.put('/branch/', authorization,(request, response) => {
    const companyID = response.locals.cid
    const branchName = request.body.branchName
    const branchKey = request.body.branchKey

    db.addBranch(branchName, branchKey, companyID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.patch('/branch/:key', authorization,(request, response) => {
    const branchID = request.params.key
    const branchName = request.body.branchName
    const branchKey = request.body.branchKey

    db.editBranch(branchName, branchKey, branchID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/branch/:key', authorization,(request, response) => {
    const branchID = request.params.key

    db.deleteBranch(branchID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.get('/group/', authorization,(request, response) => {
    const companyID = response.locals.cid
    db.getAllGroups(companyID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.put('/group/', authorization,(request, response) => {
    const branchID = request.body.branchID
    const groupName = request.body.groupName
    const queueSeed = request.body.queueSeed
    const queuePrefix = request.body.queuePrefix

    db.addGroup(groupName, queueSeed, queuePrefix, branchID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.patch('/group/:key', authorization,(request, response) => {
    const groupID = request.params.key
    const groupName = request.body.groupName
    const queueSeed = request.body.queueSeed
    const queuePrefix = request.body.queuePrefix
    const branchID = request.body.branchID

    db.editGroup(groupName, queueSeed, queuePrefix, branchID, groupID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/group/:key', authorization,(request, response) => {
    const groupID = request.params.key

    db.deleteGroup(groupID).then(results => {
        response.status(200).json(results)
    }).catch(err => {
        console.log(err)
    })
})

export default router
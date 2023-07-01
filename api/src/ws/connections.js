import db from '../db/queries.js'
import WebSocket from 'ws';

const openConnections = new Map()

const initialConnection = (ws, req) => {
    const uid = req.headers['sec-websocket-key'];
    ws.on('error', console.error);
  
    ws.on('message', (data) => {

        let msgToken = JSON.parse(data.toString())
        
        if (msgToken.type === 'status') {
            db.getQueueStatus(msgToken.key).then(details => {
                let connDetails = {
                    connection:ws,
                    type:'client',
                    groupID:details.groupID
                }
                openConnections.set(uid, connDetails)
                console.log('sending status ACK: ', uid)
                ws.send(JSON.stringify({type:"update",count:details.count,time:details.time}))
            }).catch(error => {
                console.log(error)
            })          
        }
        if (msgToken.type === 'panel') {
            db.getBranchStatus(msgToken.branchID).then(details => {
                let connDetails = {
                    connection:ws,
                    type:'panel',
                    branchID:msgToken.branchID
                }
                openConnections.set(uid, connDetails)
                console.log('sending panel ACK:', uid)
                ws.send(JSON.stringify({type:"update",groups:details}))
            }).catch(error => {
                console.log(error)
            }) 
        }
    });

    ws.on('close', (data) => {
        //remove connections from map
        openConnections.delete(uid)
    })
    
    ws.send('ack');
}

const broadcastNewEntry = (groupID) => {
    db.getQueueStatusByID(groupID).then(details => {
        openConnections.forEach((client) => {
            if (client.connection == undefined) return
            if (client.type === 'client' && parseInt(client.groupID) === groupID && client.connection.readyState === WebSocket.OPEN) {
                console.log('sending status update:', groupID)
                client.connection.send(JSON.stringify({type:"update",count:details.count,time:details.time}))
            }
        });
        broadcastToBranches(details.branchID)
    }).catch(error => {
        console.log(error)
    }) 
}

const broadcastToBranches = (branchID) => {
    db.getBranchStatus(branchID).then(details => {
        openConnections.forEach((client) => {
            if (client.connection == undefined) return
            if (client.type === 'panel' && parseInt(client.branchID) === branchID && client.connection.readyState === WebSocket.OPEN) {
                console.log('sending panel update:', branchID)
                client.connection.send(JSON.stringify({type:"update",groups:details}))
            }
        })
    }).catch(error => {
        console.log(error)
    }) 
}

export default {
    initialConnection,
    broadcastNewEntry,
    broadcastToBranches
}
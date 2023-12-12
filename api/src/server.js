import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as dotenv from 'dotenv'
import wsconn from './ws/connections.js'
import { WebSocketServer } from 'ws';
import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import manageRoutes from './routes/manage.js'

dotenv.config({
    path:`.env.${process.env.NODE_ENV}`
})
const port = process.env.PORT

//Start websocket server
if (process.env.PUBLIC_WS_PORT != '' && process.env.PUBLIC_WS_PORT != 0) {
    const wss = new WebSocketServer({ port: process.env.PUBLIC_WS_PORT })
    wss.on('connection', wsconn.initialConnection)
}

const app = express()
app.use(cors({origin: '*'}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api', apiRoutes.routes)
app.use('/auth', authRoutes)
app.use('/manage', manageRoutes)

try {
    const {handler} = await import('../fe/handler.js')
    app.use(handler)
}
catch(err) {
    console.log('Unable to load frontend, operating as an API server')
}

export default app;
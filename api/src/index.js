import server from './server.js'
import * as dotenv from 'dotenv'

dotenv.config()
const port = process.env.PORT

//Start webserver
server.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

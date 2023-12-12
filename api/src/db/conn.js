import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({
    path:`.env.${process.env.NODE_ENV}`
})

export default new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
}) 
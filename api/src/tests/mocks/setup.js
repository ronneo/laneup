/*
set up database with dummy data for testing
reusing the demo_data.sql in the db folder
*/
import pool from '../../db/conn.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const setup = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const dropsql = fs.readFileSync(path.resolve(__dirname, '../../../../db/drop.sql')).toString();
    const schemasql = fs.readFileSync(path.resolve(__dirname, '../../../../db/schema.sql')).toString();
    const testdata = fs.readFileSync(path.resolve(__dirname, '../../../../db/demo_data.sql')).toString();
    
    await pool.query(dropsql + "\n" + schemasql + "\n" + testdata, []);
    pool.end();
}

export default setup
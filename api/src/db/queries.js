import {generateKey} from '../lib/utils.js'
import {QUEUE_STATUS} from '../lib/enum.js'
import pool from './conn.js'

const getBranches = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM company_branches WHERE company_id = $1 ORDER BY branch_id ASC', [id], (error, results) => {
            if (error) {
                return reject(error)
            }
            let output = []
            results.rows.forEach(row => {
                output.push({
                    branchID:row['branch_id'],
                    branchName:row['branch_name'],
                    branchKey:row['branch_key']
                })
            })
            resolve(output)
        })
    })
}

const addBranch = (branchName, branchKey, companyID) => {
    const query = `
    INSERT INTO company_branches (branch_name, branch_key, company_id) 
    VALUES ($1, $2, $3)
    RETURNING branch_id, branch_name
    `
    return new Promise((resolve, reject) => {
        pool.query(query, [branchName, branchKey, companyID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                branchID:results.rows[0].branch_id,
                branchName:results.rows[0].branch_name
            })
        })
    })
}

const editBranch = (branchName, branchKey, branchID) => {
    const query = `
    UPDATE company_branches SET branch_name = $1, branch_key = $2 
    WHERE branch_id = $3
    RETURNING branch_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [branchName, branchKey, branchID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                branchID:results.rows[0].branch_id,
            })
        })
    })
}

const deleteBranch = (branchID) => {
    const query = `
    DELETE FROM company_branches WHERE branch_id = $1
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [branchID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                success:true
            })
        })
    })
}

const getAllGroups = (id) => {
    const query = `
    SELECT group_id, group_name, queue_seed, queue_prefix, branch_name, branch_id
    FROM groups LEFT JOIN company_branches USING (branch_id)
    WHERE company_id = $1 
    ORDER BY group_id ASC
    `
    return new Promise((resolve, reject) => {
        pool.query(query, [id], (error, results) => {
            if (error) {
                return reject(error)
            }
            let output = []
            results.rows.forEach(row => {
                output.push({
                    groupID:row['group_id'],
                    groupName:row['group_name'],
                    queueSeed:row['queue_seed'],
                    queuePrefix:row['queue_prefix'],
                    branchID:row['branch_id'],
                    branchName:row['branch_name'],
                })
            })
            resolve(output)
        })
    })
}

const addGroup = (groupName, queueSeed, queuePrefix, branchID) => {
    const query = `
    INSERT INTO groups (group_name, queue_seed, queue_prefix, branch_id) 
    VALUES ($1, $2, $3, $4)
    RETURNING group_id, group_name
    `
    return new Promise((resolve, reject) => {
        pool.query(query, [groupName, queueSeed, queuePrefix, branchID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                branchID:results.rows[0].group_id,
                branchName:results.rows[0].group_name
            })
        })
    })
}

const editGroup = (groupName, queueSeed, queuePrefix, branchID, groupID) => {
    const query = `
    UPDATE groups SET group_name = $1, queue_seed = $2, queue_prefix = $3, branch_id = $4
    WHERE group_id = $5
    RETURNING group_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [groupName, queueSeed, queuePrefix, branchID, groupID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                branchID:results.rows[0].group_id,
            })
        })
    })
}

const deleteGroup = (groupID) => {
    const query = `
    DELETE FROM groups WHERE group_id = $1
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [groupID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({
                success:true
            })
        })
    })
}

const getGroups = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT group_id, group_name FROM groups WHERE branch_id = $1 ORDER BY group_id ASC', [id], (error, results) => {
            if (error) {
                return reject(error)
            }
            let output = []
            results.rows.forEach(row => {
                output.push({
                    groupID:row['group_id'],
                    groupName:row['group_name']
                })
            })
            resolve(output)
        })
    })
}

const getBranchByKey = (key) => {
    const query = `
    SELECT branch_name, branch_id FROM company_branches WHERE branch_key = $1
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [key], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount == 0) {
                //not found
                return resolve({})
            }
            return resolve({
                branchID:results.rows[0].branch_id,
                branchName:results.rows[0].branch_name
            })
        })
    })
}

const submitQueue = (id, mobile) => {
    //generate key
    const key = generateKey(id, mobile)
    
    const query = `
    INSERT INTO users (group_id, time_created, status, mobile, key, queue) 
    SELECT 
        $1, current_timestamp, $2, $3, $4,  CASE WHEN MAX(queue) IS NULL THEN 1 ELSE MAX(queue)+1 END FROM users 
    WHERE 
        group_id = $1 AND time_created > CURRENT_DATE
    RETURNING group_user_id, queue, group_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [id, QUEUE_STATUS.WAITING, mobile, key], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({'key':key, 'groupID':results.rows[0].group_id})
        })
    })
}

const getQueueEntryStatus = (key) => {
    const query = `
    SELECT * FROM users 
    LEFT JOIN groups USING (group_id) 
    LEFT JOIN company_branches USING (branch_id) 
    WHERE key = $1 
    `
    return new Promise((resolve, reject) => {
        pool.query(query, [key], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount == 0) {
                return resolve({})
            }
            resolve({
                'branchKey':results.rows[0]['branch_key'],
                'mobile':results.rows[0]['mobile'],
                'timestamp':results.rows[0]['time_created'],
                'queue':results.rows[0]['queue_prefix']+""+(parseInt(results.rows[0]['queue'])+parseInt(results.rows[0]['queue_seed'])),
                'status':results.rows[0]['status']
            })
        })
    })
}

const recalcQueueTime = (groupID) => {
    //a queue number has been cleared, recalc the est time
    const query = `
    UPDATE groups SET est_time = (SELECT ROUND(AVG(seconds_diff)) FROM (
        SELECT group_id, ROUND(EXTRACT(EPOCH FROM (time_cleared - time_created))) AS seconds_diff 
        FROM users 
        WHERE group_id = $1 AND status = $2 
        ORDER BY time_created DESC LIMIT 10
    ) AS last_transactions WHERE seconds_diff IS NOT NULL) WHERE group_id = $1
    `
    pool.query(query, [groupID, QUEUE_STATUS.COMPLETED], (error, results) => {
        if (error) {
            console.error(error)
        }
    })
}

const setQueueStatus = (userGroupID, status) => {
    let query = `
    UPDATE users SET status = $1 WHERE group_user_id = $2 
    RETURNING group_id, group_user_id
    `

    if (status == QUEUE_STATUS.COMPLETED || status === QUEUE_STATUS.CANCELLED) {
        query = `
        UPDATE users SET status = $1, time_cleared = now() WHERE group_user_id = $2 
        RETURNING group_id, group_user_id
        `
    }

    return new Promise((resolve, reject) => {
        pool.query(query, [status, userGroupID], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (status == QUEUE_STATUS.COMPLETED) {
                recalcQueueTime(results.rows[0].group_id)
            }
            resolve({'id':userGroupID, 'groupID':results.rows[0].group_id})
        })
    })

}

const setQueueStatusByKey = (key, status) => {
    let query = `
    UPDATE users SET status = $1 WHERE key = $2 
    RETURNING group_id, group_user_id
    `

    if (status == QUEUE_STATUS.COMPLETED || status === QUEUE_STATUS.CANCELLED) {
        query = `
        UPDATE users SET status = $1, time_cleared = now() WHERE key = $2 
        RETURNING group_id, group_user_id
        `
    }

    return new Promise((resolve, reject) => {
        pool.query(query, [status, key], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (status == QUEUE_STATUS.COMPLETED) {
                recalcQueueTime(results.rows[0].group_id)
            }
            resolve({'id':key, 'groupID':results.rows[0].group_id})
        })
    })
}

const getQueueStatus = (key) => {
    const query = `
    WITH entry AS (
        SELECT group_id, time_created 
        FROM users 
        WHERE key = $2
    )
    SELECT 
        CASE WHEN queue_count IS NULL THEN 0 ELSE queue_count END AS queue_count, 
        est_time, group_id
    FROM groups 
    LEFT JOIN (
        SELECT COUNT(*) AS queue_count, group_id 
        FROM users
        WHERE 
            status = $1
            AND time_created > CURRENT_DATE
            AND time_created <= (SELECT time_created FROM entry)
            AND group_id = (SELECT group_id FROM entry)
        GROUP BY group_id
    ) AS entry_count USING (group_id)
    WHERE group_id = (SELECT group_id FROM entry)
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [QUEUE_STATUS.WAITING, key], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rows.length == 0) {
                resolve({})
            } else {
                resolve({
                    count:results.rows[0]['queue_count'],
                    time:results.rows[0]['est_time'],
                    groupID:results.rows[0]['group_id'],
                })
            }

        })
    })
}

const getNextQueueStatus = (userGroupID, count) => {
    //get the next N queue number away from key
    const query = `
    WITH entry AS (
        SELECT group_id, time_created, mobile 
        FROM users 
        WHERE group_user_id = $2
    )
     
    SELECT mobile, est_time, key
    FROM users
    LEFT JOIN groups ON (users.group_id = groups.group_id)
    WHERE 
        status = $1
        AND time_created > CURRENT_DATE
        AND time_created >= (SELECT time_created FROM entry)
        AND users.group_id = (SELECT group_id FROM entry)
    ORDER BY time_created DESC
    OFFSET $3
    FETCH FIRST ROW ONLY
    `;

    let offset = parseInt(count) - 1;
    if (offset < 0) {
        return;
    }

    return new Promise((resolve, reject) => {
        pool.query(query, [QUEUE_STATUS.WAITING, userGroupID, offset], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rows.length == 0) {
                resolve({})
            } else {
                resolve({
                    mobile:results.rows[0]['mobile'],
                    time:results.rows[0]['est_time'],
                    key:results.rows[0]['key'],
                })
            }

        })
    })
}

const getQueueStatusByID = (groupID) => {
    const query = `
    SELECT 
        CASE WHEN queue_count IS NULL THEN 0 ELSE queue_count END AS queue_count, 
		est_time, group_id, branch_id
    FROM groups 
    LEFT JOIN (
		SELECT group_id, COUNT(*) AS queue_count 
		FROM users 
		WHERE status = $1 
            AND group_id = $2 
            AND time_created > CURRENT_DATE
		GROUP BY group_id) AS queue_groups
	USING (group_id) 
    WHERE 
        group_id = $2
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [QUEUE_STATUS.WAITING, groupID], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount <= 0) {
                resolve({})
            } else {
                resolve({
                    count:results.rows[0]['queue_count'],
                    time:results.rows[0]['est_time'],
                    groupID:results.rows[0]['group_id'],
                    branchID:results.rows[0]['branch_id'],
                })
            }
        })
    })  
}

const getBranchStatus = (branchID) => {
    const query = `
    SELECT
        orig.group_id,
        est_time,
        queue_prefix,
        queue_seed,
        queue_list,
        CASE WHEN queue_count IS NULL THEN 0 ELSE queue_count END AS queue_count,
        queue_ranking.queue AS next_queue,
        group_user_id AS next_queue_id
        FROM groups orig
		LEFT JOIN (
            SELECT 
                group_id, 
                ARRAY_AGG(group_user_id || '|' || queue ORDER BY time_created ASC) AS queue_list,
                COUNT(*) AS queue_count
            FROM users 
            WHERE 
                time_created > CURRENT_DATE
                AND status = 'WAITING'
                AND group_id IN (SELECT group_id FROM groups WHERE branch_id = $1 ) 
            GROUP BY group_id
        ) AS group_sum USING (group_id)
        LEFT JOIN (
            SELECT
                group_id,
                rank() OVER (PARTITION BY group_id order by time_cleared desc) as rank_num,
                queue,
                group_user_id
            FROM users
            WHERE 
                status = 'COMPLETED'
                AND time_created > CURRENT_DATE
        ) AS queue_ranking ON (orig.group_id = queue_ranking.group_id AND rank_num=1)  
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [branchID], (error, results) => {
            if (error) {
                return reject(error)
            }
            let details = {}
            results.rows.forEach(row => {
                let nextQueue = row['next_queue'];
                if (nextQueue === null) {
                    nextQueue = ''
                } else {
                    nextQueue = row['queue_prefix'] + (parseInt(row['queue_seed'])+ parseInt(row['next_queue']))
                }
                let queueList = [];
    
                if (row['queue_list'] !== null) {
                    queueList = row['queue_list'].map((queueinfo) => {
                        const queueToken = queueinfo.split('|')
                        return {'id':queueToken[0],'queue':row['queue_prefix'] + (parseInt(row['queue_seed'])+ parseInt(queueToken[1]))}
                    })
                }
    
                details[row['group_id']] = {
                    count: row['queue_count'],
                    time: row['est_time'],
                    groupID: row['group_id'],
                    nextQueue: nextQueue,
                    nextQueueID: row['next_queue_id'],
                    queue: queueList
                }
            })
            resolve(details)
        })
    })
}

/* Admin Auth query */
const getAdmin = (email) => {
    const query = `SELECT admin_id, company_id, password, salt FROM admins WHERE email = $1`
    return new Promise((resolve, reject) => {
        pool.query(query, [email], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount === 0) {
                return reject(error)
            }
            resolve({
                adminID: results.rows[0]['admin_id'],
                companyID: results.rows[0]['company_id'],
                password: results.rows[0]['password'],
                salt: results.rows[0]['salt']
            })
        })
    })
}

const getAdminCount = () => {
    const query = `SELECT COUNT(admin_id) as admin_count FROM admins`
    return new Promise((resolve, reject) => {
        pool.query(query, [], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount === 0) {
                return reject(error);
            }
            resolve({
                count: parseInt(results.rows[0]['admin_count'])
            })
        })
    })
}

const createAdmin = (email, password, salt, companyID) => {
    const query = `
    INSERT INTO admins (email, password, salt, company_id) 
    VALUES ($1, $2, $3, $4)
    RETURNING admin_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [email, password, salt, companyID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({'adminID':results.rows[0]['admin_id']})
        })
    })
}

const updateAdmin = (adminID, password, salt) => {
    const query = `
    UPDATE admins SET password = $1, salt = $2 WHERE admin_id = $3
    RETURNING admin_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [password, salt, adminID], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({'adminID':results.rows[0]['admin_id']})
        })
    })
}

const createSession = (adminID, sessionID, source ,ipAddr) => {
    const query = `
    INSERT INTO sessions (admin_id, session_id, source, ip_address, time_created, last_access) 
    VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) ON CONFLICT (admin_id, source)
    DO 
        UPDATE SET last_access = current_timestamp, session_id = $2
    RETURNING session_id
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [adminID, sessionID, source, ipAddr], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({'sessionID':results.rows[0]['session_id']})
        })
    })
}

const deleteSession = (key) => {
    const query = `
    DELETE FROM sessions WHERE session_id = $1
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [key], (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve({'result':'success'})
        })
    })
}

const getSession = (sessionID, source) => {
    const query = `
    SELECT admin_id, company_id FROM sessions LEFT JOIN admins USING (admin_id) WHERE session_id = $1 AND source = $2
    `

    return new Promise((resolve, reject) => {
        pool.query(query, [sessionID, source], (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.rowCount == 0) {
                return reject(error)
            }
            resolve({adminID:results.rows[0]['admin_id'],companyID:results.rows[0]['company_id']})
        })
    })
}

export default {
    getBranches,
    addBranch,
    editBranch,
    deleteBranch,
    getBranchByKey,
    getAllGroups,
    addGroup,
    editGroup,
    deleteGroup,
    getGroups,
    submitQueue,
    getQueueStatus,
    getQueueStatusByID,
    getQueueEntryStatus,
    getNextQueueStatus,
    getBranchStatus,
    setQueueStatus,
    setQueueStatusByKey,
    getAdmin,
    getAdminCount,
    createAdmin,
    updateAdmin,
    createSession,
    deleteSession,
    getSession
}
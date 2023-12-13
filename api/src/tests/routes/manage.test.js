import server from '../../server.js'
import supertest from 'supertest'
import pool from '../../db/conn.js'
import db from '../../db/queries.js'
import {generateSession} from '../../lib/utils.js'
import {jest} from '@jest/globals'

let sessionKey = '';
let adminID = 0;

beforeAll(() => {
    //setup authorization
    return db.createAdmin('test@example.com', 'dummyhash', 'dummysalt', '1').then((results) => {
        sessionKey = generateSession(results.adminID, 'web');
        adminID = results.adminID;
        return db.createSession(results.adminID, sessionKey, 'web', '127.0.0.1');
    });
    
})

afterAll(async () => {
    //delete the admin 
    await db.deleteSession(sessionKey);
    await db.deleteAdmin(adminID);
    //close off all postgres connection to stop asynchronous operations
    pool.end();
});

const request = supertest(server);

describe('Branches Add/Edit/Delete/Get', () => {
    let branchID = 0;
    test("Create new branch", done => {
        request.put('/manage/branch/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .send({
            cid:1,
            branchName:'New ABC branch',
            branchKey:'AAA123'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            branchID = response.body.branchID;
            expect(response.body.branchName).toBe('New ABC branch');
            done();
        })
    });

    test('Get Branch', done => {
        request.get('/manage/branch/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body).toEqual(expect.arrayContaining([{
                'branchID':branchID,
                'branchName':'New ABC branch',
                'branchKey':'AAA123'
            }]))

            done();
        });
    });

    test('Update Branch', done => {
        request.patch('/manage/branch/'+branchID)
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .send({
            'branchName':'Old ABC branch',
            'branchKey':'BBB123'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.branchID).toBe(branchID);
            done();
        });
    });

    test('Get Branch', done => {
        request.get('/manage/branch/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body).toEqual(expect.arrayContaining([{
                'branchID':branchID,
                'branchName':'Old ABC branch',
                'branchKey':'BBB123'
            }]))

            done();
        });
    });

    test('Delete Branch', done => {
        request.delete('/manage/branch/'+branchID)
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.success).toBeTruthy();
            done();
        });
    });

})

describe('Groups Add/Edit/Delete/Get', () => {
    let groupID;
    test("Create new group", done => {
        request.put('/manage/group/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .send({
            branchID:1,
            groupName:'Test Group',
            queueSeed:20,
            queuePrefix:'Z'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            groupID = response.body.groupID;
            expect(response.body.groupName).toBe('Test Group');
            done();
        })
    });

    test('Get Group', done => {
        request.get('/manage/group/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body).toEqual(expect.arrayContaining([{
                'branchID':1,
                'branchName':'Compassvale One',
                'queuePrefix':'Z',
                'queueSeed':20,
                'groupName':'Test Group',
                'groupID':groupID
            }]))
            
            done();
        });
    });

    test('Update Group', done => {
        request.patch('/manage/group/'+groupID)
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .send({
            'queuePrefix':'BB',
            'queueSeed':5000,
            'groupName':'Test Group Changed',
            'branchID':1,
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.groupID).toBe(groupID);
            done();
        });
    });

    test('Get Group', done => {
        request.get('/manage/group/')
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body).toEqual(expect.arrayContaining([{
                'branchID':1,
                'branchName':'Compassvale One',
                'queuePrefix':'BB',
                'queueSeed':5000,
                'groupName':'Test Group Changed',
                'groupID':groupID
            }]))
            
            done();
        });
    });

    test('Delete Group', done => {
        request.delete('/manage/group/'+groupID)
        .set({
            'Content-type': 'application/json',
            'Authorization': `${sessionKey}`
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.success).toBeTruthy();
            done();
        });
    });

});
import server from '../../server.js'
import wsconn from '../../ws/connections.js'
import supertest from 'supertest'
import pool from '../../db/conn.js'
import {QUEUE_STATUS} from '../../lib/enum.js'
import {jest} from '@jest/globals'
  
afterAll(() => {
    //close off all postgres connection to stop asynchronous operations
    pool.end();
});

const request = supertest(server);
/*
Mock web socket functions that cannot be tested
*/
jest.mock('../../ws/connections.js');

describe('Creating and deleting queue', () => {
    let key = '';

    test('Submit new queue', done => {
        let payload = {
            'id':1,
            'mobile':'1234567'
        }
        request.post('/api/user/')
        .set('Content-type', 'application/json')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            key = response.body.key
            expect(key).toHaveLength(32);
            done();
        });
    
    });

    test('Check queue status', done => {
        request.get('/api/status/'+key)
        .set('Content-type', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.status).toEqual(QUEUE_STATUS.WAITING)
            done();
        })
    });

    test('Deleting queue', done => {
        let deletePayload = {
            'id':key,
            'status':QUEUE_STATUS.CANCELLED
        }
        request.post('/api/status/delete/'+key)
        .set('Content-type', 'application/json')
        .send(deletePayload)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body.id).toEqual(key)
            done();
        });
    });

});

describe('Checking on groups and branches', () => {
    test('Pull group', done => {
        request.get('/api/group/1')
        .set('Content-type', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            let groups = response.body;
            expect(groups.length).toBe(3);
            done();
        })
    });
    test('Pull branch', done => {
        request.get('/api/branch/abc123')
        .set('Content-type', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
            expect(response.body).toEqual(expect.objectContaining({ branchID: 1, branchName: 'Compassvale One' }))
            done();
        })
    });
})



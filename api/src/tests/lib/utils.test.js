import {
    generateKey,
    generateSalt,
    generatePasswordHash,
    generateSession,
    validateEmail,
    validatePassword
} from '../../lib/utils';

test('key generation', () => {
    let key = generateKey('1', '1234567');
    let newkey = generateKey('1', '1234567');

    expect(key).toHaveLength(32);
    expect(key).not.toBe(newkey);
});

test('salt generation', () => {
    let key = generateSalt();
    let newkey = generateSalt();

    expect(key).toHaveLength(24);
    expect(key).not.toBe(newkey);
});

test('password matching', () => {
    let salt = 't362fW+HJoea6ixxJOvyBw==';
    let password = 'password';

    let pregeneratedHash = '2726e68ab2b2fceed6d54d431f82577624a10b7b0b39626c01d50f0b26f34c6f';
    let hash = generatePasswordHash(password, salt);
    
    expect(hash).toBe(pregeneratedHash);
});

test('session generation', () => {
    let session = generateSession(1, 'web');

    expect(session).toHaveLength(32);
    let newSession = generateSession(1, 'web');
    expect(session).not.toBe(newSession);
});

test('email validation', () => {
    let correctEmailA = 'ron.neo@gmail.com';
    let correctEmailB = 'ron.neo@gmail.co.uk';
    let incorrectEmailA = 'ron.neo@gmail';
    let incorrectEmailB = 'abc123';
    let incorrectEmailC = '';
    let incorrectEmailD = 123;

    expect(validateEmail(correctEmailA)).toBe(true);
    expect(validateEmail(correctEmailB)).toBe(true);

    expect(validateEmail(incorrectEmailA)).toBe(false);
    expect(validateEmail(incorrectEmailB)).toBe(false);
    expect(validateEmail(incorrectEmailC)).toBe(false);
    expect(validateEmail(incorrectEmailD)).toBe(false);
});

test('password validation', () => {
    let correctPassA = 'abcdEF1234?';

    let incorrectPassA = '';
    let incorrectPassB = 'aA1';
    let incorrectPassC = 'aaaaaaaaaaaaaa';
    let incorrectPassD = '123456789876543';
    let incorrectPassE = 'abcd12345678';

    expect(validatePassword(correctPassA)).toBe(true);

    expect(validatePassword(incorrectPassA)).toBe(false);
    expect(validatePassword(incorrectPassB)).toBe(false);
    expect(validatePassword(incorrectPassC)).toBe(false);
    expect(validatePassword(incorrectPassD)).toBe(false);
    expect(validatePassword(incorrectPassE)).toBe(false);
})
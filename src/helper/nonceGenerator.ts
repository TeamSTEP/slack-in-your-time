import { randomBytes } from 'crypto';

export const nonceGenerator = () => {
    // NOTE: this implementation is still pseudorandom data but it should be "secure enough" (i.e., improve this later)
    // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    const nonceBuffer = randomBytes(16);
    // later we can improve this system to use something like this: https://stackoverflow.com/questions/17201450/salt-and-hash-password-in-nodejs-w-crypto
    const token = nonceBuffer.toString('hex');

    return token;
};

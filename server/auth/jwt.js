const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

class TokenProvider {
    constructor (publicKey, signerKey) {
        this.publicKey = publicKey;
        this.signerKey = signerKey;
    }

    generate() {
        const user = uuid();
        return jwt.sign({ user }, 's3cr3t', { expiresIn: '1h' });
    }

    verify(token) {
        const payload = jwt.verify(token, 's3cr3t');
        return payload;
    }
}

module.exports = TokenProvider;

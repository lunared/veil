const Recaptcha = require('recaptcha-v2').Recaptcha;

/**
 * Exchange a request with captcha for a JWT
 * JWT is used to connect to the websockets and perform
 * match and chatting
 */
class CaptchaService {
    constructor (publicKey, secretKey) {
        this.secretKey = secretKey;
        this.publicKey = publicKey;
    }

    validate(remoteip, response) {
        console.log(response);
        const recaptcha = new Recaptcha(this.publicKey, this.secretKey, {
            remoteip,
            response,
            secret: this.secretKey,
        });
        return new Promise((resolve, reject) => {
            recaptcha.verify(
                (success, err_code) => {
                    if (success) {
                        console.log(success);
                        resolve('success');
                        return;
                    }
                    console.log(err_code);
                    reject(err_code);
                }
            );
        });
    }
}

module.exports = CaptchaService;

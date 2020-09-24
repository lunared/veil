const Router = require('express-promise-router');
const {
    OK,
    BAD_REQUEST,
} = require('http-status');

module.exports = ({
    captchaService,
    tokenProvider,
}, express) => {

    const router = new Router();

    router.post(
        '/auth/token',
        async (req, res) => {
            const {
                connection: {
                    remoteAddress,
                },
                body: {
                    'g-recaptcha-response': captcha,
                },
            } = req;

            // validate captcha
            try {
                await captchaService.validate(remoteAddress, captcha);
                const token = tokenProvider.generate();
                res.status(OK).json(
                    {
                        token,
                    },
                );
            } catch (err) {
                console.log(err.message, err.stack);
                res.status(BAD_REQUEST).json(
                    {
                        message: 'invalid captcha token',
                    }
                )
            }
        },
    );

    router.post(
        `/auth/refresh`,
        async (req, res) => {
            const {
                body: {
                    token,
                },
            } = req;

            // validate token
            const newToken = tokenProvider.refresh(token);
            // return new token if okay
            res.status(OK).json(
                {
                    token: newToken,
                }
            );
        },
    );

    express.use(router);
};

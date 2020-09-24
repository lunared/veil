const IORedis = require('ioredis');
const CaptchaService = require('./auth/captcha');
const TokenProvider = require('./auth/jwt');
const MatchService = require('./matchmaking/service');

module.exports = () => {
    const config = process.env;

    const redisFactory = {
        create() {
            return new IORedis(config.REDIS_URL);
        },
    };
    const redis = redisFactory.create();
    
    const captchaService = new CaptchaService(config.CAPTCHA_PUBLIC, config.CAPTCHA_SECRET);
    const tokenProvider = new TokenProvider(config.JWT_PUBLIC_KEY, config.JWT_SIGNER_KEY);
    const matchService = new MatchService(redis, config.REDIS_URL);

    return {
        redis,
        captchaService,
        tokenProvider,
        matchService,
        redisFactory,
    };
}

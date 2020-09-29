(async () => {
    const express = require('express');
    const touch = require('touch');
    const app = express();
    const ws = require('express-ws')(app);
    
    app.use(require('cookie-parser')());
    app.use(require('body-parser').json());
    
    const dependencies = await require('./dependencies')();

    require('./http')(dependencies, app);
    require('./socket')(dependencies, app);
    
    app.listen('/tmp/nginx.socket', () => {
        console.log(`http is ready`);
        // heroku nginx buildpack expects this file to exist after app server is ready
        touch.sync('/tmp/app-initialized');
    });
})();

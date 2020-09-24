(async () => {
    const express = require('express');
    const app = express();
    const ws = require('express-ws')(app);
    
    app.use(require('cookie-parser')());
    app.use(require('body-parser').json());
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
    const dependencies = await require('./server/dependencies')();

    require('./server/http')(dependencies, app);
    require('./server/socket')(dependencies, app);
    app.use('/', express.static('./dist'));
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`http started on port ${port}`);
    });
})();

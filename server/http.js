module.exports = (dependencies, express) => {
    require('./auth/routes')(dependencies, express);
}

const router = require('express').Router();
const root = require('./root');

router.use("/", root)

router.use(function (err, req, res, next) {
    return next(err);
});


module.exports = router;
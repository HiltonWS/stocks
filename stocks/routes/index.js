const router = require('express').Router();
const root = require('./root');
const dyXyears = require('./dyXyears');

router.use("/", root)
router.use("/", dyXyears)

router.use(function (err, req, res, next) {
    return next(err);
});


module.exports = router;
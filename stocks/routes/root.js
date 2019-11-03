const router = require('express').Router();
const StocksController = require('../controllers/stocks.controller');
const controller = new StocksController();

router.param("stock", async (req, res, next, slug) => {
    try {
        req.stock = await controller.stocks(slug);
        return next();
    } catch (e) {
        next(e);
    }
})

router.get("/:stock", (req, res, next) => {
    return res.json(req.stock);
})

module.exports = router;
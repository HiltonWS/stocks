const router = require('express').Router();
const StocksController = require('../controllers/stocks.controller');
const controller = new StocksController();

router.get("/dy1year/:stock", async (req, res, next) => {
    try{
        return res.json(await controller.dyLast1year(req.params.stock))
    }catch(e){
        next(e);
    }
});

router.get("/dy5years/:stock", async (req, res, next) => {
    try{
        return res.json(await controller.dyLast5years(req.params.stock))
    }catch(e){
        next(e);
    }
});

router.get("/dyXyears/:years/:stock", async (req, res, next) => {
    try{
        return res.json(await controller.dyLastXyears(req.params.stock, years))
    }catch(e){
        next(e);
    }
});

module.exports = router;
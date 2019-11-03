const rp = require('request-promise');
const cache = require('memory-cache');
const moment = require('moment-timezone');

module.exports = class StocksController {
    get cacheKey() {
        return "stock";
    }

    get cacheTime() {
        return 1000 * 60 ^ 2 * 24;
    }

    async stocks(symbol) {
        const proventos = 'https://www.bussoladoinvestidor.com.br/nb/api/v1/stocks/' + symbol + '/proventos';
        const stockPrice = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol + '.SA&apikey=YXPZ315O42XQTBFC&outputsize=full'

        let result = [];
        let stockPriceList;
        let cached = cache.get(this.cacheKey + symbol);
        if (cached) {
            return cached;
        }
        try{
            return await rp({ uri: stockPrice }).then(async (body1) => {
                stockPriceList = JSON.parse(body1);
                return await rp({ uri: proventos }).then(async (body) => {
                    body = JSON.parse(body)
                    body.forEach(element => {
                        let payDate = element.payDate;
                        if (payDate) {
                            let payDateStockFormat = moment(element.payDate * 1000).subtract('1', "days").format("YYYY-MM-DD");
                            if (stockPriceList["Time Series (Daily)"] && element.type ==='DIVIDENDO' || element.type ==='JUROS') {
                                let stockPricepayDate = stockPriceList["Time Series (Daily)"][payDateStockFormat];
                                if (stockPricepayDate) {
                                    let obj = {};
                                    element.payDate = moment(payDate * 1000).format("YYYY-MM-DD");
                                    obj.payDate = element.payDate;
                                    obj.nominal = element.nominal;
                                    obj.price = stockPricepayDate["4. close"];
                                    obj.dy = obj.nominal / obj.price
                                    result.push(obj);
                                }
                            }
    
                        }
                    });
                    cache.put(this.cacheKey + symbol, result, this.cacheTime);
                    return result;
                });
            });
        }catch(e){
            this.stocks(symbol);
        }
    }

    async dyLastXyears(symbol, years) {
        let data = await this.stocks(symbol);
        let result = {};

        result.dyAvg = cache.get(this.cacheKey + symbol + "dyAvg" + years) || 0;
        result.dyMin = cache.get(this.cacheKey + symbol + "dyMin" + years) || 0;
        result.dyMax = cache.get(this.cacheKey + symbol + "dyMax" + years) || 0;

        if (result.dyAvg !== 0) {
            return result.dyAvg;
        }

        let year = moment();
        let findDy = []

        for (let index = 1; index <= years; index++) {
            year = year.subtract(index, "years");
            let currentDy = 0;
            if(!data){
                this.dyLast5years(symbol, years);
            }
            data.forEach((element) => {
                if (year.isSameOrBefore(element.payDate)) {
                    currentDy += element.dy;
                }
            });
            findDy.push(currentDy / years);
        }

        let totalDy = 0;
        findDy.forEach(element => {
            totalDy += element;

        });
        result.dyAvg = totalDy / findDy.length;
        result.dyMax = Math.max(findDy);
        result.dyMin = Math.min(findDy);

        cache.put(this.cacheKey + symbol + "dyAvg" + years, result.dyAvg, this.cacheTime);
        cache.put(this.cacheKey + symbol + "dyMax" + years, result.dyMax, this.cacheTime);
        cache.put(this.cacheKey + symbol + "dyMin" + years, result.dyMin, this.cacheTime);
        return result;
    }

    async dyLast5years(symbol) {
        return await this.dyLastXyears(symbol, 5);
    }

    async dyLast1year(symbol) {
        return this.dyLastXyears(symbol, 1);
    }
}
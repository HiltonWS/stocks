const rp = require('request-promise');
const moment = require('moment-timezone');
const cache = require('memory-cache')
const express = require('express');

const app = express();
const port = 3000;

let main = async (symbol) => {
  const proventos = 'https://www.bussoladoinvestidor.com.br/nb/api/v1/stocks/'+symbol+'/proventos';
  const stockPrice = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+symbol+'.SA&apikey=YXPZ315O42XQTBFC&outputsize=full'
  const cacheKey = "stock"+symbol;
  let result = [];
  let stockPriceList;
  let cached = cache.get(cacheKey);
  if(cached){
    return cached;
  }
  return await rp({uri: stockPrice}).then(async(body1) => {
    console.log(body1)
    stockPriceList = JSON.parse(body1);
    return await rp({uri: proventos}).then(async(body) => {
      body = JSON.parse(body)
      body.forEach(element => {
        let payDate = element.payDate;
        if(payDate){
          let payDateStockFormat = moment(payDate * 1000).format("YYYY-MM-DD");
          let stockPricepayDate = stockPriceList["Time Series (Daily)"][payDateStockFormat];
          if(stockPricepayDate){
            let obj = {};
            element.payDate = moment(payDate * 1000).format("DD/MM/YYYY");
            obj.payDate = element.payDate;
            obj.nominal = element.nominal;
            obj.price = stockPriceList["Time Series (Daily)"][payDateStockFormat]["4. close"];
            obj.dy = obj.nominal/obj.price
            obj.dy = obj.dy.toString().replace('.',',');
            obj.price = obj.price.replace('.',',');
            obj.nominal = obj.nominal.toString().replace('.',',');
            result.push(obj);
          }          
        }
      });
      cache.put(cacheKey, result, 1000*60^2*24);
      return result;
    });
  });
  
}

app.get('/:stock', async (req, res) =>{
  let resultado = await main(req.params.stock);
  return res.send( resultado);
})

app.listen(port, () =>
  console.log(`Stocks iniciado em ${port}!`),
);




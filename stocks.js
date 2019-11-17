const express = require('express');
const routes = require('./stocks/routes');
const tabletojson = require('tabletojson');
const StocksController = require('./stocks/controllers/stocks.controller');
const controller = new StocksController();

const app = express();
const port = process.env.PORT || 5000;

console.log("Populando Aguarde...");
let tickers = [];

let promise = new Promise((resolve, reject) => {
  tabletojson.convertUrl(
    'https://www.infomoney.com.br/cotacoes/empresas-b3/',
    function (tablesAsJson) {
      tablesAsJson.forEach((element) => {
        element.forEach((element1) => {
          let ticker = element1["2"];
          if (ticker && !ticker.endsWith('F')) {
            //Carrega cache
            tickers.push(ticker);
          }

        });

      });
      resolve(tickers);
    }
  );
});

let init = async () => {
  await promise;
  tickers.forEach(async (element) => {
    try{
      await controller.stocks(element);
      console.log("Carregando", element)
      
    }catch (e){
      console.error(e);
    }
   
  });
  app.use(routes)
  app.listen(port, () =>
    console.log(`Stocks iniciado em ${port}!`),
  );
};
try {
  init();
} catch (e) {
  console.error();

}





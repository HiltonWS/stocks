const express = require('express');
const routes = require('./stocks/routes');
const tabletojson = require('tabletojson').Tabletojson;
const StocksController = require('./stocks/controllers/stocks.controller');
const controller = new StocksController();
const SSHConnection = require('node-ssh-forward').SSHConnection
const app = express();
const port = process.env.PORT || 5000;


let init = async () => {
  
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





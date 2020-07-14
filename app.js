const express = require('express');
const routes = require('./stocks/routes');
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





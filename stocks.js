const express = require('express');
const routes = require('./stocks/routes');

const app = express();
const port = process.env.PORT || 5000;


app.use(routes)

app.listen(port, () =>
  console.log(`Stocks iniciado em ${port}!`),
);




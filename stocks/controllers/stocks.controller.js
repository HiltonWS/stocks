const rp = require('request-promise');
const cache = require('memory-cache');
const tabletojson = require('tabletojson');

module.exports = class StocksController {


    get cacheKey() {
        return "stock";
    }

    get cacheTime() {
        return 1000 * 60 ^ 2 * 24;
    }

    async stocks(symbol) {
        let symbolArray = [];
        if (symbol.includes(",")) {
            symbolArray = symbol.split(",");
        } else {
            symbolArray.push(symbol)
        }
        let resultArray = [];
        for (let index = 0; index < symbolArray.length; index++) {
            const element = symbolArray[index];
            let cached = cache.get(this.cacheKey + element);
            const raioX = "https://www.guiainvest.com.br/raiox/" + element + ".aspx";

            if (cached) {
                resultArray.push(cached);
                continue;
            }
            let raioXData = {};
            raioXData.stock = element;
            let promise = new Promise((resolve, reject) => {
                tabletojson.convertUrl(raioX, (tables) => {
                    if (tables && tables[3]) {
                        tables[3].forEach(element => {
                            if (element['0'] === 'Lucro por Ação (LPA) $') {
                                raioXData.lpaAvg = (parseFloat(element['1'].replace(',', '.')) + parseFloat(element['2'].replace(',', '.')) + parseFloat(element['3'].replace(',', '.'))) / 3
                                raioXData.lpaAvg = raioXData.lpaAvg.toString().replace('.', ',');
                            } else if (element['0'] === 'Valor Patr Ação (VPA) $') {
                                raioXData.vpaAvg = (parseFloat(element['1'].replace(',', '.')) + parseFloat(element['2'].replace(',', '.')) + parseFloat(element['3'].replace(',', '.'))) / 3
                                raioXData.vpaAvg = raioXData.vpaAvg.toString().replace('.', ',');
                            } else if (element['0'] === 'DY (cot fim) %') {
                                raioXData.dyAvg = ((parseFloat(element['1'].replace(',', '.').replace('%', '') || 0)
                                    + parseFloat(element['2'].replace(',', '.').replace('%', '') || 0)
                                    + parseFloat(element['3'].replace(',', '.').replace('%', '') || 0)
                                    + parseFloat(element['4'].replace(',', '.').replace('%', '')) || 0) / 4) / 100
                                raioXData.dyAvg = raioXData.dyAvg.toString().replace('.', ',');
                            }

                        });
                        cache.put(this.cacheKey + element, raioXData, this.cacheTime);
                        resolve(raioXData);
                    } else {
                        raioXData.dyAvg = 0;
                        raioXData.lpaAvg = 0;
                        raioXData.vpaAvg = 0;
                        raioXData.vpaAvg = 0;
                        resolve(raioXData);
                    }
                });

            });
            let result, error = await promise;
            resultArray.push(result || error);
        };

        return resultArray;

    }
}
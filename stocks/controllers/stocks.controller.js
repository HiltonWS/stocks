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
        let cached = cache.get(this.cacheKey + symbol);

        const raioX = "https://www.guiainvest.com.br/raiox/" + symbol + ".aspx";

        if (cached) {
            return cached;
        }
        let raioXData = {};
        let promise = new Promise((resolve, reject) => {
            tabletojson.convertUrl(raioX, (tables) =>{
                if(tables && tables[3]){
                    tables[3].forEach(element => {
                        if(element['0'] === 'Lucro por Ação (LPA) $'){
                            raioXData.lpaAvg = (parseFloat(element['1'].replace(',', '.')) + parseFloat(element['2'].replace(',', '.')) + parseFloat(element['3'].replace(',', '.'))) / 3
                            raioXData.lpaAvg = raioXData.lpaAvg.replace('.', ',');
                        }else if(element['0'] === 'Valor Patr Ação (VPA) $'){
                            raioXData.vpaAvg = (parseFloat(element['1'].replace(',', '.')) + parseFloat(element['2'].replace(',', '.')) + parseFloat(element['3'].replace(',', '.'))) / 3
                            raioXData.vpaAvg = raioXData.vpaAvg.replace('.', ',');
                        }
                    });
                    cache.put(this.cacheKey + symbol, raioXData, this.cacheTime);
                    resolve(raioXData);
                }
            });
        });

        return await promise;
        
    }
}
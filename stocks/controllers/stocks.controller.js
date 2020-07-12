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
            // const penseRico = "https://plataforma.penserico.com/dashboard/cp.pr?e=" + element;
            const fundamentus = "https://www.fundamentus.com.br/detalhes.php?papel=" + element;


            if (cached) {
                resultArray.push(cached);
                continue;
            }
            let raioXData = {};
            let options = {};
            options.request = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.3'
                }
            };

            raioXData.stock = element;
            let cont = 0;
            let promise = new Promise((resolve, reject) => {
                tabletojson.convertUrl(fundamentus, options, (tables) => {

                    if(tables){
                        if(tables[2]){
                            if(tables[2][9]){
                                raioXData.dy = tables[2][8]['3'].toString();
                            }

                            if(tables[2][1]){
                                raioXData.lpa = tables[2][1]['5'].toString()
                            }

                            if(tables[2][2]){
                                raioXData.vpa = tables[2][2]['5'].toString()
                            }
                           
                        }
                        if(tables[1] && tables[1][0] && tables[1][0]['1']){
                            raioXData.valorMercado = (tables[1][0]['1']).toString();
                        }
                        if(tables[3]){
                            if(tables[3][1]){
                                raioXData.ativos = tables[3][1]['1'].toString()
                            }
                            
                            if(tables[3][2]){
                                raioXData.disponibilidades = tables[3][2]['1'].toString()
                            }
                        }
                    }
                    resolve(raioXData);

                });
            });
            let result = await promise;
            resultArray.push(result);
        };

        return resultArray;

    }
}
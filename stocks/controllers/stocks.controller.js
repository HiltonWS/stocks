const cache = require('memory-cache');
const tabletojson = require('tabletojson').Tabletojson;
const UserAgent = require('user-agents');
const userAgent = new UserAgent();

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
            const fundamentus = "https://www.fundamentus.com.br/detalhes.php?papel=" + element;
            const raioX = "https://www.guiainvest.com.br/raiox/" + element + ".aspx";
            const penseRico = "https://plataforma.penserico.com/dashboard/cp.pr?e=" + element;

            if (cached) {
                resultArray.push(cached);
                continue;
            }
            let raioXData = {};
            let optionsH = {};
            optionsH.request = {
                headers: { "User-Agent": userAgent.toString() }
            };

            raioXData.stock = element;
            let promise = new Promise((resolve, reject) => {
                tabletojson.convertUrl(fundamentus, optionsH, (tables) => {
                    if (tables) {
                        if (tables[2]) {
                            if (tables[2][8]) {
                                raioXData.dy = tables[2][8]['3'].toString();
                            }

                            if (tables[2][1]) {
                                raioXData.lpa = tables[2][1]['5'].toString()
                            }

                            if (tables[2][2]) {
                                raioXData.vpa = tables[2][2]['5'].toString()
                            }

                        }
                        if (tables[1] && tables[1][0] && tables[1][0]['1']) {
                            raioXData.valorMercado = (tables[1][0]['1']).toString();
                        }
                        if (tables[3]) {
                            if (tables[3][1]) {
                                raioXData.ativos = tables[3][1]['1'].toString()
                            }

                            if (tables[3][2]) {
                                raioXData.disponibilidades = tables[3][2]['1'].toString()
                            }
                        }
                        if (tables[2]) {
                            if (tables[2][5]) {
                                raioXData.margemLiquida = tables[2][5]['5'].toString();
                            }
                        }
                    }
                    if (raioXData.lpa === '-' || raioXData.lpa === '0,00' ||
                        raioXData.vpa === '-' || raioXData.vpa === '0,00' ||
                        raioXData.margemLiquida === '-' || raioXData.margemLiquida === '0,0%' || raioXData.ativos === '0' || raioXData.ativos === '0' || raioXData.disponibilidades === '0') {
                        tabletojson.convertUrl(raioX, optionsH, (tables) => {
                            if (tables && tables[3]) {
                                let cont = 0;
                                tables[3].forEach(element => {
                                    if(tables[3][9]){
                                        raioXData.lpa = tables[3][9]['3'];
                                    }

                                    if(tables[3][10]){
                                        raioXData.vpa = tables[3][10]['3'];
                                    }

                                    if(tables[3][13]){
                                        raioXData.margemLiquida = tables[3][13]['3'];
                                    }

                                    if(tables[3][17]){
                                        raioXData.ativos = parseFloat(tables[3][17]['3'].replace('B', '').replace(',', '.')) * Math.pow(10, 9).toString().replace(".", ",");
                                    }
                                });
                            }
                            if (raioXData.disponibilidades === '0') {
                                tabletojson.convertUrl(penseRico, optionsH, (tables) => {
                                    if (tables && tables[3]) {
                                        raioXData.disponibilidades = parseFloat(
                                            tables[3][6]['Caixa LivreRepresenta reservas financeiras disponíveis pela empresa para ser utilizado imediatamente.'].split('/n')[0]
                                        ) * Math.pow(10, 6).toString().replace('.', ',')
                                    }
                                    resolve(raioXData);
                                });

                            } else {
                                resolve(raioXData);
                            }
                        });
                    } else {
                        resolve(raioXData);
                    }



                });
            });
            let result = await promise;
            resultArray.push(result);
        };

        return resultArray;

    }
}
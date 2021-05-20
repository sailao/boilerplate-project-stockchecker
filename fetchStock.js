const request = require("request")

module.exports = (stock) => {
    return new Promise(function (resolve, reject) {
        request(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`, function (err, res, body) {
            if (!err && res.statusCode == 200 && body) {
                body = JSON.parse(body)
                resolve({symbol: body.symbol, latestPrice: body.latestPrice});
            } else {
                reject({...err, body: JSON.parse(body)});
            }
        });
    });
}
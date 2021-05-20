'use strict';

const fetchStock = require("../fetchStock")
const Stock = require("../StockModel")
module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res){
      let {stock, like} = req.query
      like == "true" ? (like = 1) : (like = 0)

      let updateIp = {}
      if(like){
        updateIp = {$addToSet:{likes: req.ip}}
      }

      // stock is array
      if(Array.isArray(stock)){
        let [stockOne, stockTwo] = stock;
        let {symbol:symbolOne, latestPrice:latestPriceOne} = await fetchStock(stockOne);
        let {symbol:symbolTwo, latestPrice:latestPriceTwo} = await fetchStock(stockTwo);
        
        if(!symbolOne || !symbolTwo){
          res.json({stockData: {likes: like}})
          return;
        }

        let dbStockOne = await Stock.findOneAndUpdate({symbol: symbolOne}, updateIp, {new: true, upsert: true})
        let dbStockTwo = await Stock.findOneAndUpdate({symbol: symbolTwo}, updateIp, {new: true, upsert: true})
        
        let rel_like_one = parseInt(dbStockOne.likes.length)
        let rel_like_two = parseInt(dbStockTwo.likes.length)

        return res.json({stockData: [{stock: symbolOne, price: latestPriceOne, rel_likes: rel_like_two - rel_like_one}, {stock: symbolTwo, price: latestPriceTwo, rel_likes: rel_like_one - rel_like_two}], likes: like})
      }
      
      let {symbol, latestPrice} = await fetchStock(stock);

      if(!symbol){
        return res.json({stockData: {likes: like}})
      }
      
      let dbStock = await Stock.findOneAndUpdate({symbol}, updateIp, {new: true, upsert: true});

      return res.json({stockData: {stock:symbol, price: latestPrice, likes: dbStock.likes.length}});
    });
};
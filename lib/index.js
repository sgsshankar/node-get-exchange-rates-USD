var Promise, bhttp, expireTime, lastRateCheck, lastRates;

Promise = require("bluebird");

bhttp = require("bhttp");

lastRates = null;

lastRateCheck = 0;

expireTime = 5 * 60 * 1000;

module.exports = function(cacheExpiration) {
  return Promise["try"](function() {
    if (Date.now() > lastRateCheck + expireTime) {
      return Promise["try"](function() {
        return Promise.all([
          bhttp.get("http://api.fixer.io/latest?base=USD", {
            decodeJSON: true
          }), bhttp.get("https://blockchain.info/ticker", {
            decodeJSON: true
          })
        ]);
      }).spread(function(fixerRates, blockchainRates) {
        var USDRates;
        USDRates = fixerRates.body.rates;
        USDRates.BTC = 1 / blockchainRates.body.USD["15m"];
        return USDRates;
      }).then(function(rates) {
        lastRates = rates;
        lastRateCheck = Date.now();
        if (cacheExpiration != null) {
          expireTime = cacheExpiration * 1000;
        }
        return rates;
      })["catch"](function(err) {
        return lastRates;
      });
    } else {
      return lastRates;
    }
  });
};

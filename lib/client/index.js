"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BncClient = exports.DefaultBroadcastDelegate = exports.DefaultSigningDelegate = exports.api = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var crypto = _interopRequireWildcard(require("../crypto"));

var _tx = _interopRequireDefault(require("../tx"));

var _request = _interopRequireDefault(require("../utils/request"));

var _validateHelper = require("../utils/validateHelper");

var _token = _interopRequireDefault(require("../token/"));

var _gov = _interopRequireDefault(require("../gov/"));

var _big = _interopRequireDefault(require("big.js"));

/**
 * @module client
 */
var api = {
  broadcast: "/api/v1/broadcast",
  nodeInfo: "/api/v1/node-info",
  getAccount: "/api/v1/account",
  getMarkets: "/api/v1/markets"
};
exports.api = api;
var NETWORK_PREFIX_MAPPING = {
  "testnet": "tbnb",
  "mainnet": "bnb"
  /**
   * The default signing delegate which uses the local private key.
   * @param  {Transaction} tx      the transaction
   * @param  {Object}      signMsg the canonical sign bytes for the msg
   * @return {Transaction}
   */

};

var DefaultSigningDelegate =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(tx, signMsg) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", tx.sign(this.privateKey, signMsg));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function DefaultSigningDelegate(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * The default broadcast delegate which immediately broadcasts a transaction.
 * @param {Transaction} signedTx the signed transaction
 */


exports.DefaultSigningDelegate = DefaultSigningDelegate;

var DefaultBroadcastDelegate =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(signedTx) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", this.sendTransaction(signedTx));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function DefaultBroadcastDelegate(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * validate the input number.
 * @param {Array} outputs
 */


exports.DefaultBroadcastDelegate = DefaultBroadcastDelegate;

var checkOutputs = function checkOutputs(outputs) {
  outputs.forEach(function (transfer) {
    var coins = transfer.coins || [];
    coins.forEach(function (coin) {
      (0, _validateHelper.checkNumber)(coin.amount);

      if (!coin.denom) {
        throw new Error("invalid denmon");
      }
    });
  });
};
/**
 * sum corresponding input coin
 * @param {Array} inputs
 * @param {Array} coins
 */


var calInputCoins = function calInputCoins(inputs, coins) {
  coins.forEach(function (coin) {
    var existCoin = inputs[0].coins.find(function (c) {
      return c.denom === coin.denom;
    });

    if (existCoin) {
      var existAmount = new _big["default"](existCoin.amount);
      existCoin.amount = Number(existAmount.plus(coin.amount).toString());
    } else {
      inputs[0].coins.push((0, _objectSpread2["default"])({}, coin));
    }
  });
};
/**
 * The Binance Chain client.
 */


var BncClient =
/*#__PURE__*/
function () {
  /**
   * @param {string} server Binance Chain public url
   * @param {Boolean} useAsyncBroadcast use async broadcast mode, faster but less guarantees (default off)
   */
  function BncClient(server) {
    var useAsyncBroadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    (0, _classCallCheck2["default"])(this, BncClient);

    if (!server) {
      throw new Error("Binance chain server should not be null");
    }

    this._httpClient = new _request["default"](server);
    this._signingDelegate = DefaultSigningDelegate;
    this._broadcastDelegate = DefaultBroadcastDelegate;
    this._useAsyncBroadcast = useAsyncBroadcast;
    this.tokens = new _token["default"](this);
    this.gov = new _gov["default"](this);
  }
  /**
   * Initialize the client with the chain's ID. Asynchronous.
   * @return {Promise}
   */


  (0, _createClass2["default"])(BncClient, [{
    key: "initChain",
    value: function () {
      var _initChain = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var data;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.chainId) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 3;
                return this._httpClient.request("get", api.nodeInfo);

              case 3:
                data = _context3.sent;
                this.chainId = data.result.node_info && data.result.node_info.network;

              case 5:
                return _context3.abrupt("return", this);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function initChain() {
        return _initChain.apply(this, arguments);
      }

      return initChain;
    }()
    /**
     * Sets the client network (testnet or mainnet).
     * @param {String} network Indicate testnet or mainnet
     */

  }, {
    key: "chooseNetwork",
    value: function chooseNetwork(network) {
      this.addressPrefix = NETWORK_PREFIX_MAPPING[network] || "tbnb";
      this.network = NETWORK_PREFIX_MAPPING[network] ? network : "testnet";
    }
    /**
     * Sets the client's private key for calls made by this client. Asynchronous.
     * @return {Promise}
     */

  }, {
    key: "setPrivateKey",
    value: function () {
      var _setPrivateKey = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(privateKey) {
        var address, promise, data;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(privateKey !== this.privateKey)) {
                  _context4.next = 13;
                  break;
                }

                address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);

                if (address) {
                  _context4.next = 4;
                  break;
                }

                throw new Error("address is falsy: ${address}. invalid private key?");

              case 4:
                if (!(address === this.address)) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt("return", this);

              case 6:
                // safety
                this.privateKey = privateKey;
                this.address = address; // _setPkPromise used in _sendTransaction for non-await calls

                promise = this._setPkPromise = this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));
                _context4.next = 11;
                return promise;

              case 11:
                data = _context4.sent;
                this.account_number = data.result.account_number;

              case 13:
                return _context4.abrupt("return", this);

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setPrivateKey(_x4) {
        return _setPrivateKey.apply(this, arguments);
      }

      return setPrivateKey;
    }()
    /**
     * Use async broadcast mode. Broadcasts faster with less guarantees (default off)
     * @param {Boolean} useAsyncBroadcast
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useAsyncBroadcast",
    value: function useAsyncBroadcast() {
      var _useAsyncBroadcast = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._useAsyncBroadcast = _useAsyncBroadcast;
      return this;
    }
    /**
     * Sets the signing delegate (for wallet integrations).
     * @param {function} delegate
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "setSigningDelegate",
    value: function setSigningDelegate(delegate) {
      if (typeof delegate !== "function") throw new Error("signing delegate must be a function");
      this._signingDelegate = delegate;
      return this;
    }
    /**
     * Sets the broadcast delegate (for wallet integrations).
     * @param {function} delegate
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "setBroadcastDelegate",
    value: function setBroadcastDelegate(delegate) {
      if (typeof delegate !== "function") throw new Error("broadcast delegate must be a function");
      this._broadcastDelegate = delegate;
      return this;
    }
    /**
     * Applies the default signing delegate.
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useDefaultSigningDelegate",
    value: function useDefaultSigningDelegate() {
      this._signingDelegate = DefaultSigningDelegate;
      return this;
    }
    /**
     * Applies the default broadcast delegate.
     * @return {BncClient} this instance (for chaining)
     */

  }, {
    key: "useDefaultBroadcastDelegate",
    value: function useDefaultBroadcastDelegate() {
      this._broadcastDelegate = DefaultBroadcastDelegate;
      return this;
    }
    /**
     * Transfer tokens from one address to another.
     * @param {String} fromAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {String} asset
     * @param {String} memo optional memo
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "transfer",
    value: function () {
      var _transfer = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5(fromAddress, toAddress, amount, asset) {
        var memo,
            sequence,
            accCode,
            toAccCode,
            coin,
            msg,
            signMsg,
            signedTx,
            _args5 = arguments;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                memo = _args5.length > 4 && _args5[4] !== undefined ? _args5[4] : "";
                sequence = _args5.length > 5 && _args5[5] !== undefined ? _args5[5] : null;
                accCode = crypto.decodeAddress(fromAddress);
                toAccCode = crypto.decodeAddress(toAddress);
                amount = new _big["default"](amount);
                amount = Number(amount.mul(Math.pow(10, 8)).toString());
                (0, _validateHelper.checkNumber)(amount, "amount");
                coin = {
                  denom: asset,
                  amount: amount
                };
                msg = {
                  inputs: [{
                    address: accCode,
                    coins: [coin]
                  }],
                  outputs: [{
                    address: toAccCode,
                    coins: [coin]
                  }],
                  msgType: "MsgSend"
                };
                signMsg = {
                  inputs: [{
                    address: fromAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }],
                  outputs: [{
                    address: toAddress,
                    coins: [{
                      amount: amount,
                      denom: asset
                    }]
                  }]
                };
                _context5.next = 12;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo);

              case 12:
                signedTx = _context5.sent;
                return _context5.abrupt("return", this._broadcastDelegate(signedTx));

              case 14:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function transfer(_x5, _x6, _x7, _x8) {
        return _transfer.apply(this, arguments);
      }

      return transfer;
    }()
    /**
     * Create and sign a multi send tx
     * @param {String} fromAddress
     * @param {Array} outputs
     * @example
     * const outputs = [
     * {
     *   "to": "tbnb1p4kpnj5qz5spsaf0d2555h6ctngse0me5q57qe",
     *   "coins": [{
     *     "denom": "BNB",
     *     "amount": 10
     *   },{
      *     "denom": "BTC",
      *     "amount": 10
      *   }]
     * },
     * {
     *   "to": "tbnb1scjj8chhhp7lngdeflltzex22yaf9ep59ls4gk",
     *   "coins": [{
     *     "denom": "BTC",
     *     "amount": 10
     *   },{
      *     "denom": "BNB",
      *     "amount": 10
      *   }]
     * }]
     * @param {String} memo optional memo
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "multiSend",
    value: function () {
      var _multiSend = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee6(fromAddress, outputs) {
        var memo,
            sequence,
            fromAddrCode,
            inputs,
            transfers,
            msg,
            signInputs,
            signOutputs,
            signMsg,
            signedTx,
            _args6 = arguments;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                memo = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : "";
                sequence = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : null;

                if (fromAddress) {
                  _context6.next = 4;
                  break;
                }

                throw new Error("fromAddress should not be falsy");

              case 4:
                if (Array.isArray(outputs)) {
                  _context6.next = 6;
                  break;
                }

                throw new Error("outputs should be array");

              case 6:
                checkOutputs(outputs); //sort denom by alphbet and init amount

                outputs.forEach(function (item) {
                  item.coins = item.coins.sort(function (a, b) {
                    return a.denom.localeCompare(b.denom);
                  });
                  item.coins.forEach(function (coin) {
                    var amount = new _big["default"](coin.amount);
                    coin.amount = Number(amount.mul(Math.pow(10, 8)).toString());
                  });
                });
                fromAddrCode = crypto.decodeAddress(fromAddress);
                inputs = [{
                  address: fromAddrCode,
                  coins: []
                }];
                transfers = [];
                outputs.forEach(function (item) {
                  var toAddcCode = crypto.decodeAddress(item.to);
                  calInputCoins(inputs, item.coins);
                  transfers.push({
                    address: toAddcCode,
                    coins: item.coins
                  });
                });
                msg = {
                  inputs: inputs,
                  outputs: transfers,
                  msgType: "MsgSend"
                };
                signInputs = [{
                  address: fromAddress,
                  coins: []
                }];
                signOutputs = [];
                outputs.forEach(function (item, index) {
                  signOutputs.push({
                    address: item.to,
                    coins: []
                  });
                  item.coins.forEach(function (c) {
                    signOutputs[index].coins.push(c);
                  });
                  calInputCoins(signInputs, item.coins);
                });
                signMsg = {
                  inputs: signInputs,
                  outputs: signOutputs
                };
                _context6.next = 19;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo);

              case 19:
                signedTx = _context6.sent;
                return _context6.abrupt("return", this._broadcastDelegate(signedTx));

              case 21:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function multiSend(_x9, _x10) {
        return _multiSend.apply(this, arguments);
      }

      return multiSend;
    }()
    /**
     * Cancel an order.
     * @param {String} fromAddress
     * @param {String} symbol the market pair
     * @param {String} refid the order ID of the order to cancel
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "cancelOrder",
    value: function () {
      var _cancelOrder = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7(fromAddress, symbol, refid) {
        var sequence,
            accCode,
            msg,
            signMsg,
            signedTx,
            _args7 = arguments;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                sequence = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : null;
                accCode = crypto.decodeAddress(fromAddress);
                msg = {
                  sender: accCode,
                  symbol: symbol,
                  refid: refid,
                  msgType: "CancelOrderMsg"
                };
                signMsg = {
                  refid: refid,
                  sender: fromAddress,
                  symbol: symbol
                };
                _context7.next = 6;
                return this._prepareTransaction(msg, signMsg, fromAddress, sequence, "");

              case 6:
                signedTx = _context7.sent;
                return _context7.abrupt("return", this._broadcastDelegate(signedTx));

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function cancelOrder(_x11, _x12, _x13) {
        return _cancelOrder.apply(this, arguments);
      }

      return cancelOrder;
    }()
    /**
     * Place an order.
     * @param {String} address
     * @param {String} symbol the market pair
     * @param {Number} side (1-Buy, 2-Sell)
     * @param {Number} price
     * @param {Number} quantity
     * @param {Number} sequence optional sequence
     * @param {Number} timeinforce (1-GTC(Good Till Expire), 3-IOC(Immediate or Cancel))
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "placeOrder",
    value: function () {
      var _placeOrder = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee8() {
        var address,
            symbol,
            side,
            price,
            quantity,
            sequence,
            timeinforce,
            accCode,
            data,
            bigPrice,
            bigQuantity,
            placeOrderMsg,
            signMsg,
            signedTx,
            _args8 = arguments;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                address = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : this.address;
                symbol = _args8.length > 1 ? _args8[1] : undefined;
                side = _args8.length > 2 ? _args8[2] : undefined;
                price = _args8.length > 3 ? _args8[3] : undefined;
                quantity = _args8.length > 4 ? _args8[4] : undefined;
                sequence = _args8.length > 5 && _args8[5] !== undefined ? _args8[5] : null;
                timeinforce = _args8.length > 6 && _args8[6] !== undefined ? _args8[6] : 1;

                if (address) {
                  _context8.next = 9;
                  break;
                }

                throw new Error("address should not be falsy");

              case 9:
                if (symbol) {
                  _context8.next = 11;
                  break;
                }

                throw new Error("symbol should not be falsy");

              case 11:
                if (!(side !== 1 && side !== 2)) {
                  _context8.next = 13;
                  break;
                }

                throw new Error("side can only be 1 or 2");

              case 13:
                if (!(timeinforce !== 1 && timeinforce !== 3)) {
                  _context8.next = 15;
                  break;
                }

                throw new Error("timeinforce can only be 1 or 3");

              case 15:
                accCode = crypto.decodeAddress(address);

                if (!(sequence !== 0 && !sequence)) {
                  _context8.next = 21;
                  break;
                }

                _context8.next = 19;
                return this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));

              case 19:
                data = _context8.sent;
                sequence = data.result && data.result.sequence;

              case 21:
                bigPrice = new _big["default"](price);
                bigQuantity = new _big["default"](quantity);
                placeOrderMsg = {
                  sender: accCode,
                  id: "".concat(accCode.toString("hex"), "-").concat(sequence + 1).toUpperCase(),
                  symbol: symbol,
                  ordertype: 2,
                  side: side,
                  price: parseFloat(bigPrice.mul(Math.pow(10, 8)).toString(), 10),
                  quantity: parseFloat(bigQuantity.mul(Math.pow(10, 8)).toString(), 10),
                  timeinforce: timeinforce,
                  msgType: "NewOrderMsg"
                };
                signMsg = {
                  id: placeOrderMsg.id,
                  ordertype: placeOrderMsg.ordertype,
                  price: placeOrderMsg.price,
                  quantity: placeOrderMsg.quantity,
                  sender: address,
                  side: placeOrderMsg.side,
                  symbol: placeOrderMsg.symbol,
                  timeinforce: timeinforce
                };
                (0, _validateHelper.checkNumber)(placeOrderMsg.price, "price");
                (0, _validateHelper.checkNumber)(placeOrderMsg.quantity, "quantity");
                _context8.next = 29;
                return this._prepareTransaction(placeOrderMsg, signMsg, address, sequence, "");

              case 29:
                signedTx = _context8.sent;
                return _context8.abrupt("return", this._broadcastDelegate(signedTx));

              case 31:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function placeOrder() {
        return _placeOrder.apply(this, arguments);
      }

      return placeOrder;
    }()
    /**
     * @param {String} address
     * @param {Number} proposalId
     * @param {String} baseAsset
     * @param {String} quoteAsset
     * @param {Number} initPrice
     * @param {Number} sequence optional sequence
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "list",
    value: function () {
      var _list = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee9(address, proposalId, baseAsset, quoteAsset, initPrice) {
        var sequence,
            accCode,
            init_price,
            listMsg,
            signMsg,
            signedTx,
            _args9 = arguments;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                sequence = _args9.length > 5 && _args9[5] !== undefined ? _args9[5] : null;
                accCode = crypto.decodeAddress(address);

                if (address) {
                  _context9.next = 4;
                  break;
                }

                throw new Error("address should not be falsy");

              case 4:
                if (!(proposalId <= 0)) {
                  _context9.next = 6;
                  break;
                }

                throw new Error("proposal id should larger than 0");

              case 6:
                if (!(initPrice <= 0)) {
                  _context9.next = 8;
                  break;
                }

                throw new Error("price should larger than 0");

              case 8:
                if (baseAsset) {
                  _context9.next = 10;
                  break;
                }

                throw new Error("baseAsset should not be falsy");

              case 10:
                if (quoteAsset) {
                  _context9.next = 12;
                  break;
                }

                throw new Error("quoteAsset should not be falsy");

              case 12:
                init_price = Number(new _big["default"](initPrice).mul(Math.pow(10, 8)).toString());
                listMsg = {
                  from: accCode,
                  proposal_id: proposalId,
                  base_asset_symbol: baseAsset,
                  quote_asset_symbol: quoteAsset,
                  init_price: init_price,
                  msgType: "ListMsg"
                };
                signMsg = {
                  base_asset_symbol: baseAsset,
                  from: address,
                  init_price: init_price,
                  proposal_id: proposalId,
                  quote_asset_symbol: quoteAsset
                };
                _context9.next = 17;
                return this._prepareTransaction(listMsg, signMsg, address, sequence, "");

              case 17:
                signedTx = _context9.sent;
                return _context9.abrupt("return", this._broadcastDelegate(signedTx));

              case 19:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function list(_x14, _x15, _x16, _x17, _x18) {
        return _list.apply(this, arguments);
      }

      return list;
    }()
    /**
     * Prepare a serialized raw transaction for sending to the blockchain.
     * @param {Object} msg the msg object
     * @param {Object} stdSignMsg the sign doc object used to generate a signature
     * @param {String} address
     * @param {Number} sequence optional sequence
     * @param {String} memo optional memo
     * @return {Transaction} signed transaction
     */

  }, {
    key: "_prepareTransaction",
    value: function () {
      var _prepareTransaction2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee10(msg, stdSignMsg, address) {
        var sequence,
            memo,
            data,
            options,
            tx,
            _args10 = arguments;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                sequence = _args10.length > 3 && _args10[3] !== undefined ? _args10[3] : null;
                memo = _args10.length > 4 && _args10[4] !== undefined ? _args10[4] : "";

                if (!((!this.account_number || !sequence) && address)) {
                  _context10.next = 10;
                  break;
                }

                _context10.next = 5;
                return this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));

              case 5:
                data = _context10.sent;
                sequence = data.result.sequence;
                this.account_number = data.result.account_number; // if user has not used `await` in its call to setPrivateKey (old API), we should wait for the promise here

                _context10.next = 13;
                break;

              case 10:
                if (!this._setPkPromise) {
                  _context10.next = 13;
                  break;
                }

                _context10.next = 13;
                return this._setPkPromise;

              case 13:
                options = {
                  account_number: parseInt(this.account_number),
                  chain_id: this.chainId,
                  memo: memo,
                  msg: msg,
                  sequence: parseInt(sequence),
                  type: msg.msgType
                };
                tx = new _tx["default"](options);
                return _context10.abrupt("return", this._signingDelegate.call(this, tx, stdSignMsg));

              case 16:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function _prepareTransaction(_x19, _x20, _x21) {
        return _prepareTransaction2.apply(this, arguments);
      }

      return _prepareTransaction;
    }()
    /**
     * Broadcast a transaction to the blockchain.
     * @param {signedTx} tx signed Transaction object
     * @param {Boolean} sync use synchronous mode, optional
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "sendTransaction",
    value: function () {
      var _sendTransaction2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee11(signedTx, sync) {
        var signedBz;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                signedBz = signedTx.serialize();
                return _context11.abrupt("return", this.sendRawTransaction(signedBz, sync));

              case 2:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function sendTransaction(_x22, _x23) {
        return _sendTransaction2.apply(this, arguments);
      }

      return sendTransaction;
    }()
    /**
     * Broadcast a raw transaction to the blockchain.
     * @param {String} signedBz signed and serialized raw transaction
     * @param {Boolean} sync use synchronous mode, optional
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "sendRawTransaction",
    value: function () {
      var _sendRawTransaction = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee12(signedBz) {
        var sync,
            opts,
            _args12 = arguments;
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                sync = _args12.length > 1 && _args12[1] !== undefined ? _args12[1] : !this._useAsyncBroadcast;
                opts = {
                  data: signedBz,
                  headers: {
                    "content-type": "text/plain"
                  }
                };
                return _context12.abrupt("return", this._httpClient.request("post", "".concat(api.broadcast, "?sync=").concat(sync), null, opts));

              case 3:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function sendRawTransaction(_x24) {
        return _sendRawTransaction.apply(this, arguments);
      }

      return sendRawTransaction;
    }()
    /**
     * Broadcast a raw transaction to the blockchain.
     * @param {Object} msg the msg object
     * @param {Object} stdSignMsg the sign doc object used to generate a signature
     * @param {String} address
     * @param {Number} sequence optional sequence
     * @param {String} memo optional memo
     * @param {Boolean} sync use synchronous mode, optional
     * @return {Promise} resolves with response (success or fail)
     */

  }, {
    key: "_sendTransaction",
    value: function () {
      var _sendTransaction3 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee13(msg, stdSignMsg, address) {
        var sequence,
            memo,
            sync,
            signedTx,
            _args13 = arguments;
        return _regenerator["default"].wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                sequence = _args13.length > 3 && _args13[3] !== undefined ? _args13[3] : null;
                memo = _args13.length > 4 && _args13[4] !== undefined ? _args13[4] : "";
                sync = _args13.length > 5 && _args13[5] !== undefined ? _args13[5] : !this._useAsyncBroadcast;
                _context13.next = 5;
                return this._prepareTransaction(msg, stdSignMsg, address, sequence, memo);

              case 5:
                signedTx = _context13.sent;
                return _context13.abrupt("return", this.sendTransaction(signedTx, sync));

              case 7:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function _sendTransaction(_x25, _x26, _x27) {
        return _sendTransaction3.apply(this, arguments);
      }

      return _sendTransaction;
    }()
    /**
     * get account
     * @param {String} address
     * @return {Promise} resolves with http response
     */

  }, {
    key: "getAccount",
    value: function () {
      var _getAccount = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee14() {
        var address,
            data,
            _args14 = arguments;
        return _regenerator["default"].wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                address = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : this.address;

                if (address) {
                  _context14.next = 3;
                  break;
                }

                throw new Error("address should not be falsy");

              case 3:
                _context14.prev = 3;
                _context14.next = 6;
                return this._httpClient.request("get", "".concat(api.getAccount, "/").concat(address));

              case 6:
                data = _context14.sent;
                return _context14.abrupt("return", data);

              case 10:
                _context14.prev = 10;
                _context14.t0 = _context14["catch"](3);
                return _context14.abrupt("return", null);

              case 13:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this, [[3, 10]]);
      }));

      function getAccount() {
        return _getAccount.apply(this, arguments);
      }

      return getAccount;
    }()
    /**
     * get balances
     * @param {String} address optional address
     * @return {Promise} resolves with http response
     */

  }, {
    key: "getBalance",
    value: function () {
      var _getBalance = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee15() {
        var address,
            data,
            _args15 = arguments;
        return _regenerator["default"].wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                address = _args15.length > 0 && _args15[0] !== undefined ? _args15[0] : this.address;
                _context15.prev = 1;
                _context15.next = 4;
                return this.getAccount(address);

              case 4:
                data = _context15.sent;
                return _context15.abrupt("return", data.result.balances);

              case 8:
                _context15.prev = 8;
                _context15.t0 = _context15["catch"](1);
                return _context15.abrupt("return", []);

              case 11:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this, [[1, 8]]);
      }));

      function getBalance() {
        return _getBalance.apply(this, arguments);
      }

      return getBalance;
    }()
    /**
     * get markets
     * @param {Number} offset from beggining, default 0
     * @param {Number} limit, max 1000 is default
     * @return {Promise} resolves with http response
     */

  }, {
    key: "getMarkets",
    value: function () {
      var _getMarkets = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee16() {
        var limit,
            offset,
            data,
            _args16 = arguments;
        return _regenerator["default"].wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                limit = _args16.length > 0 && _args16[0] !== undefined ? _args16[0] : 1000;
                offset = _args16.length > 1 && _args16[1] !== undefined ? _args16[1] : 0;
                _context16.prev = 2;
                _context16.next = 5;
                return this._httpClient.request("get", "".concat(api.getMarkets, "?limit=").concat(limit, "&offset=").concat(offset));

              case 5:
                data = _context16.sent;
                return _context16.abrupt("return", data);

              case 9:
                _context16.prev = 9;
                _context16.t0 = _context16["catch"](2);
                console.warn("getMarkets error", _context16.t0);
                return _context16.abrupt("return", []);

              case 13:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[2, 9]]);
      }));

      function getMarkets() {
        return _getMarkets.apply(this, arguments);
      }

      return getMarkets;
    }()
    /**
     * Creates a private key and returns it and its address.
     * @return {object} the private key and address in an object.
     * {
     *  address,
     *  privateKey
     * }
     */

  }, {
    key: "createAccount",
    value: function createAccount() {
      var privateKey = crypto.generatePrivateKey();
      return {
        privateKey: privateKey,
        address: crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix)
      };
    }
    /**
     * Creates an account keystore object, and returns the private key and address.
     * @param {String} password
     *  {
     *  privateKey,
     *  address,
     *  keystore
     * }
     */

  }, {
    key: "createAccountWithKeystore",
    value: function createAccountWithKeystore(password) {
      if (!password) {
        throw new Error("password should not be falsy");
      }

      var privateKey = crypto.generatePrivateKey();
      var address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);
      var keystore = crypto.generateKeyStore(privateKey, password);
      return {
        privateKey: privateKey,
        address: address,
        keystore: keystore
      };
    }
    /**
     * Creates an account from mnemonic seed phrase.
     * @return {object}
     * {
     *  privateKey,
     *  address,
     *  mnemonic
     * }
     */

  }, {
    key: "createAccountWithMneomnic",
    value: function createAccountWithMneomnic() {
      var mnemonic = crypto.generateMnemonic();
      var privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic);
      var address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);
      return {
        privateKey: privateKey,
        address: address,
        mnemonic: mnemonic
      };
    }
    /**
     * Recovers an account from a keystore object.
     * @param {object} keystore object.
     * @param {string} keystore password.
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromKeystore",
    value: function recoverAccountFromKeystore(keystore, password) {
      var privateKey = crypto.getPrivateKeyFromKeyStore(keystore, password);
      var address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);
      return {
        privateKey: privateKey,
        address: address
      };
    }
    /**
     * Recovers an account from a mnemonic seed phrase.
     * @param {string} mneomnic
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromMnemonic",
    value: function recoverAccountFromMnemonic(mnemonic) {
      var privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic);
      var address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);
      return {
        privateKey: privateKey,
        address: address
      };
    } // support an old method name containing a typo

  }, {
    key: "recoverAccountFromMneomnic",
    value: function recoverAccountFromMneomnic(mnemonic) {
      return this.recoverAccountFromMnemonic(mnemonic);
    }
    /**
     * Recovers an account using private key.
     * @param {String} privateKey
     * {
     * privateKey,
     * address
     * }
     */

  }, {
    key: "recoverAccountFromPrivateKey",
    value: function recoverAccountFromPrivateKey(privateKey) {
      var address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix);
      return {
        privateKey: privateKey,
        address: address
      };
    }
    /**
     * Validates an address.
     * @param {String} address
     * @return {Boolean}
     */

  }, {
    key: "checkAddress",
    value: function checkAddress(address) {
      return crypto.checkAddress(address);
    }
    /**
     * Returns the address for the current account if setPrivateKey has been called on this client.
     * @return {String}
     */

  }, {
    key: "getClientKeyAddress",
    value: function getClientKeyAddress() {
      if (!this.privateKey) throw new Error("no private key is set on this client");
      var address = crypto.getAddressFromPrivateKey(this.privateKey, this.addressPrefix);
      this.address = address;
      return address;
    }
  }]);
  return BncClient;
}();

exports.BncClient = BncClient;
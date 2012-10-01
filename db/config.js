var mongo   = require('mongoskin')
var db      = mongo.db('chuzhengcn:123456@ds037977.mongolab.com:37977/heroku_app7939210?auto_reconnect')
exports.db  = db
var mongo   = require('mongoskin')
// var db      = mongo.db('chuzhengcn:123456@ds037977.mongolab.com:37977/heroku_app7939210?auto_reconnect')
// var db      = mongo.db('chuzhengcn:123456@192.168.10.102:27017/easytask?auto_reconnect')
var db      = mongo.db('192.168.1.177:27017/easytask?auto_reconnect')
exports.db  = db
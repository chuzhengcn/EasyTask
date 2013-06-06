var mongoose = require('mongoose');

// mongoose.connect('chuzhengcn:123456@ds037977.mongolab.com:37977/heroku_app7939210');
mongoose.connect('chuzhengcn:123456@192.168.10.102:27017/easytask');

exports.mongoose = mongoose;
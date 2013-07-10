var mongoose = require('mongoose'),
    db       = null;

mongoose.connect('chuzhengcn:123456@ds037977.mongolab.com:37977/heroku_app7939210');
// mongoose.connect('chuzhengcn:123456@192.168.10.102:27017/easytask');
// mongoose.connect('mongodb://192.168.1.177:27017/easytask');

db = mongoose.connection;

db.on('open', function() {
    console.log('mongodb connections success')
});

db.on('error', function() {
    console.log('mongodb connections failure')
});

exports.mongoose = mongoose;
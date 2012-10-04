var user_coll       = require('../db/user')
var log_coll        = require('../db/log')
var logType = {
    createTask : 1
}

exports.identifying = function (req, cb) {
    var clientIp = req.connection.remoteAddress
    user_coll.findByIp(clientIp, function(err, user) {
    	cb(user)
    })
}

exports.ownAuthority = function(req, cb) {
    var clientIp = req.connection.remoteAddress
    user_coll.findByIp(clientIp, function(err, user) {
        if (user) {
            cb(true, user)
        } else {
            cb(false)
        }
    })
}

exports.createLogItem = function (log, cb) {
    log.created_time = new Date()
    log_coll.create(log, function(err, result) {
        if (cb) {
            cb()
        }
    })
}
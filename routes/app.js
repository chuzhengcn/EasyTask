var user_coll       = require('../db/user')
var log_coll        = require('../db/log')

var userModel       = require('../model/user').user,
    logTypeModel    = require('../model/data').logType,
    logModel        = require('../model/log').log;

// use mongoose
exports.getClientUser = function(ip, cb) {
    userModel.findByIp(ip, function(err, user) {
        cb(err, user)
    }) 
}

exports.ownAuthority = function(req, cb) {
    var clientIp = req.ip
    userModel.findByIp(clientIp, function(err, user) {
        if (user) {
            cb(true, user)
        } else {
            cb(false)
        }
    })
}

exports.createLogItem = function (operator_id, task_id, log_type, content, cb) {
    if (typeof content === 'undefined') {
        content = ''
    }

    if (typeof content === 'function') {
        cb      = content
        content = ''
    }

    var newLog = new logModel({
        operator_id     : operator_id,
        task_id         : task_id,
        log_type        : logTypeModel[log_type],
        content         : content,
        created_time    : new Date(),
    })
    
    newLog.save(function(err, logResult) {
        if (cb) {
            cb(err, logResult)
        }
    })
}

exports.err404 = function(req, res) {
    res.status(404).render('404', {title : '404'})
}

// use monogo skin below -------------------------------------

exports.identifying = function (req, cb) {
    var clientIp = req.connection.remoteAddress
    user_coll.findByIp(clientIp, function(err, user) {
    	cb(user)
    })
}
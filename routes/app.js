var user_coll       = require('../db/user')

var userModel       = require('../model/user').user,
    logTypeModel    = require('../model/data').logType,
    logModel        = require('../model/log').log,
    configData      = require('../model/data'),
    authDict        = null;

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

exports.errPage = function(req, res, msg) {
    res.render('error', {title : '出错了', msg : msg})
}

authDict = {

}

function isManager(ip) {
    return configData.manager.some(function(item, index) {
        if (item.ip === ip) {
            return true
        }
    })
}
exports.isManager = isManager

function isAdmin(ip) {
    return configData.admin.some(function(item, index) {
        if (item.ip === ip) {
            return true
        }
    })
}
exports.isAdmin = isAdmin

function isLogin(req) {
    return (req.session && req.session.login) || false
}

exports.isLogin = isLogin

// use monogo skin below -------------------------------------

exports.identifying = function (req, cb) {
    var clientIp = req.connection.remoteAddress
    user_coll.findByIp(clientIp, function(err, user) {
    	cb(user)
    })
}

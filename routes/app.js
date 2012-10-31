var user_coll       = require('../db/user')
var log_coll        = require('../db/log')

exports.identifying = function (req, cb) {
    var clientIp = req.connection.remoteAddress
    user_coll.findByIp(clientIp, function(err, user) {
    	cb(user)
    })
}

exports.ownAuthority = function(req, cb) {
    var clientIp = req.ip
    user_coll.findByIp(clientIp, function(err, user) {
        if (user) {
            cb(true, user)
        } else {
            cb(false)
        }
    })
}

exports.createLogItem = function (log, operator, task, cb) {
    log.operator_id     = operator._id
    log.task_id         = task._id
    log.task_name       = task.name
    log.task_custom_id  = task.custom_id
    log.created_time    = new Date()
    
    log_coll.create(log, function(err, result) {
        if (cb) {
            cb()
        }
    })
}

exports.err404 = function(req, res) {
    res.status(404).render('404', {title : '404'})
}
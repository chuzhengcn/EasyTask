var user_coll       = require('../db/user')
var log_coll        = require('../db/log')
var logType = {
    createTask      : 1,
    deleteTask      : 2,
    archiveTask     : 3, 
    activeTask      : 4,
    editTaskName    : 5, 
    editTaskUsers   : 6,
    addMilestone    : 7,
    deleteMilestone : 8,
    editMilestone   : 9,
    setTaskBranch   : 10,
    setTaskStatus   : 11,
    uploadTaskFile  : 12,
    addTodo         : 13, 
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

exports.createLogItem = function (log, operator, task, cb) {
    log.operator_id     = operator._id
    log.task_id         = task._id
    log.created_time    = new Date()
    
    log_coll.create(log, function(err, result) {
        if (cb) {
            cb()
        }
    })
}
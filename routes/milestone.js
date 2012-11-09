var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var milestone_coll  = require('../db/milestone')
var time            = require('../helper/time')
var log_coll        = require('../db/log')

exports.show = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        milestone_coll.findById(req.params.id, function(err, milestone) {
            if (!milestone) {
                routeApp.err404(req, res)
                return
            }
            task_coll.findById(milestone.task_id, function(err, task) {
               res.render('milestone/info', 
                   { 
                       title       : task.name + '-时间点-' + milestone.name, 
                       me          : loginUser, 
                       task        : task,
                       milestone   : time.format_specify_field(milestone, {event_time : 'date:-'}) 
                   } 
               ) 
            })
        }) 
    })
}

exports.create = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!getMilestoneName(req) || !req.body.task_milestone_time || !req.params.task_id) {
            res.send({ ok : 0, msg : '名称或时间不能为空' })
            return
        }

        task_coll.findById(req.params.task_id, function(err, task) {
            milestone_coll.create({
                    name            : getMilestoneName(req),
                    task_id         : req.params.task_id,
                    event_time      : time.parse_date(req.body.task_milestone_time),
                    created_time    : new Date()
                },  
                function(err, result) {
                    if (err) {
                        res.send({ ok : 0, msg : '数据库错误' })
                        return
                    }
                    routeApp.createLogItem({ log_type : log_coll.logType.addMilestone + '：' + getMilestoneName(req)}, operator, task)
                    res.send({ ok : 1 })
                }
            )
        })  
    })
}

exports.delete = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }
        milestone_coll.findById(req.params.id, function(err, result) {
            milestone_coll.removeById(req.params.id, function(err) {
                task_coll.findById(result.task_id, function(err, task) {
                    routeApp.createLogItem({ log_type : log_coll.logType.deleteMilestone + '：' + result.name}, operator, task)
                })

                res.send({ ok : 1 })
            }) 
        })
    })
}

exports.update = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        var updateDoc = {
            name            : getMilestoneName(req),
            event_time      : time.parse_date(req.body.task_milestone_time),
            modify_time     : new Date()
        }

        milestone_coll.findAndModifyById(req.params.id, updateDoc, function(err, result) {
            //write log
            task_coll.findById(req.params.task_id, function(err, task) {
                routeApp.createLogItem({ log_type : log_coll.logType.editMilestone + '：' + result.name }, operator, task)
            })
            res.send({ ok : 1 })
        })
    })
}

function getMilestoneName(req) {
    var name  = ''
    var names = req.body.task_milestone_name
    if (names && Array.isArray(names)) {
        if (names[1]) {
            name = names[1]
        } else {
            name = names[0]
        }
    }
    return name
}
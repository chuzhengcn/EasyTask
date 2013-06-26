var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var milestone_coll  = require('../db/milestone')
var log_coll        = require('../db/log')

var routeApp        = require('./app'),
    time            = require('../helper/time'),
    taskModel       = require('../model/task').task,
    milestoneModel  = require('../model/milestone').milestone;

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
    var taskId          = req.params.taskId,
        eventTime       = null,
        newMilestone    = null;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ ok : 0, msg : '时间点名称不能为空'})
            return
        }

        if (!req.body.eventTime) {
            res.send({ ok : 0, msg : '时间不能为空'})
            return
        }

        eventTime = time.parse_date(req.body.eventTime)

        if (!(eventTime instanceof Date)) {
            res.send({ ok : 0, msg : '时间不合法'})
            return
        }

        taskModel.findById(taskId, function(err, taskResult) {
            if (!taskResult) {
                res.send({ ok : 0, msg : '任务不存在'})
                return
            }

            newMilestone = new milestoneModel({
                task_id         : taskId,
                name            : getMilestoneName(req.body.name),
                event_time      : eventTime,
                updated_time    : new Date(),
                created_time    : new Date(),
                content         : req.body.content || '',
            })

            newMilestone.save(function(err, milestoneResult) {
                res.send({ok : 1})

                routeApp.createLogItem(String(operator._id), taskId, '6', req.body.eventTime + ':' + milestoneResult.name)
            })
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

function getMilestoneName(names) {
    var name  = '';

    if (names && Array.isArray(names)) {
        if (names[1]) {
            name = names[1]
        } else {
            name = names[0]
        }
    }

    return name
}
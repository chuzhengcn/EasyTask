var routeApp        = require('./app'),
    time            = require('../helper/time'),
    taskModel       = require('../model/task').task,
    milestoneModel  = require('../model/milestone').milestone;

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
                routeApp.createLogItem(String(operator._id), taskId, '6', req.body.eventTime + ' : ' + milestoneResult.name)
            })
        })  
    })
}

exports.delete = function(req, res) {
    var id = req.params.id

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }
        milestoneModel.findById(id, function(err, milestoneResult) {
            if (err || !milestoneResult) {
                res.send({ok : 0, msg : '删除失败'})
                return
            }
            milestoneModel.findByIdAndRemove(id, function(err) {
                if (err) {
                    res.send({ok : 0, msg : '删除失败'})
                    return
                }
                res.send({ok : 1})
                routeApp.createLogItem(String(operator._id), milestoneResult.task_id, '8', milestoneResult.name)
            })
        })
    })
}

exports.update = function(req, res) {
    var id              = req.params.id,
        eventTime       = null,
        updateMilestone = null;

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

        updateMilestone = {
            name            : getMilestoneName(req.body.name),
            event_time      : eventTime,
            updated_time    : new Date(),
            content         : req.body.content || '',
        }

        milestoneModel.findByIdAndUpdate(id, updateMilestone, function(err, milestoneResult) {
            if (!milestoneResult) {
                res.send({ ok : 0, msg : '时间点不存在'})
                return
            }

            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), milestoneResult.task_id, '7', req.body.eventTime + " : " + milestoneResult.name)
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

// exports.show = function(req, res) {
//     routeApp.identifying(req, function(loginUser) {
//         milestone_coll.findById(req.params.id, function(err, milestone) {
//             if (!milestone) {
//                 routeApp.err404(req, res)
//                 return
//             }
//             task_coll.findById(milestone.task_id, function(err, task) {
//                res.render('milestone/info', 
//                    { 
//                        title       : task.name + '-时间点-' + milestone.name, 
//                        me          : loginUser, 
//                        task        : task,
//                        milestone   : time.format_specify_field(milestone, {event_time : 'date:-'}) 
//                    } 
//                ) 
//             })
//         }) 
//     })
// }
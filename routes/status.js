var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var status_coll     = require('../db/status')
var time            = require('../helper/time')
var view            = require('../helper/view')
var taskFile        = require('./upload') 
var log_coll        = require('../db/log')  

var routeApp        = require('./app'),
    taskModel       = require('../model/task').task,
    statusModel     = require('../model/status').status;

exports.listByTask = function(req, res) {
    var isMyTask = false
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.task_id, function(err, task) {
            status_coll.findByTask(req.params.task_id, function(err, statusHistory) {
                if (task.users.indexOf(loginUser._id) > -1) {
                    isMyTask = true
                }

                res.render('status/index', 
                    { 
                        title           : '版本管理 - ' + task.name, 
                        me              : loginUser, 
                        statusHistory   : view.keepLineBreak(time.format_specify_field(statusHistory, { created_time : 'readable_time'}), ['content']),
                        task            : task,
                        isMyTask        : isMyTask,
                    } 
                )
            })
        }) 
    })
}

exports.create = function(req, res) {
    var taskId      = req.params.task_id,
        newStatus   = null;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        newStatus = new statusModel({
            task_id         : taskId,
            name            : req.body.name,
            content         : req.body.content,
            files           : req.body.taskfiles,
            operator_id     : String(operator._id),
            updated_time    : new Date(),
            created_time    : new Date(),
        })

        newStatus.save(function(err, statusResult) {
            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), taskId, '9', req.body.name)

            taskModel.findByIdAndUpdate(taskId, {status : req.body.name}, function(err, taskResult) {})
        })
    })
}

exports.delete = function(req, res) {
    var taskId = req.params.task_id,
        id     = req.params.id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        statusModel.find({task_id : taskId}, {_id : 1, name : 1, files : 1}, {sort : {created_time : -1}}, function(err, statusResults) {
            if (id !== String(statusResults[0]._id)) {
                res.send({ok : 0, msg : '只能删除最新的状态'})
                return
            }

            if (statusResults.length === 1) {
                res.send({ok : 0, msg : '初始状态不能删除'})
                return
            }

            console.log(statusResults[0])

            statusModel.findByIdAndRemove(id, function(err) {
                if (err) {
                    res.send({ok : 0, msg : '数据库错误'})
                    return
                }
                res.send({ok : 1})
                taskModel.findByIdAndUpdate(taskId, {status : statusResults[1].name}, function(){})
                routeApp.createLogItem(String(operator._id), taskId, '11', '回退到' +  statusResults[1].name)
                if (statusResults[0].files.length > 0) {
                    taskFile.deleteTaskFiles(statusResults[0].files, function(){})
                }
            })
        })

        // status_coll.findById(req.params.id, function(err, statusResult) {
        //     var readyToDeleteFiles = statusResult.files
        //     status_coll.removeById(req.params.id, function(err) {
        //         res.send({ ok : 1 })
        //     })

        //     if (readyToDeleteFiles) {
        //         taskFile.deleteTaskFiles(readyToDeleteFiles, function(){})
        //     }

        //     task_coll.findById(req.params.task_id, function(err, task) {
        //         routeApp.createLogItem({ log_type : statusResult.name + log_coll.logType.deleteStatus, }, operator, task)
        //     })
        // })
    })
}
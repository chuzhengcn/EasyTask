var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var status_coll     = require('../db/status')
var time            = require('../helper/time')

exports.listByTask = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.task_id, function(err, task) {
            status_coll.findByTask(req.params.task_id, function(err, statusHistory) {
                res.render('status/index', 
                    { 
                        title           : '版本管理 - ' + task.name, 
                        me              : loginUser, 
                        statusHistory   : time.format_specify_field(statusHistory, { created_time : 'datetime'}),
                        task            : task,
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
        status_coll.create({ 
            task_id         : req.params.task_id,
            name            : req.body.task_status_name,
            content         : req.body.description,
            files           : req.body.taskfiles,
            operator_id     : operator._id,
            created_time    : new Date(),
        }, function(err, status) {
            if (err) {
                res.send({ ok : 0, msg : '数据库错误' })
                return
            }
            task_coll.findAndModifyById(req.params.task_id, { status : req.body.task_status_name}, function(err, task) {
                routeApp.createLogItem({ status_name : req.body.task_status_name, log_type : 11, }, operator, task)
                res.send({ ok : 1 })
            })
        })
    })
}
var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var milestone_coll  = require('../db/milestone')

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        user_coll.findAll(function(err, users) {
            task_coll.findAll(function(err, tasks) {
                res.render('task/index', 
                    { 
                        title   : '任务', 
                        me      : loginUser, 
                        users   : users,
                        tasks   : tasks
                    } 
                )
            })
        }) 
    })
}

exports.show = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.id, function(err, task) {
            if (!task) {
                res.redirect('/404')
                return
            }

            user_coll.findTaskUsers(task.task_users, function(err, usersResult) {
                user_coll.findAll(function(err, usersArray) {
                    res.render('task/info', 
                        { 
                            title       : task.name, 
                            me          : loginUser, 
                            task        : task,
                            taskUsers   : usersResult,
                            users       : usersArray,
                        } 
                    )
                })
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
                    event_time      : req.body.task_milestone_time,
                    created_time    : new Date()
                },  
                function(err, result) {
                    if (err) {
                        res.send({ ok : 0, msg : '数据库错误' })
                        return
                    }
                    //only support create one task in one time 
                    routeApp.createLogItem({
                        operator_id     : operator._id,
                        operator_name   : operator.name,
                        event_time      : result[0].created_time,
                        task_name       : task.name,
                        task_id         : task._id,
                        milestone_name  : result[0].name,
                        milestone_id    : result[0]._id,
                        log_type        : 7
                    })

                    res.send({ ok : 1, id : result[0]._id})
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
        task_coll.findById(req.params.id, function(err, result) {
            task_coll.removeById(req.params.id, function(err) {
                res.send({ ok : 1 })
                routeApp.createLogItem({
                    operator_id     : operator._id,
                    operator_name   : operator.name,
                    event_time      : new Date(),
                    task_name       : result.name,
                    task_id         : result._id,
                    log_type        : 2
                })
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

        var updateDoc = {}
        var log_type  = 5
        if (req.body.name) {
            updateDoc = { name : req.body.name }
        }

        if (req.body.task_users) {
            updateDoc = { task_users : generateTaskUsers(req) }
            log_type  = 6
        }
        task_coll.findAndModifyById(req.params.id, updateDoc, function(err, result) {
            res.send({ ok : 1 })
            routeApp.createLogItem({
                operator_id     : operator._id,
                operator_name   : operator.name,
                event_time      : new Date(),
                task_name       : result.name,
                task_id         : result._id,
                log_type        : log_type
            })
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
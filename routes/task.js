var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var version_coll    = require('../db/version')
var time            = require('../helper/time')

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
                    milestone_coll.findByTaskId(req.params.id, function(err, milestones) {
                        res.render('task/info', 
                            { 
                                title       : task.name, 
                                me          : loginUser, 
                                task        : task,
                                taskUsers   : usersResult,
                                users       : usersArray,
                                milestones  : time.format_specify_field(milestones, {event_time : 'date'}),
                            } 
                        )
                    })
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

        counter_coll.saveTaskId(function(err, task_id) {
            task_coll.create({
                    name            : req.body.name,
                    task_users      : generateTaskUsers(req),
                    task_id         : task_id,
                    active          : true,
                    branch          : '',
                    status          : '',
                    created_time    : new Date()
                },  
                function(err, result) {
                    if (err) {
                        res.send({ ok : 0, msg : '数据库错误' })
                        return
                    }
                    res.send({ ok : 1, id : result[0]._id})
                    //only support create one task in one time 
                    routeApp.createLogItem({
                        operator_id     : operator._id,
                        operator_name   : operator.name,
                        event_time      : result[0].created_time,
                        task_name       : result[0].name,
                        task_id         : result[0]._id,
                        log_type        : 1
                    })
                }
            )
        }) 
    })
}

exports.archive = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }
        task_coll.findById(req.params.id, function(err, task_result) {
            var log_type_result = 3
            if (!task_result.active) {
                log_type_result = 4
            }
            task_coll.findAndModifyById(req.params.id, { active : !task_result.active }, function(err, result) {
                res.send({ ok : 1 , active : !task_result.active})
                routeApp.createLogItem({
                    operator_id     : operator._id,
                    operator_name   : operator.name,
                    event_time      : new Date(),
                    task_name       : result.name,
                    task_id         : result._id,
                    log_type        : log_type_result,
                })
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

        if (req.body.branch) {
            updateDoc = { branch : req.body.branch}
            log_type  = 10
            version_coll.create({ 
                task_id         : req.params.id,
                name            : '设置分支：' + req.body.branch,
                content         : '',
                files           : [],
                operator_id     : operator._id,
                operator_name   : operator.name,
                created_time    : new Date(),
            })
        }
        task_coll.findAndModifyById(req.params.id, updateDoc, function(err, result) {
            
            routeApp.createLogItem({
                operator_id     : operator._id,
                operator_name   : operator.name,
                event_time      : new Date(),
                task_name       : result.name,
                task_id         : result._id,
                log_type        : log_type
            })

            res.send({ ok : 1 })
        })
    })
}

function generateTaskUsers(req) {
    var generateResult  = []
    var users           = req.body.task_users
    if (users && Array.isArray(users)) {
        users.forEach(function(item, index, array) {
            if (item !== '') {
                generateResult.push(item)
            }
        })
    }
    return generateResult
}
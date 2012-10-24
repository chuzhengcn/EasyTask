var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var status_coll     = require('../db/status')
var file_coll       = require('../db/file')
var todo_coll       = require('../db/todo')
var time            = require('../helper/time')

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        user_coll.findAll(function(err, users) {
            var filter      = {}
            filter.active   = true
            if (req.query) {
                if (req.query.active !== undefined) {
                    filter.active = false
                }

                if(req.query.status) {
                    filter.status = req.query.status
                }
            }
            
            task_coll.findAll(filter, function(err, tasks) {
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

            user_coll.findTaskUsers(task.users, function(err, usersResult) {
                user_coll.findAll(function(err, usersArray) {
                    milestone_coll.findByTaskId(req.params.id, function(err, milestones) {
                        file_coll.findByTaskIdInSummary(req.params.id, function(err, taskFileResult) {
                            todo_coll.findByTask({task_id : req.params.id}, 4, function(err, taskTodoResult) {
                                res.render('task/info', 
                                    { 
                                        title       : task.name, 
                                        me          : loginUser, 
                                        task        : task,
                                        taskUsers   : usersResult,
                                        users       : usersArray,
                                        taskTodos   : time.format_specify_field(taskTodoResult, {created_time : 'datetime'}),
                                        taskFiles   : time.format_specify_field(taskFileResult, {created_time : 'datetime'}),
                                        milestones  : time.format_specify_field(milestones, {event_time : 'date'}),
                                    } 
                                )
                            })
                        })
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
        generateTaskUsers(req, function(taskUsers) {
            counter_coll.saveTaskId(function(err, custom_id) {
                task_coll.create({
                        name            : req.body.name,
                        users           : taskUsers,
                        custom_id       : custom_id,
                        active          : true,
                        branch          : '',
                        status          : '需求提交',
                        created_time    : new Date()
                    },  
                    function(err, result) {
                        if (err) {
                            res.send({ ok : 0, msg : '数据库错误' })
                            return
                        }
                        status_coll.create({
                            task_id         : result[0]._id.toString(),
                            name            : '需求提交',
                            content         : '',
                            files           : [],
                            operator_id     : operator._id,
                            created_time    : new Date(),
                        }, function(err, statusResult) {
                            routeApp.createLogItem({ log_type : 1 }, operator, result[0])
                            res.send({ ok : 1, id : result[0]._id})
                        })
                    }
                )
            }) 
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
                routeApp.createLogItem({ log_type : log_type_result,}, operator, result)
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
                routeApp.createLogItem({log_type : 2 }, operator, result)
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
            startUpdateTask()
            return
        }

        if (req.body.task_users) {
            log_type  = 6
            generateTaskUsers(req, function(taskUsers) {
                updateDoc = {users : taskUsers}
                startUpdateTask()
            })

            return
        }

        if (req.body.branch) {
            updateDoc = { branch : req.body.branch}
            log_type  = 10
            var custom_id = req.body.branch.split('/')[1]
            if (custom_id) {
                updateDoc.custom_id = custom_id
            }
            status_coll.create({ 
                task_id         : req.params.id,
                name            : '把分支修改为：' + req.body.branch,
                content         : '',
                files           : [],
                operator_id     : operator._id,
                created_time    : new Date(),
            })
            startUpdateTask()
            return
        }

        function startUpdateTask() {
            task_coll.findAndModifyById(req.params.id, updateDoc, function(err, result) {
                
                routeApp.createLogItem({log_type : log_type }, operator, result)

                res.send({ ok : 1 })
            })
        }
    })
}

exports.newCustomId = function(req, res) {
    counter_coll.saveTaskId(function(err, newId) {
        res.send({ ok : 1, id : newId})
    })
}

function generateTaskUsers(req, cb) {
    var generateResult  = []
    var users           = req.body.task_users
    var userNum         = 0
    if (users && Array.isArray(users)) {

        users.forEach(function(item, index, array) {
            if (item) {
                userNum++
            }
        })

        users.forEach(function(item, index, array) {
            if (item !== '') {
                user_coll.findByName(item, function(err, user) {
                    generateResult.push(user._id)
                    userNum--
                    if (userNum == 0) {
                        cb(generateResult)
                    }
                })  
            }
        })
    }
}
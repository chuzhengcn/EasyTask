var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var status_coll     = require('../db/status')
var time            = require('../helper/time')
var file_coll       = require('../db/file')
var todo_coll       = require('../db/todo')

exports.new = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.task_id, function(err, task) {
            res.render('todo/new', 
                { 
                    title   : '添加待办事项 - ' + task.name, 
                    me      : loginUser,
                    task    : task
                } 
            )
        })
    })
}

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.task_id, function(err, task) {
            todo_coll.findByTask(req.params.task_id, function(err, todos) {
                res.render('todo/index', 
                    { 
                        title   : '待办事项 - ' + task.name, 
                        me      : loginUser,
                        todos   : time.format_specify_field(todos, { created_time : 'datetime' }), 
                        task    : task,
                    } 
                )
            })
        })
    })
}

exports.show = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.task_id, function(err, task) {
            if (!task) {
                res.redirect('/404')
                return
            }

            todo_coll.findById(req.params.id, function(err, todo) {
                res.render('todo/info',
                    {
                        title : todo.name + '-' + 'task.name',
                        me    : loginUser,
                        todo  : time.format_specify_field(todo, {created_time : 'datetime'}),
                        task  : task,
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
        todo_coll.create({ 
            task_id         : req.params.task_id,
            name            : req.body.name,
            content         : req.body.description,
            category        : req.body.category,
            files           : req.body.taskfiles,
            operator_id     : operator._id,
            created_time    : new Date(),
            mordify_time    : new Date(),
            complete        : false,
        }, function(err, status) {
            if (err) {
                res.send({ ok : 0, msg : '数据库错误' })
                return
            }
            
            res.send({ ok : 1 })

            task_coll.findById(req.params.task_id, function(err, task) {
                routeApp.createLogItem({ todo_name : req.body.name, log_type : 11, }, operator, task)
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
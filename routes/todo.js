var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var status_coll     = require('../db/status')
var time            = require('../helper/time')
var view            = require('../helper/view')
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

            todo_coll.findByIdIncludeUser(req.params.id, function(err, todo) {
                todo.comments = time.format_specify_field(todo.comments, { created_time : 'datetime'})
                res.render('todo/info',
                    {
                        title : todo.name + '-' + task.name,
                        me    : loginUser,
                        todo  : view.keepLineBreak(time.format_specify_field(todo, {modify_time : 'datetime'}),['content']),
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
            files           : req.body.taskfiles || [],
            operator_id     : operator._id,
            created_time    : new Date(),
            modify_time     : new Date(),
            complete        : 0,
            comments        : [{
                operator_id     : operator._id,
                content         : '创建了这个事项',
                created_time    : new Date(),
            }],
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
        var log_type  = 14

        if (req.body.complete !== undefined ) {
            var content
            if (req.body.complete == 1) {
                content = '已完成'
            } else {
                content = '还没有完成'
            }

            updateDoc = { 
                complete    : req.body.complete,
                modify_time : new Date(),
                comment     : {
                    operator_id     : operator._id,
                    content         : content,
                    created_time    : new Date(),
                }
            }
            startUpdateTodo()
            return
        }

        if (req.body.comment) {
            log_type   = 18
            updateDoc  = {
                comment : {
                    operator_id     : operator._id,
                    content         : req.body.comment,
                    created_time    : new Date(),
                }
            }
            startUpdateTodo()
            return
        }

        function startUpdateTodo() {
            todo_coll.findAndModifyById(req.params.id, updateDoc, function(err, result) {
                res.send({ ok : 1 })

                task_coll.findById(req.params.task_id, function(err, task) {
                    routeApp.createLogItem({log_type : log_type, todo_id : result._id }, operator, task)
                })
                
            })
        }
    })
}
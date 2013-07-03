var routeApp        = require('./app'),
    taskModel       = require('../model/task').task,
    time            = require('../helper/time'),
    view            = require('../helper/view'),
    upload_route    = require('./upload'),
    todoModel       = require('../model/todo').todo;

exports.new = function(req, res) {
    var taskCustomId = req.params.task_custom_id;

    taskModel.findOne({custom_id : taskCustomId}, function(err, taskResult) {
        res.render('todo/new', 
            { 
                title   : '添加文档 - ' + taskResult.name, 
                task    : taskResult
            } 
        )
    })
}

exports.list = function(req, res) {
    var taskCustomId = req.params.task_custom_id;

    taskModel.findOne({custom_id : taskCustomId}, function(err, taskResult) {
        if (!taskResult || err) {
            routeApp.err404(req, res)
            return
        }

        todoModel.findAllIncludeUserByTaskId(String(taskResult._id), function(err, todoResults) {
            todoResults = todoResults.map(function(item, index) {
                item.created_time = time.readable_time(item.created_time)
                return item
            })

            res.render('todo/index', 
                { 
                    title   : '全部文档 - ' + taskResult.name, 
                    todos   : todoResults, 
                    task    : taskResult,
                } 
            )
        })
    })
}

exports.show = function(req, res) {
    var id = req.params.id;

    todoModel.findOneTodoIncludeUser(id, function(err, todoResult) {
        if (!todoResult || err) {
            routeApp.err404(req, res)
            return
        }

        todoResult.comments = time.format_specify_field(todoResult.comments, { created_time : 'readable_time'})

        taskModel.findById(todoResult.task_id, function(err, taskResult) {
            if (err || !taskResult) {
                routeApp.err404(req, res)
                return
            }

            res.render('todo/info',
                {
                    title : todoResult.name + '-' + taskResult.name,
                    todo  : time.format_specify_field(todoResult, {created_time : 'readable_time', updated_time : 'readable_time'}),
                    task  : taskResult,
                }
            )
        })
    })
}

exports.edit = function(req, res) {
    var taskCustomId = req.params.task_custom_id,
        id           = req.params.id;

    taskModel.findOne({custom_id : taskCustomId}, function(err, taskResult) {
        if (err || !taskResult) {
            routeApp.err404(req, res)
            return
        }

        todoModel.findById(id, function(err, todoResult) {
            if (err || !todoResult) {
                routeApp.err404(req, res)
                return
            }

            res.render('todo/edit',
                {
                    title : todoResult.name + '-' + taskResult.name,
                    todo  : todoResult,
                    task  : taskResult,
                }
            )
        })
    })
}

exports.create = function(req, res) {
    var taskId  = req.params.task_id,
        newTodo = null;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ok : 0, msg : '没有文档名'})
            return
        }

        if (!req.body.description) {
            res.send({ok : 0, msg : '没有文档内容'})
            return
        }

        if (!req.body.category) {
            res.send({ok : 0, msg : '没有文档类别'})
            return
        }

        newTodo = new todoModel({
            task_id         : taskId,
            name            : req.body.name,
            content         : req.body.description,
            category        : req.body.category,
            files           : req.body.taskfiles || [],
            operator_id     : operator._id,
            created_time    : new Date(),
            updated_time    : new Date(),
            complete        : false,
            comments        : [],
        })

        newTodo.save(function(err, todoResult) {
            if (err) {
                res.send({ok : 0, msg : '创建失败'})
                return
            }

            res.send({ok : 1, todo : todoResult})

            routeApp.createLogItem(String(operator._id), taskId, '16', todoResult.name)
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

        taskModel.findById(taskId, function(err, taskResult) {
            if (err || !taskResult) {
                res.send({ok : 0, msg : '没有找到任务'})
                return
            }

            todoModel.findById(id, function(err, todoResult) {
                todoModel.findByIdAndRemove(id, function(err) {
                    res.send({ok : 1})
                    upload_route.deleteTaskFiles(todoResult.files, function() {})
                    routeApp.createLogItem(String(operator._id), taskId, '18', todoResult.name)
                })
            })
        })
    })
}

exports.update = function(req, res) {
    var taskId      = req.params.task_id,
        id          = req.params.id,
        logContent  = '',
        todoFiles   = [],
        updateDoc   = {};

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ok : 0, msg : '文档名称必填'})
            return
        }

        if (!req.body.category) {
            res.send({ok : 0, msg : '类别必填'})
            return
        }

        if (!req.body.description) {
            res.send({ok : 0, msg : '内容必填'})
            return
        }

        todoModel.findById(id, function(err, originTodo) {
            if (req.body.taskfiles) {
                todoFiles = originTodo.files.concat(req.body.taskfiles)
            } else {
                todoFiles = originTodo.files
            }

            updateDoc = {
                name            : req.body.name,
                content         : req.body.description || '',
                category        : req.body.category,
                files           : todoFiles,
                operator_id     : String(operator._id),
                updated_time    : new Date(),
            }

            todoModel.findByIdAndUpdate(id, updateDoc, function(err, todoResult) {
                if (err) {
                    res.send({ok : 0, msg : '数据库错误'})
                    return
                }

                res.send({ok : 1, todo : todoResult})

                if (originTodo.name !== todoResult.name) {
                    logContent = logContent + '文档名由 ' + originTodo.name + ' 改为 ' + todoResult.name + ';\n'
                }

                if (originTodo.category !== todoResult.category) {
                    logContent = logContent + '类别由 ' + originTodo.category + ' 改为 ' + todoResult.category + ';\n'
                }

                if (originTodo.content !== todoResult.content) {
                    logContent = logContent + '更改了文档内容;\n'
                }

                routeApp.createLogItem(String(operator._id), taskId, '20', logContent)
            })
        })
    })
}

exports.addComment = function(req, res) {
    var taskId      = req.params.task_id,
        id          = req.params.id,
        content     = req.body.content,
        updateDoc   = {};

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!content) {
            res.send({ok : 0, msg : '没有评论内容'})
            return
        }

        updateDoc = {
            $push : {"comments" : {operator_id : String(operator._id), content : content, created_time : new Date()}}
        }

        todoModel.findByIdAndUpdate(id, updateDoc, function(err, todoResult) {
            if (!todoResult) {
                res.send({ok : 0, msg : "没有找到要修改的文档"})
                return
            }

            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), taskId, '17', todoResult.name)
        })
    })
}

exports.removeFile = function(req, res) {
    var id      = req.params.id,
        taskId  = req.params.task_id,
        fileId  = req.body.file_id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (fileId) {
            todoModel.findById(id, function(err, todoResult) {
                todoResult.files.forEach(function(item, index) {
                    if (item._id === fileId) {
                        todoResult.files.splice(index, 1)
                    }
                })

                todoModel.findByIdAndUpdate(id, {files : todoResult.files}, function(err, removedFileTodoResult) {
                    routeApp.createLogItem(String(operator._id), taskId, '20', '修改了文档附件')
                    res.send({ok : 1})
                })
            })
        } else {
            res.send({ ok : 0})
        }
    })
}
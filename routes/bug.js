var routeApp        = require('./app'),
    time            = require('../helper/time'),
    view            = require('../helper/view'),
    taskModel       = require('../model/task').task,
    userModel       = require('../model/user').user,
    roleModel       = require('../model/data').role,
    bugModel        = require('../model/bug').bug,
    counterModel    = require('../model/counter').counter,
    bugtypeModel    = require('../model/data').bugType,
    bugStatusModel  = require('../model/data').bugStatus,
    bugLevelModel   = require('../model/data').bugLevel,
    upload_route    = require('./upload');

exports.new = function(req, res) {
    var customId    = req.params.task_id,
        programmers = [];

    taskModel.findOne({custom_id : customId}, function(err, taskResult) {
        if (err || !taskResult) {
            routeApp.err404(req, res)
            return
        }

        userModel.findActiveUsers(function(err, users) {
            users.forEach(function(item, index) {
                if (item.role.indexOf(roleModel[1]) > -1) {
                    programmers.push(item)
                }
            })

            res.render('bug/new', 
                { 
                    title       : '添加Bug - ' + taskResult.name, 
                    task        : taskResult,
                    bugTypes    : bugtypeModel,
                    bugLevels   : bugLevelModel,
                    programmers : programmers,
                } 
            )
        })
    })
}

exports.create = function(req, res) {
    var taskId = req.params.task_id,
        newBug = null;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ok : 0, msg : 'bug名称必填'})
            return
        }

        if (!req.body.type) {
            res.send({ok : 0, msg : 'bug类别必填'})
            return
        }

        if (!req.body.level) {
            res.send({ok : 0, msg : 'bug级别必填'})
            return
        }

        newBug = new bugModel({
            task_id         : taskId,
            name            : req.body.name,
            content         : req.body.content || '',
            type            : req.body.type,
            files           : req.body.taskfiles || [],
            operator_id     : String(operator._id),
            closed          : false,
            comments        : [],
            level           : req.body.level,
            status          : bugStatusModel[0],
            score           : parseInt(req.body.score, 10) || 0,
            assign_to       : req.body.assign_to || '',
            updated_time    : new Date(),
            created_time    : new Date(),
        })

        newBug.save(function(err, bugResult) {
            res.send({ok : 1, bug : bugResult})
            routeApp.createLogItem(String(operator._id), taskId, '12', bugResult.type + ":" + bugResult.name)
        })
    })
}

exports.listPage = function(req, res) {
    var taskId      = req.params.task_id,
        key         = '',
        filter      = {
            task_id     : taskId,
        };  

    bugModel.findBugsIncludeUsersByTaskId(filter, function(err, bugResults) {
        if (err) {
            res.send({ ok : 0, msg : '数据库错误'})
            return
        }

        bugResults = bugResults.map(function(item, index) {
            item.updated_time = time.readable_time(item.updated_time)
            return item
        })

        
        taskModel.findOne({custom_id : taskId}, function(err, taskResult) {
            bugModel.find({task_id : String(taskResult._id), closed : true},{},{sort : {created_time : -1}}, function(err, closedBugs) {
                res.render('bug/index', {
                    bugs            : bugResults,
                    task            : taskResult,
                    bugStatusList   : bugStatusModel,
                    closedBugList   : closedBugs,
                })
            })
        })
    })
}

exports.list = function(req, res) {
    var taskId      = req.params.task_id,
        key         = '',
        filter      = {
            task_id     : taskId,
            closed      : req.query.closed || false,
        };   

    bugModel.findBugsIncludeUsersByTaskId(filter, function(err, bugResults) {
        if (err) {
            res.send({ ok : 0, msg : '数据库错误'})
            return
        }

        bugResults = bugResults.map(function(item, index) {
            item.updated_time = time.readable_time(item.updated_time)
            return item
        })

        res.send({ok : 1, bugs : bugResults})
    })     
}

exports.changeStatus = function(req, res) {
    var taskId      = req.params.task_id,
        id          = req.params.id,
        status      = req.body.status,
        updateDoc   = {};

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!status) {
            res.send({ok : 0, msg : '没有状态名称'})
            return
        }

        updateDoc = { 
            status          : status, 
            updated_time    : new Date(),
            $push           : {"comments" : {
                                operator_id     : String(operator._id),
                                content         : status,
                                created_time    : new Date(),
                            }}
            }

        bugModel.findByIdAndUpdate(id, updateDoc, function(err, bugResult) {
            if (!bugResult) {
                res.send({ok : 0, msg : "没有找到要修改的bug"})
                return
            }

            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), taskId, '13', bugResult.status)
        })
    })
}

exports.show = function(req, res) {
    var id           = req.params.id;

    bugModel.findOneBugsIncludeUsersId(id, function(err, bugResult) {
        if (err || !bugResult) {
            routeApp.err404(req, res)
            return
        }

        bugResult.updated_time  = time.readable_time(bugResult.updated_time)
        bugResult.created_time  = time.format_to_datetime(bugResult.created_time)
        bugResult.comments      = time.format_specify_field(bugResult.comments,{ created_time : 'readable_time'})
        bugResult.comments      = view.keepLineBreak(bugResult.comments, ['content'])

        taskModel.findById(bugResult.task_id, function(err, taskResult) {
            if (err || !taskResult) {
                routeApp.err404(req, res)
                return
            }

            res.render('bug/info', 
                { 
                    title       : 'Bug - ' + bugResult.name, 
                    task        : taskResult,
                    bug         : bugResult,
                } 
            )
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

        bugModel.findByIdAndUpdate(id, updateDoc, function(err, bugResult) {
            if (!bugResult) {
                res.send({ok : 0, msg : "没有找到要修改的bug"})
                return
            }

            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), taskId, '14', bugResult.name)
        })
    })
}

exports.openClose = function(req, res) {
    var taskId      = req.params.task_id,
        id          = req.params.id,
        switcher    = req.body.switcher,
        closed      = false,
        content     = '',
        updateDoc   = {};

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!switcher) {
            res.send({ok : 0, msg : '非法提交'})
            return
        }

        if (switcher === '关闭') {
            closed = true
        } else {
            closed = false
        }

        updateDoc = { 
            closed          : closed,
            updated_time    : new Date(),
            $push           : {"comments" : {
                                operator_id     : String(operator._id),
                                content         : switcher + '了这个bug',
                                created_time    : new Date(),
                            }}
            }

        bugModel.findByIdAndUpdate(id, updateDoc, function(err, bugResult) {
            if (!bugResult) {
                res.send({ok : 0, msg : "没有找到要修改的bug"})
                return
            }

            res.send({ok : 1})

            routeApp.createLogItem(String(operator._id), taskId, '13', switcher + '了这个bug')
        })
    })
}

exports.edit = function(req, res) {
    var taskCustomId = req.params.task_custom_id,
        id           = req.params.id,
        programmers  = [];

    taskModel.findOne({custom_id : taskCustomId}, function(err, taskResult) {
        if (err || !taskResult) {
            routeApp.err404(req, res)
            return
        }

        bugModel.findById(id, function(err, bugResult) {
            if (err || !bugResult) {
                routeApp.err404(req, res)
                return
            }

            userModel.findActiveUsers(function(err, users) {
                users.forEach(function(item, index) {
                    if (item.role.indexOf(roleModel[1]) > -1) {
                        programmers.push(item)
                    }
                })

                res.render('bug/edit', {
                    title       : '编辑' + bugResult.name,
                    task        : taskResult,
                    bug         : bugResult,
                    bugTypes    : bugtypeModel,
                    bugLevels   : bugLevelModel,
                    programmers : programmers,
                })
            })
        })
    })
}

exports.update = function(req, res) {
    var taskId      = req.params.task_id,
        id          = req.params.id,
        logContent  = '',
        bugFiles    = [],
        updateDoc   = {};

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ok : 0, msg : 'bug名称必填'})
            return
        }

        if (!req.body.type) {
            res.send({ok : 0, msg : 'bug类别必填'})
            return
        }

        if (!req.body.level) {
            res.send({ok : 0, msg : 'bug级别必填'})
            return
        }

        bugModel.findById(id, function(err, originBug) {
            if (req.body.taskfiles) {
                bugFiles = originBug.files.concat(req.body.taskfiles)
            } else {
                bugFiles = originBug.files
            }

            updateDoc = {
                name            : req.body.name,
                content         : req.body.content || '',
                type            : req.body.type,
                files           : bugFiles,
                operator_id     : String(operator._id),
                level           : req.body.level,
                score           : parseInt(req.body.score, 10) || 0,
                assign_to       : req.body.assign_to || '',
                updated_time    : new Date(),
            }

            bugModel.findByIdAndUpdate(id, updateDoc, function(err, bugResult) {
                if (err) {
                    res.send({ok : 0, msg : '数据库错误'})
                    return
                }

                res.send({ok : 1, bug : bugResult})

                if (originBug.name !== bugResult.name) {
                    logContent = logContent + 'bug名由 ' + originBug.name + ' 改为 ' + bugResult.name + ';\n'
                }

                if (originBug.type !== bugResult.type) {
                    logContent = logContent + '类别由 ' + originBug.type + ' 改为 ' + bugResult.type + ';\n'
                }

                if (originBug.level !== bugResult.level) {
                    logContent = logContent + '等级由 ' + originBug.level + ' 改为 ' + bugResult.level + ';\n'
                }

                if (originBug.score !== bugResult.score) {
                    logContent = logContent + '分值由 ' + originBug.score + ' 改为 ' + bugResult.score + ';\n'
                }

                if (originBug.content !== bugResult.content) {
                    logContent = logContent + '更改了bug描述;\n'
                }

                if (originBug.assign_to !== bugResult.assign_to) {
                    logContent = logContent + '重新指定了人员;\n'
                }

                routeApp.createLogItem(String(operator._id), taskId, '15', logContent)
            })
        })
    })
}

exports.removeFile = function(req, res) {
    var bugId   = req.params.id,
        taskId  = req.params.task_id,
        fileId  = req.body.file_id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (fileId) {
            bugModel.findById(bugId, function(err, bugResult) {
                bugResult.files.forEach(function(item, index) {
                    if (item._id === fileId) {
                        bugResult.files.splice(index, 1)
                    }
                })

                bugModel.findByIdAndUpdate(bugId, {files : bugResult.files}, function(err, removedFileBugResult) {
                    routeApp.createLogItem(String(operator._id), taskId, '15', '修改了bug附件')
                    res.send({ok : 1})
                })
            })
        } else {
            res.send({ ok : 0})
        }
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

            bugModel.findById(id, function(err, bugResult) {
                bugModel.findByIdAndRemove(id, function(err) {
                    res.send({ok : 1})
                    upload_route.deleteTaskFiles(bugResult.files, function() {})
                    routeApp.createLogItem(String(operator._id), taskId, '19', bugResult.name)
                })
            })
        })
    })
}
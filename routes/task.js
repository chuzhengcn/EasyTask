var routeApp        = require('./app')
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var status_coll     = require('../db/status')
var file_coll       = require('../db/file')
var todo_coll       = require('../db/todo')
var time            = require('../helper/time')
var upload_route    = require('./upload') 
var log_coll        = require('../db/log')

var taskModel       = require('../model/task').task,
    userModel       = require('../model/user').user;

exports.index = function(req, res) {
    var myTask       = [],
        otherTask    = [],
        userGroup    = {}; 

    taskModel.findDevelopingIncludeUserAndMilestone(function(err, tasks) {

        tasks.forEach(function(taskItem, taskIndex) {
            taskItem.milestones = time.format_specify_field(taskItem.milestones, {event_time : 'date'})

            var isMyTask = false
            taskItem.users.forEach(function(userItem, userIndex) {
                if (req.ip === userItem.ip) {
                    isMyTask = true
                }
            })

            if (isMyTask) {
                myTask.push(taskItem)
                taskItem.belong = 'mine'
            } else {
                otherTask.push(taskItem)
                taskItem.belong = 'others'
            }
        })

        userModel.findActiveUsers(function(err, users) {
            users.forEach(function(item, index) {
                if (!userGroup[item.role]) {
                    userGroup[item.role] = [item]
                } else {
                    userGroup[item.role].push(item)
                }
            })

            res.render('index', 
                { 
                    title           : '任务', 
                    taskList        : myTask.concat(otherTask), 
                    userGroup       : userGroup,
                    users           : users,
                } 
            )
        })
    })
}

exports.archiveList = function(req, res) {
    var page = 1

    if (req.query.page && typeof parseInt(req.query.page, 10) === 'number') {
        page = req.query.page
    }
    
    taskModel.findArchivedIncludeUser(page, function(err, tasks, totalTask) {
        res.render('task/archive', 
            { 
                title   : '已存档任务', 
                tasks   : tasks,
                total   : totalTask,
            } 
        )
    })
}

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        user_coll.find_all_open(function(err, users) {
            var filter      = {
                active : true,
                status : { '$nin' : ['需求提交']},
            }
            var page = 1
            var perpageNum = 20
            if (req.query) {
                if (req.query.active !== undefined) {
                    filter.active = false
                    delete filter.status
                }

                if (req.query.status) {
                    filter.status = req.query.status
                }

                if (req.query.user) {
                    filter.users = req.query.user
                    delete filter.status
                }

                if (req.query.branch) {
                    filter.branch = req.query.branch
                }

                if(req.query.keyword) {
                    filter = {
                        '$or' : [{ 'custom_id' : parseInt(req.query.keyword, 10) }, {'name' : new RegExp(req.query.keyword,'i')}]
                    }
                }

                if(req.query.page && typeof parseInt(req.query.page, 10) == 'number') {
                    page = req.query.page
                }
            }
            
            task_coll.findAll(filter, (page-1)*perpageNum, perpageNum, function(err, tasks) {
                tasks.list.forEach(function(item, index, array) {
                    tasks.list[index].milestones = time.format_specify_field(item.milestones, { event_time : 'date'})
                })
                res.render('task/index', 
                    { 
                        title   : '任务', 
                        me      : loginUser, 
                        users   : users,
                        tasks   : tasks.list,
                        total   : tasks.total,
                    } 
                )
            })
        }) 
    })
}


exports.show = function(req, res) {
    var isMyTask = false
    routeApp.identifying(req, function(loginUser) {
        task_coll.findById(req.params.id, function(err, task) {
            if (!task) {
                routeApp.err404(req, res)
                return
            }

            user_coll.findTaskUsers(task.users, function(err, usersResult) {
                user_coll.find_all_open(function(err, usersArray) {
                    milestone_coll.findByTaskId(req.params.id, function(err, milestones) {
                        file_coll.findByTaskIdInSummary(req.params.id, function(err, taskFileResult) {
                            todo_coll.findByTask({task_id : req.params.id}, 0, function(err, taskTodoResult) {
                                status_coll.findLastStatusByTask(req.params.id, function(err, statusResults) {
                                    if (task.users.indexOf(loginUser._id) > -1) {
                                        isMyTask = true
                                    }

                                    res.render('task/info', 
                                        { 
                                            title       : task.name, 
                                            me          : loginUser, 
                                            task        : task,
                                            taskUsers   : usersResult,
                                            users       : usersArray,
                                            taskStatus  : time.format_specify_field(statusResults, {created_time : 'readable_time'})[0],
                                            taskTodos   : time.format_specify_field(taskTodoResult, {created_time : 'readable_time'}),
                                            taskFiles   : time.format_specify_field(taskFileResult, {created_time : 'readable_time'}),
                                            milestones  : time.format_specify_field(milestones, {event_time : 'date'}),
                                            isMyTask    : isMyTask,
                                        } 
                                    )
                                })
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

        generateTaskUsers(req, res, function(taskUsers) {
            counter_coll.saveTaskId(function(err, custom_id) {
                console.log(typeof custom_id)
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
                            routeApp.createLogItem({ log_type : log_coll.logType.createTask }, operator, result[0])
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
            var log_type_result = log_coll.logType.archiveTask
            if (!task_result.active) {
                log_type_result = log_coll.logType.activeTask
            }
            task_coll.findAndModifyById(req.params.id, { active : !task_result.active }, function(err, result) {
                res.send({ ok : 1 , active : !task_result.active})
                routeApp.createLogItem({ log_type : log_type_result,}, operator, result)
            })
        })   
    })
}
//todo : delete todo and status once task hasbeen deleted
exports.delete = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }
        task_coll.findById(req.params.id, function(err, result) {
            task_coll.removeById(req.params.id, function(err) {
                res.send({ ok : 1 })

                file_coll.findByTaskId(req.params.id, function(err,fileResults) {
                    upload_route.deleteTaskFiles(fileResults, function() {})
                })

                milestone_coll.removeByTask(req.params.id, function(err) {})


                routeApp.createLogItem({log_type : log_coll.logType.deleteTask }, operator, result)
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
        var log_type

        if (req.body.name) {
            updateDoc = { name : req.body.name }
            log_type  = log_coll.logType.editTaskName
            startUpdateTask()
            return
        }

        if (req.body.task_users) {
            log_type  = log_coll.logType.editTaskUsers
            generateTaskUsers(req, res, function(taskUsers) {
                updateDoc = {users : taskUsers}
                startUpdateTask()
            })

            return
        }

        if (req.body.branch) {
            updateDoc = { branch : req.body.branch}
            log_type  = log_coll.logType.setTaskBranch
            var custom_id = req.body.branch.split('/')[1]
            if (custom_id && !isNaN(custom_id)) {
                updateDoc.custom_id = parseInt(custom_id, 10)
            }

            task_coll.findById(req.params.id, function(err, taskResult) {
                var branchInfoContent = '建立分支 ' + req.body.branch
                if (taskResult.branch) {
                    branchInfoContent = '分支由 ' + taskResult.branch + ' 变更为 ' + req.body.branch
                }

                status_coll.create({ 
                    task_id         : req.params.id,
                    name            : branchInfoContent,
                    content         : '',
                    files           : [],
                    operator_id     : operator._id,
                    created_time    : new Date(),
                })

                startUpdateTask()
                
            })
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

function generateTaskUsers(req, res, cb) {
    var generateResult  = []
    if (req.body.task_users) {
        if (!Array.isArray(req.body.task_users)) {
            req.body.task_users = [req.body.task_users]
        }

        var allBlank = true
        req.body.task_users.forEach(function(item, index, array) {
            if (item) {
                allBlank = false
            }
        })

        if (allBlank) {
            res.send({ ok : 0, msg : '必须添加至少一个参与人员'})
            return 
        }
    } else {
        res.send({ ok : 0, msg : '必须添加至少一个参与人员'})
        return 
    }

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
var user_coll       = require('../db/user')
var task_coll       = require('../db/task')
var counter_coll    = require('../db/counter')
var milestone_coll  = require('../db/milestone')
var status_coll     = require('../db/status')
var file_coll       = require('../db/file')
var todo_coll       = require('../db/todo')
var upload_route    = require('./upload') 
var log_coll        = require('../db/log')


var routeApp        = require('./app'),
    time            = require('../helper/time'),
    view            = require('../helper/view'),
    taskModel       = require('../model/task').task,
    userModel       = require('../model/user').user,
    milestoneModel  = require('../model/milestone').milestone,
    statusModel     = require('../model/status').status,
    counterModel    = require('../model/counter').counter,
    logModel        = require('../model/log').log,
    todoModel       = require('../model/todo').todo,
    projectModel    = require('../model/data').project,
    statusNameModel = require('../model/data').statusNames,
    branchModel     = require('../model/data').branch,
    bugStatusModel  = require('../model/data').bugStatus;

function generateTaskUsers(userName, cb) {
    var userNameGroup      = [],
        userRef            = [];

    if (!userName) {
        cb('no user name')
        return
    }

    if (typeof userName === 'string') {
        userNameGroup.push(userName)
    }

    if (Array.isArray(userName)) {
        userName.forEach(function(item, index, array) {
            if (item && userNameGroup.indexOf(item) === -1) {
                userNameGroup.push(item)
            }
        })
    }

    userModel.find({name : {$in : userNameGroup}}, {}, {}, function(err, userResults) {
        userRef = userResults.map(function(item, index) {
            return String(item._id)
        })

        cb(null, userRef)
    })
}

function generateBranch(baseBranch, userNameEnglish, taskCustomId) {
    // todo : auto generate programmer english name

    if (!baseBranch) {
        return ''
    }

    if (!taskCustomId) {
        return ''
    }

    if (!userNameEnglish) {
        return baseBranch + '-developer/' + taskCustomId
    }

    return baseBranch + '-' + userNameEnglish +'/' + taskCustomId
}

function filterProjects(projects) {
    var result = []

    if (!projects) {
        return result
    }

    if (typeof projects === 'string') {
        result.push(projects)
        return result
    }

    if (Array.isArray(projects)) {
        projects.forEach(function(item, index) {
            if (item && result.indexOf(item) === -1) {
                result.push(item)
            }
        })

        return result
    }

    return result
}

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
                    projects        : projectModel,
                    branches        : branchModel,
                    statusList      : statusNameModel,
                } 
            )
        })
    })
}

exports.create = function(req, res) {
    var defaultStatus = statusNameModel[0],
        users         = [],
        newTask       = null,
        branch        = '',
        newStatus     = null;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ ok : 0, msg : '任务名必填'})
            return
        }

        if (!req.body.taskUsers) {
            res.send({ ok : 0, msg : '至少有一名参与者'})
            return
        }

        if (!req.body.project) {
            res.send({ ok : 0, msg : '至少有一个站点，不知道的话就写unknown'})
            return
        }

        generateTaskUsers(req.body.taskUsers, function(err, userRef) {
            if (!err) {
                users = userRef
            }

            counterModel.saveTaskId(function(err, custom_id) {
                newTask = new taskModel({
                    name            : req.body.name,
                    users           : users,
                    custom_id       : custom_id,
                    active          : true,
                    status          : defaultStatus,
                    updated_time    : new Date(),
                    created_time    : new Date(),
                    deleted         : false,
                    branch          : generateBranch(req.body.branch, '', custom_id),
                    projects        : filterProjects(req.body.project),
                    score           : parseInt(req.body.score, 10) || 0,
                })

                newTask.save(function(err, newTaskResult) {
                    if (err) {
                        res.send({ok : 0, msg : JSON.stringify(err)})
                        return
                    }

                    newStatus = new statusModel({
                        task_id         : String(newTaskResult._id),
                        name            : statusNameModel[0],
                        content         : '',
                        files           : [],
                        operator_id     : String(operator._id),
                        updated_time    : new Date(),
                        created_time    : new Date(),
                    })

                    newStatus.save(function(err, statusResult) {
                        res.send({ok : 1, task : newTaskResult})
                        routeApp.createLogItem(String(operator._id), String(newTaskResult._id), '1')
                    })
                })
            })
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

exports.requirement = function(req, res) {

    taskModel.findRequireMentIncludeUserAndMilestone(function(err, tasks) {

        tasks.forEach(function(taskItem, taskIndex) {
            taskItem.milestones = time.format_specify_field(taskItem.milestones, {event_time : 'date'})
        })

        res.render('task/requirement', 
            { 
                title           : '需求', 
                taskList        : tasks, 
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
    var custom_id = parseInt(req.params.id, 10)

    taskModel.findOneTaskIncludeUser({custom_id : custom_id}, {}, {}, function(err, taskResult) {
        if (err || !taskResult) {
            routeApp.err404(req, res)
            return
        }
        taskResult.created_time   = time.readable_time(taskResult.created_time)
        // get all user
        userModel.findActiveUsers(function(err, usersResults) {

            // get latest status
            statusModel.findLatestStatusIncludeUserByTaskId(String(taskResult._id), function(err, statusResult) {
                statusResult = view.keepLineBreak(time.format_specify_field(statusResult, { created_time : 'readable_time'}), ['content']),

                // get all milestones
                milestoneModel.find({task_id : String(taskResult._id)}, {}, {sort : {event_time : 1}}, function(err, milestoneResults) {
                    milestoneResults = milestoneResults.map(function(item, index) {
                        item                = item.toObject()
                        item.event_time     = time.format_to_date(item.event_time,'-')
                        
                        return item 
                    })

                    // get all todos
                    todoModel.findAllIncludeUserByTaskId(String(taskResult._id), function(err, todoResults) {
                        todoResults = time.format_specify_field(todoResults, {updated_time : 'readable_time'})

                        // get log
                        logModel.findLogIncludeUserByTaskId(String(taskResult._id), 5, function(err, logResults) {
                            logResults = time.format_specify_field(logResults, {created_time : 'readable_time'})

                            res.render('task/info',{
                                title           : taskResult.name,
                                task            : taskResult,
                                users           : usersResults,
                                projects        : projectModel,
                                milestones      : milestoneResults,
                                latestStauts    : statusResult,
                                bugStatusList   : bugStatusModel,
                                todos           : todoResults,
                                logs            : logResults,
                            })
                        })
                    })
                })
            })
        })
    })
}



exports.archive = function(req, res) {
    var id      = req.params.id,
        logType = '4';

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        taskModel.findById(id, function(err, taskResult) {
            if (taskResult.active === true) {
                logType = '4'
                taskResult.active = false
            } else {
                logType = '5'
                taskResult.active = true
            }

            taskResult.save(function(err, updatedTask) {
                res.send({ok : 1})
                routeApp.createLogItem(String(operator._id), String(updatedTask._id), logType)
            })
        }) 
    })
}

exports.delete = function(req, res) {
    var id = req.params.id

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        taskModel.findByIdAndUpdate(id, {deleted : true}, function(err, taskResult) {
            res.send({ok : 1})
            routeApp.createLogItem(String(operator._id), String(taskResult._id), '3')
        })
    })
}

exports.update = function(req, res) {
    var id          = req.params.id,
        newCustomId = 0,
        logContent  = '',
        updateDoc   = {
            name            : '',
            users           : [],
            custom_id       : '',
            branch          : '',
            projects        : [],
            score           : 0,
            updated_time    : new Date(),
        };
        

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.name) {
            res.send({ ok : 0, msg : '任务名必填'})
            return
        }

        generateTaskUsers(req.body.taskUsers, function(err, userRef) {
            if (!err) {
                updateDoc.users = userRef
            }

            updateDoc.name        = req.body.name
            updateDoc.branch      = req.body.branch
            updateDoc.score       = parseInt(req.body.score, 10)
            updateDoc.projects    = filterProjects(req.body.project)

            newCustomId = parseInt(updateDoc.branch.split('/')[1], 10)
            if (!isNaN(newCustomId)) {
                updateDoc.custom_id = newCustomId
            }

            taskModel.findById(id, function(err, taskResult) {
                taskModel.findByIdAndUpdate(id, updateDoc, function(err, updatedTask) {
                    res.send({ok : 1, task : updatedTask})

                    if (taskResult.name !== updatedTask.name) {
                        logContent = logContent + '任务名由 ' + taskResult.name + ' 改为 ' + updatedTask.name + ';\n'
                    }

                    if (taskResult.branch !== updatedTask.branch) {
                        logContent = logContent + '分支由 ' + taskResult.branch + ' 改为 ' + updatedTask.branch + ';\n'
                    }

                    if (taskResult.custom_id !== updatedTask.custom_id) {
                        logContent = logContent + '任务id由 ' + taskResult.custom_id + ' 改为 ' + updatedTask.custom_id + ';\n'
                    }

                    if (taskResult.score !== updatedTask.score) {
                        logContent = logContent + '分值由 ' + taskResult.score + ' 改为 ' + updatedTask.score + ';\n'
                    }

                    if (taskResult.projects.join() !== updatedTask.projects.join()) {
                        logContent = logContent + '站点由 ' + taskResult.projects.join(',') + ' 改为 ' + updatedTask.projects.join(',') + ';\n'
                    }

                    if (taskResult.users.join() !== updatedTask.users.join()) {
                        userModel.findUsersByIdGroup(taskResult.users, function(err, pastUsers) {
                            userModel.findUsersByIdGroup(updatedTask.users, function(err, currentUsers) {
                                pastUsers = pastUsers.map(function(item, index) {
                                    return item.name
                                })

                                currentUsers = currentUsers.map(function(item, index) {
                                    return item.name
                                })

                                logContent = logContent + '人员由 ' + pastUsers.join(',') + ' 改为 ' + currentUsers.join(',') + ';\n'
                                routeApp.createLogItem(String(operator._id), String(updatedTask._id), '2', logContent)
                            })
                        })
                    } else {
                        routeApp.createLogItem(String(operator._id), String(updatedTask._id), '2', logContent)
                    }
                })
            })          
        })
    })
}

exports.newCustomId = function(req, res) {
    counterModel.saveTaskId(function(err, newId) {
        res.send({ ok : 1, id : newId})
    })
}

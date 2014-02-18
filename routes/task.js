var async           = require('async'),
    routeApp        = require('./app'),
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
    bugStatusModel  = require('../model/data').bugStatus,
    ratingModel     = require('../model/data').rating,
    userRoleModel   = require('../model/data').role,
    reviewModel     = require('../model/review').review,
    reviewStandards = require('../model/data').review,
    upload_route    = require('./upload');

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
        userResults.forEach(function(item, index) {
            var order = userNameGroup.indexOf(item.name)
            if (order > -1) {
                userRef[order] = String(item._id)
            }
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
        return baseBranch + '-'
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
// match user and score
function filterScore(users, score) {
    var result = users.map(function(item, index) {
        return 0
    })

    if (!score || result.length < 1) {
        return result
    }

    if (typeof score === 'string') {
        result[0] = parseInt(score)
        return result
    }

    users.forEach(function(item, index) {
        if (score[index] && !isNaN(score[index])) {
            result[index] = parseInt(score[index])
        } else {
            result[index] = 0
        }
    })

    return result
}

exports.index = function(req, res) {
    var myTask       = [],
        otherTask    = [],
        userGroup    = {},
        roleName     = ''; 

    taskModel.findDevelopingIncludeUserAndMilestone(function(err, tasks) {
        // sort by next event_time
        tasks.sort(function(value1, value2) {
            if (typeof value1.milestones[0] === 'undefined' && typeof value2.milestones[0] === 'object') {
                return 1
            }

            if (typeof value1.milestones[0] === 'object' && typeof value2.milestones[0] === 'undefined') {
                return -1
            }

            if (typeof value1.milestones[0] === 'undefined' && typeof value2.milestones[0] === 'undefined') {
                return 0
            }

            if (value1.milestones[0].event_time.getTime() > value2.milestones[0].event_time.getTime()) {
                return 1
            }

            if (value1.milestones[0].event_time.getTime() < value2.milestones[0].event_time.getTime()) {
                return -1
            }

            return 0
        })

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
            userRoleModel.forEach(function(item, index) {
                userGroup[item] = []
            })

            users.forEach(function(item, index) {
                for (roleName in userGroup) {
                    if (item.role.indexOf(roleName) > -1) {
                        userGroup[roleName].push(item)
                    }
                }
            })

            taskModel.count({status : statusNameModel[0], active : true, deleted : false}, function(err, defaultStatusNum) {
                taskModel.count({active : false, deleted : false}, function(err, archivedNum) {
                    res.render('index', 
                        { 
                            title               : '任务', 
                            taskList            : myTask.concat(otherTask), 
                            userGroup           : userGroup,
                            users               : users,
                            projects            : projectModel,
                            branches            : branchModel,
                            statusList          : statusNameModel,
                            defaultStatusNum    : defaultStatusNum,
                            archivedNum         : archivedNum,
                        } 
                    )
                })
            })
        })
    })
}

exports.create = function(req, res) {
    var defaultStatus = statusNameModel[0],
        users         = [],
        newTask       = null,
        branch        = '',
        newStatus     = null,
        score         = [];

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
                    id_history      : [custom_id],
                    active          : true,
                    status          : defaultStatus,
                    updated_time    : new Date(),
                    created_time    : new Date(),
                    deleted         : false,
                    branch          : generateBranch(req.body.branch, '', custom_id),
                    projects        : filterProjects(req.body.project),
                    score           : filterScore(userRef, req.body.score),
                    rating          : [],
                    end_time        : null,
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
    var page = isNaN(parseInt(req.query.page, 10))? 1 : parseInt(req.query.page, 10);
    
    taskModel.findArchivedIncludeUser(page, function(err, tasks, totalTask) {
        if (err) {
            routeApp.err404(req, res)
            return
        }

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
        if (err) {
            routeApp.err404(req, res)
            return
        }

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

// exports.list = function(req, res) {
//     routeApp.identifying(req, function(loginUser) {
//         user_coll.find_all_open(function(err, users) {
//             var filter      = {
//                 active : true,
//                 status : { '$nin' : ['需求提交']},
//             }
//             var page = 1
//             var perpageNum = 20
//             if (req.query) {
//                 if (req.query.active !== undefined) {
//                     filter.active = false
//                     delete filter.status
//                 }

//                 if (req.query.status) {
//                     filter.status = req.query.status
//                 }

//                 if (req.query.user) {
//                     filter.users = req.query.user
//                     delete filter.status
//                 }

//                 if (req.query.branch) {
//                     filter.branch = req.query.branch
//                 }

//                 if(req.query.keyword) {
//                     filter = {
//                         '$or' : [{ 'custom_id' : parseInt(req.query.keyword, 10) }, {'name' : new RegExp(req.query.keyword,'i')}]
//                     }
//                 }

//                 if(req.query.page && typeof parseInt(req.query.page, 10) == 'number') {
//                     page = req.query.page
//                 }
//             }
            
//             task_coll.findAll(filter, (page-1)*perpageNum, perpageNum, function(err, tasks) {
//                 tasks.list.forEach(function(item, index, array) {
//                     tasks.list[index].milestones = time.format_specify_field(item.milestones, { event_time : 'date'})
//                 })
//                 res.render('task/index', 
//                     { 
//                         title   : '任务', 
//                         me      : loginUser, 
//                         users   : users,
//                         tasks   : tasks.list,
//                         total   : tasks.total,
//                     } 
//                 )
//             })
//         }) 
//     })
// }

exports.search = function(req, res) {
    if (!req.query.keyword) {
        res.redirect('/')
        return
    }

    var page        = isNaN(parseInt(req.query.page, 10))? 1 : parseInt(req.query.page, 10),
        keyword     = req.query.keyword.trim(),
        filter      = {},
        operator_id = '';
    
    userModel.find(function(err, userResults) {
        if (!isNaN(parseInt(keyword, 10))) {
            filter = {
                'id_history' : parseInt(keyword, 10)
            } 
        } else {
            userResults.forEach(function(item, index) {
                if (item.name === keyword) {
                    operator_id = String(item._id)
                }
            })

            if (operator_id) {
                filter = {
                    'users' : operator_id
                }
            } else {
                filter = {
                    'name' : new RegExp(keyword,'i')    
                }
            }
        }

        taskModel.findSearchIncludeUser(filter, page, function(err, tasks, totalTask) {
            if (err) {
                routeApp.err404(req, res)
                return
            }

            res.render('task/search', 
                { 
                    title   : '已存档任务', 
                    tasks   : tasks,
                    total   : totalTask,
                } 
            )
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
        taskResult.updated_time   = time.readable_time(taskResult.updated_time)
        // readable ratings
        taskResult.rating = taskResult.rating.map(function(item, index) {
            ratingModel.forEach(function(value, key) {
                if (value.score === item.rating) {
                    item.name = value.name
                }
            })
            
            return item
        })
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
                                ratings         : ratingModel,
                                allStatus       : statusNameModel,
                                type1Standards  : reviewStandards.type1.standards,
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
                taskResult.active   = false
                taskResult.end_time = new Date()
            } else {
                logType = '5'
                taskResult.active   = true
                taskResult.end_time = null
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
            updateDoc.score       = filterScore(userRef, req.body.score)
            updateDoc.projects    = filterProjects(req.body.project)
            
            taskModel.findById(id, function(err, taskResult) {
                newCustomId = parseInt(updateDoc.branch.split('/')[1], 10)
                if (newCustomId && !isNaN(newCustomId) && (taskResult.custom_id !== newCustomId)) {
                    updateDoc.custom_id     = newCustomId
                    updateDoc["$push"]      = {"id_history" : newCustomId}
                }

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

                    if (taskResult.score.join() !== updatedTask.score.join()) {
                        logContent = logContent + '分值由 ' + taskResult.score.join() + ' 改为 ' + updatedTask.score.join() + ';\n'
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

exports.rating = function(req, res) {
    var id              = req.params.id,
        ratingContent   = {},
        hasRating       = false,
        logType         = '21';

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!req.body.rating) {
            res.send({ok : 1, msg : '没有评价'})
            return
        }

        ratingContent = {
            operator_id     : String(operator._id),
            updated_time    : new Date(),
            rating          : parseInt(req.body.rating, 10) || 0,
            content         : req.body.content,
        }

        taskModel.findById(id, function(err, taskResult) {
            taskResult = taskResult.toObject()

            taskResult.rating.forEach(function(item, index) {
                if (item.operator_id === String(operator._id)) {
                    taskResult.rating[index] = ratingContent
                    hasRating = true
                    logType = '22'
                }   
            })

            if (!hasRating) {
                taskResult.rating.push(ratingContent)
            }

            taskModel.findByIdAndUpdate(id, {rating : taskResult.rating}, function(err, updatedTask) {
                res.send({ok : 1})
                routeApp.createLogItem(String(operator._id), String(taskResult._id), logType)
            })
        })
    })
}

exports.ratingDelete = function(req, res) {
    var id              = req.params.id

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        taskModel.findById(id, function(err, taskResult) {
            taskResult = taskResult.toObject()

            taskResult.rating.forEach(function(item, index) {
                if (item.operator_id === String(operator._id)) {
                    taskResult.rating.splice(index, 1)
                }   
            })

            taskModel.findByIdAndUpdate(id, {rating : taskResult.rating}, function(err, updatedTask) {
                res.send({ok : 1})
                routeApp.createLogItem(String(operator._id), String(taskResult._id), '23')
            })
        })
    })
}

exports.check = function(req, res) {
    var custom_id       = parseInt(req.params.id),
        logType         = '21';

    var newReview   = {},
        data        = req.body,
        reviewKey   = '',
        isValide    = true,
        operator    = null,
        description = '';

    async.waterfall([
            function(callback) {
                if (!data.type) {
                    callback('异常，没有设置评价的类型')
                    return
                } 

                if (typeof reviewStandards[data.type] === 'undefined') {
                    callback('异常，评价类型不合法')
                    return
                }

                for (reviewKey in reviewStandards[data.type].standards) {
                    if (typeof data[reviewKey] === 'undefined' || isNaN(data[reviewKey])) {
                        isValide = false
                        break
                    } else {
                        data[reviewKey] = parseInt(data[reviewKey], 10)
                    }
                }

                if (!isValide) {
                    callback('不合法的表单')
                    return
                }

                if (!data.description) {
                    callback('必须添加描述')
                    return
                }

                callback(null)
            },
            function(callback) {
                routeApp.ownAuthority(req, function(hasAuth, current_operator) {
                    if (!hasAuth) {
                        callback('没有权限')
                        return
                    }
                    operator = current_operator
                    callback(null)
                })
            },
            function(callback) {
                taskModel.findOneTaskIncludeUser({custom_id : custom_id}, {}, {}, function(err, taskResult) {
                    var programmers = getProgrammerInTaskUsers(taskResult.users)
                    if (!(Array.isArray(programmers)) || programmers.length < 1) {
                        callback('没有可检视的开发人员')
                        return                        
                    }

                    callback(null, programmers)
                })
            },

            function(programmers, callback) {
                description = data.description
                reviewType  = data.type
                delete data.type
                delete data.description

                async.each(programmers, function(item, callback_i) {

                    var newReview = new reviewModel({
                        operator_id  : String(operator._id),
                        user_id      : String(item._id),
                        updated_time : new Date(),
                        created_time : new Date(),
                        type         : reviewType,
                        content      : data,
                        description  : description,
                    })

                    newReview.save(function(err, reviewResult) {
                        callback_i(null)
                    })
                },
                function(err) {
                    callback(err)
                })
            }
        ], 
        function(err, result) {
            if (err) {
                res.send({ok : 0, msg : err})
                return
            }

            res.send({ok : 1})
        }
    )

    function getProgrammerInTaskUsers(users) {
        return users.filter(function(user) {
            if (isProgrammer(user)) {
                return true
            }
        })
    }

    return

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        userModel.findById(userId, function(err, userResult) {
            if (err || !userResult) {
                res.send({ ok : 0, msg : '找不到该用户'})
                return
            }
            description = data.description
            reviewType  = data.type
            delete data.type
            delete data.description

            newReview = new reviewModel({
                operator_id  : String(operator._id),
                user_id      : userId,
                updated_time : new Date(),
                created_time : new Date(),
                type         : reviewType,
                content      : data,
                description  : description,
            })

            newReview.save(function(err, reviewResult) {
                res.send({ok : 1})
            })
        })
    })
}

exports.newCustomId = function(req, res) {
    counterModel.saveTaskId(function(err, newId) {
        res.send({ ok : 1, id : newId})
    })
}

function isProgrammer(user_doc) {
    if (user_doc.role.indexOf('Programmer') > -1) {
        return true
    } else {
        return false
    }
}
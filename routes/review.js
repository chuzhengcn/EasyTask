var routeApp        = require('./app'),
    userModel       = require('../model/user').user,
    statusModel     = require('../model/status').status,
    time            = require('../helper/time'),
    userRole        = require('../model/data').role,
    statusNames     = require('../model/data').statusNames, 
    bugStatus       = require('../model/data').bugStatus,
    ratingModel     = require('../model/data').rating,
    bugType         = require('../model/data').bugType, 
    logModel        = require('../model/log').log,
    taskModel       = require('../model/task').task,
    bugModel        = require('../model/bug').bug,
    view            = require('../helper/view'),
    reviewModel     = require('../model/review').review,
    reviewStandards = require('../model/data').review;

exports.index = function(req, res) {
    if (routeApp.isManager(req.ip)) {
        var filter = {active : {$nin : ['close']}, role : userRole[1]};

        userModel.find(filter, {}, {sort : {created_time : 1}}, function(err, userListResult) {
            res.render('review/index', 
                { 
                    title      : '选择成员' ,
                    users      : userListResult,
                }
            )
        })
    } else {
        userModel.findByIp(req.ip, function(err, userResult) {
            if (err || !userResult) {
                routeApp.errPage(req, res, '没有权限')
                return
            }

            res.redirect('/review/' + String(userResult._id) +'/new')
        })        
    }
}

exports.new = function(req, res) {
    var userId      = req.params.user_id,
        reviewGroup = {},
        filter      = {active : {$nin : ['close']}, role : userRole[1]};;
        
    userModel.findById(userId, function(err, userResult) {
        if (err || !userResult) {
            routeApp.err404(req, res)
            return
        }

        reviewModel.findAllIncludeUserByUserId(userId, function(err, reviewResults) {
            if (err || !userResult) {
                routeApp.err404(req, res)
                return
            }

            reviewResults.forEach(function(item, index) {
                item.updated_time = time.format_to_datetime(item.updated_time) 
                if (item.type in reviewGroup) {
                    reviewGroup[item.type].push(item)
                } else {
                    reviewGroup[item.type] = [item]
                }
            })

            userModel.find(filter, {}, {sort : {created_time : 1}}, function(err, programmerListResult) {
                res.render('review/new', 
                    { 
                        title           : '评价 ' + userResult.name ,
                        user            : userResult,
                        type2Standards  : reviewStandards.type2.standards,
                        type3Standards  : reviewStandards.type3.standards,
                        type4Standards  : reviewStandards.type4.standards,
                        type5Standards  : reviewStandards.type5.standards,
                        reviews         : reviewGroup,
                        programmers     : programmerListResult,
                    }
                )
            })
        })
    })
}

exports.create = function(req, res) {
    var userId      = req.params.user_id,
        newReview   = {},
        data        = req.body,
        reviewKey   = '',
        isValide    = true,
        reviewType  = '',
        description = '';

    if (!data.type) {
        res.send({ok : 0, msg : '异常，没有设置评价的类型'})
        return
    } 

    if (typeof reviewStandards[data.type] === 'undefined') {
        res.send({ok : 0, msg : '异常，评价类型不合法'})
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
        res.send({ok : 0, msg : '不合法的表单'})
        return
    }

    if (!data.description) {
        res.send({ok : 0, msg : '必须添加描述'})
        return
    }

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if ((String(operator._id) !== userId) && (!routeApp.isManager(req.ip))) {
            res.send({ ok : 0, msg : '只能自评或者主管评价'})
            return
        }

        userModel.findById(userId, function(err, userResult) {
            if (err || !userResult) {
                res.send({ ok : 0, msg : '找不到该用户'})
                return
            }
            description = data.description
            reviewType = data.type
            delete data.type
            delete data.description

            newReview = new reviewModel({
                operator_id  : String(operator._id),
                user_id      : userId,
                updated_time : new Date(),
                created_time : new Date(),
                type         : reviewType,
                description  : description,
                content      : data,
            })

            newReview.save(function(err, reviewResult) {
                res.send({ok : 1})
            })
        })
    })
}

exports.allAdd = function (req, res) {
    var type            = req.body.type,
        reviewGroup     = req.body.group
        isValide        = true,
        reviewKey       = '';

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        reviewGroup = reviewGroup.map(function(item, index) {
            item.operator_id    = String(operator._id)
            item.updated_time   = new Date()
            item.created_time   = new Date()
            item.type           = type

            for (reviewKey in item.content) {
                if (typeof item.content[reviewKey] === 'undefined' || isNaN(item.content[reviewKey])) {
                    isValide = false
                    break
                } else {
                    item.content[reviewKey] = parseInt(item.content[reviewKey], 10)
                }
            }

            return item
        })

        if (!isValide) {
            res.send({ok : 0, msg : '不合法的表单'})
            return
        }

        reviewModel.create(reviewGroup, function(err) {
            res.send({ok : 1})
        })
    })
}

exports.edit = function(req, res) {
    var userId          = req.params.user_id,
        id              = req.params.id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if ((String(operator._id) !== userId) && (!routeApp.isManager(req.ip))) {
            routeApp.errPage(req, res, '只能查看自己的分数')
            return
        }

        if (!routeApp.isLogin(req)) {
            routeApp.errPage(req, res, '必须登录后查看')
            return
        }

        userModel.findById(userId, function(err, userResult) {
            if (err || !userResult) {
                routeApp.errPage(req, res, '用户不存在')
                return
            }

            reviewModel.findById(id, function(err, reviewResult) {
                if (err || !userResult) {
                    routeApp.errPage(req, res, '用户不存在')
                    return
                }
                res.render('review/edit', {
                    user            : userResult,
                    review          : reviewResult,
                    reviewTemplate  : reviewStandards,
                })
            })
        })
    })
}

exports.delete = function(req, res) {
    var userId = req.params.user_id,
        id     = req.params.id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!routeApp.isManager(req.ip)) {
            res.send({ ok : 0, msg : '只有主管才能删除'})
            return
        }

        if (!routeApp.isLogin(req)) {
            res.send({ ok : 0, msg : '没有登录'})
            return
        } 

        reviewModel.findByIdAndRemove(id, function(err) {
            if (err) {
                res.send({ok : 0, msg : '找不到要删除的评价'})
                return
            }

            res.send({ok : 1})
        })
    })
}

exports.update = function(req, res) {
    var userId          = req.params.user_id,
        id              = req.params.id,
        updateReview    = {},
        data            = req.body,
        reviewKey       = '',
        isValide        = true,
        reviewType      = '',
        description     = '';

    if (!data.type) {
        res.send({ok : 0, msg : '异常，没有设置评价的类型'})
        return
    } 

    if (typeof reviewStandards[data.type] === 'undefined') {
        res.send({ok : 0, msg : '异常，评价类型不合法'})
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
        res.send({ok : 0, msg : '不合法的表单'})
        return
    }

    if (!data.description) {
        res.send({ok : 0, msg : '必须添加描述'})
        return
    }

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if (!routeApp.isManager(req.ip)) {
            res.send({ ok : 0, msg : '只有主管才能修改'})
            return
        }

        if (!routeApp.isLogin(req)) {
            res.send({ ok : 0, msg : '没有登录'})
            return
        } 

        userModel.findById(userId, function(err, userResult) {
            if (err || !userResult) {
                res.send({ ok : 0, msg : '找不到该用户'})
                return
            }

            description = data.description
            delete data.type
            delete data.description

            updateReview = {
                operator_id  : String(operator._id),
                updated_time : new Date(),
                content      : data,
                description  : description
            }

            reviewModel.findByIdAndUpdate(id, updateReview, function(err, reviewResult) {
                if (err || !reviewResult) {
                    res.send({ok : 0, msg : '找不到更新的评价'})
                    return
                }

                res.send({ok : 1, review : reviewResult})
            })
        })
    })
}

exports.codeReviewIndex = function(req, res) {
    var filter = {active : {$nin : ['close']}, role : userRole[1] };

    userModel.find(filter, {}, {sort : {created_time : 1}}, function(err, userListResult) {
        res.render('review/code-review', 
            { 
                title      : '选择程序员' ,
                users      : userListResult,
            }
        )
    })
}

exports.newCodeReview = function(req, res) {
    var userId      = req.params.user_id,
        reviewGroup = {};

    userModel.findById(userId, function(err, userResult) {
        if (err || !userResult) {
            routeApp.err404(req, res)
            return
        }

        reviewModel.findAllIncludeUserByUserId(userId, function(err, reviewResults) {
            if (err || !userResult) {
                routeApp.err404(req, res)
                return
            }

            reviewResults.forEach(function(item, index) {
                item.updated_time = time.format_to_datetime(item.updated_time) 
                if (item.type in reviewGroup) {
                    reviewGroup[item.type].push(item)
                } else {
                    reviewGroup[item.type] = [item]
                }
            })

            res.render('review/code-review-new', 
                { 
                    title           : '检视 ' + userResult.name ,
                    user            : userResult,
                    type1Standards  : reviewStandards.type1.standards,
                    codeReviews     : reviewGroup.type1 || [],
                }
            )
        })
    })
}

exports.addCodeReview = function(req, res) {
    var userId      = req.params.user_id,
        newReview   = {},
        data        = req.body,
        reviewKey   = '',
        isValide    = true,
        reviewType  = '',
        description = '';

    if (!data.type) {
        res.send({ok : 0, msg : '异常，没有设置评价的类型'})
        return
    } 

    if (typeof reviewStandards[data.type] === 'undefined') {
        res.send({ok : 0, msg : '异常，评价类型不合法'})
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
        res.send({ok : 0, msg : '不合法的表单'})
        return
    }

    if (!data.description) {
        res.send({ok : 0, msg : '必须添加描述'})
        return
    }

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

exports.editCodeReview = function(req, res) {
    var userId          = req.params.user_id,
        id              = req.params.id;

    userModel.findById(userId, function(err, userResult) {
        if (err || !userResult) {
            routeApp.errPage(req, res, '用户不存在')
            return
        }

        reviewModel.findById(id, function(err, reviewResult) {
            if (err || !userResult) {
                routeApp.errPage(req, res, '用户不存在')
                return
            }
            res.render('review/code-review-edit', {
                user            : userResult,
                review          : reviewResult,
                reviewTemplate  : reviewStandards,
            })
        })
    })
}

exports.updateCodeReview = function(req, res) {
    var userId          = req.params.user_id,
        id              = req.params.id,
        updateReview    = {},
        data            = req.body,
        reviewKey       = '',
        isValide        = true,
        reviewType      = '',
        description     = '';

    if (!data.type) {
        res.send({ok : 0, msg : '异常，没有设置评价的类型'})
        return
    } 

    if (typeof reviewStandards[data.type] === 'undefined') {
        res.send({ok : 0, msg : '异常，评价类型不合法'})
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
        res.send({ok : 0, msg : '不合法的表单'})
        return
    }

    if (!data.description) {
        res.send({ok : 0, msg : '必须添加描述'})
        return
    }

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
            delete data.type
            delete data.description

            updateReview = {
                operator_id  : String(operator._id),
                updated_time : new Date(),
                content      : data,
                description  : description,
            }

            reviewModel.findById(id, function(err, originReview) {
                if (originReview.operator_id !== String(operator._id)) {
                    res.send({ ok : 0, msg : '只能由创建人编辑'})
                    return
                }

                reviewModel.findByIdAndUpdate(id, updateReview, function(err, reviewResult) {
                    if (err || !reviewResult) {
                        res.send({ok : 0, msg : '找不到更新的检视'})
                        return
                    }

                    res.send({ok : 1, review : reviewResult})
                })
            })
        })
    })
}

exports.deleteCodeReview = function(req, res) {
    var userId = req.params.user_id,
        id     = req.params.id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        reviewModel.findById(id, function(err, originReview) {
            if (originReview.operator_id !== String(operator._id)) {
                res.send({ ok : 0, msg : '只能由创建人删除'})
                return
            }

            reviewModel.findByIdAndRemove(id, function(err) {
                if (err) {
                    res.send({ok : 0, msg : '找不到要删除的检视'})
                    return
                }

                res.send({ok : 1})
            })
        })
    })
}

exports.caculate = function(req, res) {
    var userId              = req.params.user_id,
        beginTime           = time.parse_date(req.body.beginTime),
        endTime             = time.parse_date(req.body.endTime),
        standardsWorkLoad   = 0,
        excessWorkLoad      = 0,
        finalScore          = 0,
        scoreGroup          = [];

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        if ((String(operator._id) !== userId) && !routeApp.isManager(req.ip)) {
            res.send({ok : 0, msg : '只能计算自己的分数'})
            return
        }

        if (!(beginTime instanceof Date) || !(endTime instanceof Date) ) {
            res.send({ok : 0, msg : '不合法的日期格式'})
            return
        }

        beginTime = time.beginning_of_thisweek(beginTime)
        endTime   = time.end_of_thisweek(endTime)

        if (beginTime.getTime() >= endTime.getTime()) {
            res.send({ok : 0, msg : '结束日期必须晚于开始日期'})
            return
        }
        
        caculateWorkLoad(userId, beginTime, endTime, false, function(err, workloadResult) {
            scoreGroup.push({
                score : workloadResult.finalWorkLoadScore,
                name  : '工作量'
            })
            caculateRating(workloadResult.tasks, function(err, ratingResult) {
                scoreGroup.push({
                    score : ratingResult.finalRatingScore,
                    name  : '用户评分'
                })
                caculateTestBug(userId, beginTime, endTime, workloadResult.tasks, workloadResult.workLoadScore, function(err, testBugResult) {
                    scoreGroup.push({
                        score : testBugResult.finalTestBugScore,
                        name  : bugType[0]
                    })
                    caculateReleaseBug(userId, beginTime, endTime, workloadResult.workLoadScore, function(err, releaseBugResult) {
                        scoreGroup.push({
                            score : releaseBugResult.finalReleaseBugScore,
                            name  : bugType[1]
                        })
                        caculateReviewType1(userId, beginTime, endTime, function(err, reviewType1Result) {
                            for (var key1 in reviewType1Result) {
                                scoreGroup.push({
                                    score : reviewType1Result[key1],
                                    name  : reviewStandards.type1.standards[key1].name
                                })
                            }
                            caculateReviewType2(userId, beginTime, endTime, function(err, reviewType2Result) {
                                for (var key2 in reviewType2Result) {
                                    scoreGroup.push({
                                        score : reviewType2Result[key2],
                                        name  : reviewStandards.type2.standards[key2].name
                                    })
                                }
                                caculateReviewType3(userId, beginTime, endTime, function(err, reviewType3Result) {
                                    for (var key3 in reviewType3Result) {
                                        scoreGroup.push({
                                            score : reviewType3Result[key3],
                                            name  : reviewStandards.type3.standards[key3].name
                                        })
                                    }
                                    caculateReviewType4(userId, beginTime, endTime, function(err, reviewType4Result) {
                                        for (var key4 in reviewType4Result) {
                                            scoreGroup.push({
                                                score : reviewType4Result[key4],
                                                name  : reviewStandards.type4.standards[key4].name
                                            })
                                        }
                                        caculateReviewType5(userId, beginTime, endTime, function(err, reviewType5Result) {
                                            for (var key5 in reviewType5Result) {
                                                scoreGroup.push({
                                                    score : reviewType5Result[key5],
                                                    name  : reviewStandards.type5.standards[key5].name
                                                })
                                            }

                                            scoreGroup.forEach(function(item, index) {
                                                finalScore = item.score + finalScore 
                                            })

                                            res.send({ok : 1, scoreGroup : scoreGroup, finalScore : finalScore})
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

//工作量
function caculateWorkLoad(userId, beginTime, endTime, excessAdded, cb) {
    var tasks               = [],
        standardsWorkLoad   = 0,
        excessWorkLoad      = 0,
        workLoadScore       = 0,
        oneWeekTimeMs       = 7 * 24 * 60 * 60 * 1000
        weekNum             = (endTime.getTime() - beginTime.getTime()) / oneWeekTimeMs,
        standardstotal      = 0,
        finalWorkLoadScore  = 0,
        workLoadBaseRatio   = 30,
        result              = {},
        taskFilter          = {
            end_time        : {$lte : endTime, $gt : beginTime}, 
            status          : statusNames[statusNames.length-1],
            deleted         : false,
            users           : userId,
        };

    userModel.findById(userId, function(err, userResult) {
        standardsWorkLoad = userResult.week_work_load
        excessWorkLoad    = userResult.excess_work_load
        standardstotal    = weekNum * standardsWorkLoad

        taskModel.find(taskFilter, {}, {sort : {custom_id : -1}}, function(err, taskResults) {
            taskResults.forEach(function(item, index) {
                var thisTaskScore = item.score[item.users.indexOf(userId)]

                if (!thisTaskScore) {
                    thisTaskScore = 0
                }

                workLoadScore += thisTaskScore
            })

            if (excessAdded) {
                workLoadScore += excessWorkLoad
            }

            if (workLoadScore > standardstotal) {
                finalWorkLoadScore = workLoadBaseRatio
                // userModel.findByIdAndUpdate(userId, {excess_work_load : (workloadScore - standardstotal)}, function(){})
            } else {
                finalWorkLoadScore = Math.round((workLoadScore / standardstotal) * workLoadBaseRatio)
            }

            result = {
                finalWorkLoadScore : finalWorkLoadScore,
                tasks              : taskResults,
                workLoadScore      : workLoadScore,
                standardstotal     : standardstotal,
            }

            cb(null, result)
        })
    })
}

function caculateRating(tasks, cb) {
    var totalRating         = 0,
        finalRatingScore    = 0;

    if (tasks.length < 1 || !Array.isArray(tasks)) {
        return 0
    }

    tasks.forEach(function(item, index) {
        if (item.rating.length < 1) {
            totalRating += ratingModel[0].score
            return
        }

        var sum = 0
        item.rating.forEach(function(value, key) {
            sum += value.rating
        })

        totalRating += Math.round(sum / item.rating.length)
    })

    finalRatingScore = totalRating / Math.round(totalRating / tasks.length)

    cb(null, {finalRatingScore : finalRatingScore})
}

function caculateTestBug(userId, beginTime, endTime, tasks, workLoadScore, cb) {
    var testRefusedScore    = 400,
        baseRatio           = 10,
        finalTestBugScore   = 0,
        testBugScore        = 0,
        taskIds             = [],
        testBugFilter       = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            closed          : false, 
            assign_to       : userId, 
            type            : bugType[0]
        };

    tasks.forEach(function(item, index) {
        if (taskIds.indexOf(String(item._id)) === -1) {
            taskIds.push(String(item._id))
        }
    })

    statusModel.count({task_id : {$in : taskIds}, name : statusNames[6]}, function(err, num) {
        testBugScore += num * testRefusedScore

        bugModel.find(testBugFilter, function(err, testBugResults) {
            testBugResults.forEach(function(item, index) {
                if (!item.score) {
                    testBugScore += 0
                    return
                }

                testBugScore += item.score
            })

            finalTestBugScore = Math.round((1 - (testBugScore / workLoadScore)) * baseRatio)
            cb(null, {finalTestBugScore : finalTestBugScore})
        })
    })
}

function caculateReleaseBug(userId, beginTime, endTime, workLoadScore, cb) {
    var baseRatio               = 3,
        finalReleaseBugScore    = 0,
        releaseBugScore         = 0,
        releaseBugFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            closed          : false, 
            assign_to       : userId, 
            type            : bugType[1]
        };


    bugModel.find(releaseBugFilter, function(err, releaseBugResults) {
        releaseBugResults.forEach(function(item, index) {
            if (!item.score) {
                releaseBugScore += 0
                return
            }

            releaseBugScore += item.score
        })

        finalReleaseBugScore = Math.round((1 - (releaseBugScore / workLoadScore)) * baseRatio)
        cb(null, {finalReleaseBugScore : finalReleaseBugScore})
    })
}

function caculateReviewType1(userId, beginTime, endTime, cb) {
    var defaultScore        = 0,
        result              = {},
        reviewFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            type            : 'type1',
            user_id         : userId,
        };

    reviewModel.find(reviewFilter, function(err, reviewResults) {
        if (err || reviewResults.length < 1) {

            for (var code_standards_key in reviewStandards.type1.standards) {
                result[code_standards_key] = defaultScore
            }

            cb(null, result)
            return
        }

        reviewResults.forEach(function(item, index) {
            for (var key in item.content) {
                if (key in result) {
                    result[key] += item.content[key]
                } else {
                    result[key] = item.content[key]
                }
            }
        })

        for (var type1key in result) {
            result[type1key]  = Math.round(result[type1key] / reviewResults.length)
        }

        cb(null, result)
    })
}

function caculateReviewType2(userId, beginTime, endTime, cb) {
    var defaultScore        = 0,
        result              = {},
        reviewFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            type            : 'type2',
            user_id         : userId,
        };

    reviewModel.findOne(reviewFilter, {}, {sort : {updated_time : -1}}, function(err, reviewResult) {
        if (err || !reviewResult) {
            for (var code_standards_key in reviewStandards.type2.standards) {
                result[code_standards_key] = defaultScore
            }
            cb(null, result)
            return
        }

        for (var key in reviewResult.content) {
            result[key] = item.content[key]
        }

        cb(null, result)
    })
}

function caculateReviewType3(userId, beginTime, endTime, cb) {
    var defaultScore        = 0,
        result              = {},
        reviewFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            type            : 'type3',
            user_id         : userId,
        };

    reviewModel.find(reviewFilter, function(err, reviewResults) {
        if (err || reviewResults.length < 1) {

            for (var code_standards_key in reviewStandards.type3.standards) {
                result[code_standards_key] = defaultScore
            }
            cb(null, result)

            return
        }

        reviewResults.forEach(function(item, index) {
            for (var key in item.content) {
                if (key in result) {
                    result[key] += item.content[key]
                } else {
                    result[key] = item.content[key]
                }
            }
        })

        for (var type3key in result) {
            result[type3key]  = Math.round(result[type3key] / reviewResults.length)
        }

        cb(null, result)
    })
}

function caculateReviewType4(userId, beginTime, endTime, cb) {
    var defaultScore        = 5,
        badScore            = 0,
        result              = {},
        reviewFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            type            : 'type4',
            user_id         : userId,
        };

    reviewModel.count(reviewFilter, function(err, num) {
        if (err || num < 1) {

            for (var code_standards_key in reviewStandards.type4.standards) {
                result[code_standards_key] = defaultScore
            }

            cb(null, result)

            return
        }

        for (var code_standards_key in reviewStandards.type4.standards) {
            result[code_standards_key] = badScore
        }

        cb(null, result)
    })
}

function caculateReviewType5(userId, beginTime, endTime, cb) {
    var defaultScore        = 0,
        result              = {},
        reviewFilter        = {
            created_time    : {$lte : endTime, $gt : beginTime}, 
            type            : 'type5',
            user_id         : userId,
        };

    reviewModel.find(reviewFilter, function(err, reviewResults) {
        if (err || reviewResults.length < 1) {

            for (var code_standards_key in reviewStandards.type5.standards) {
                result[code_standards_key] = defaultScore
            }

            cb(null, result)
            return
        }

        reviewResults.forEach(function(item, index) {
            for (var key in item.content) {
                if (key in result) {
                    result[key] += item.content[key]
                } else {
                    result[key] = item.content[key]
                }
            }
        })

        for (var type5key in result) {
            result[type5key]  = Math.round(result[type1key] / reviewResults.length)
        }

        cb(null, result)
    })
}
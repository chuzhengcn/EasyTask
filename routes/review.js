var routeApp        = require('./app'),
    userModel       = require('../model/user').user,
    time            = require('../helper/time'),
    userRole        = require('../model/data').role,
    statusModel     = require('../model/data').statusNames, 
    bugStatus       = require('../model/data').bugStatus,   
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

            res.render('review/new', 
                { 
                    title           : '评价 ' + userResult.name ,
                    user            : userResult,
                    type2Standards  : reviewStandards.type2.standards,
                    type3Standards  : reviewStandards.type3.standards,
                    type4Standards  : reviewStandards.type4.standards,
                    type5Standards  : reviewStandards.type5.standards,
                    reviews         : reviewGroup,
                }
            )
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

exports.caculate = function(req, res) {
    var userId      = req.params.user_id,
        beginTime   = time.parse_date(req.body.beginTime),
        endTime     = time.parse_date(req.body.endTime);

    if (!(beginTime instanceof Date) || !(endTime instanceof Date) ) {
        res.send({ok : 0, msg : '不合法的日期格式'})
        return
    }

    beginTime = time.beginning_of_day(beginTime)
    endTime   = time.end_of_day(endTime)

    if (beginTime.getTime() <= endTime.getTime()) {
        res.send({ok : 0, msg : '结束日期必须晚于开始日期'})
        return
    }

     

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }
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
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
    var filter = {active : {$nin : ['close']}, role : {$in : userRole.slice(0, 3)}};

    userModel.find(filter, {}, {sort : {created_time : 1}}, function(err, userListResult) {
        res.render('review/index', 
            { 
                title      : '选择成员' ,
                users      : userListResult,
            }
        )
    })
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
                    type1Standards  : reviewStandards.type1.standards,
                    type2Standards  : reviewStandards.type2.standards,
                    type3Standards  : reviewStandards.type3.standards,
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
        reviewType  = '';

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

            reviewType = data.type
            delete data.type

            newReview = new reviewModel({
                operator_id  : String(operator._id),
                user_id      : userId,
                updated_time : new Date(),
                created_time : new Date(),
                type         : reviewType,
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
}

exports.delete = function(req, res) {
    var userId = req.params.user_id,
        id     = req.params.id;

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ ok : 0, msg : '没有权限'})
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
        reviewType      = '';

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

            delete data.type

            updateReview = {
                operator_id  : String(operator._id),
                updated_time : new Date(),
                content      : data,
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
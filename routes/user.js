var user_coll       = require('../db/user')
var log_coll        = require('../db/log')
var fs              = require('fs')
var avatarLocalDir  = __dirname + '/../public/attachments/avatar/'
var upload          = require('./upload')
var routeApp        = require('./app')
var time_helper     = require('../helper/time')


exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        user_coll.findAll(function(err, userListResult) {
            res.render('user/index', 
                { 
                    title      : '用户列表' ,
                    users      : userListResult,
                    me         : loginUser
                }
            )
        })
    }) 
}

exports.create = function(req, res) {
    user_coll.create({
        name            : req.body.name,
        ip              : req.body.ip,
        role            : req.body.role,
        avatar_url      : req.body.avatar_url,
        created_time    : new Date()
    }, function(err, result) {
        if (err) {
            res.send({ ok : 0, msg : '数据库错误' })
            return
        }

        res.send({ ok : 1 })
    })
}

exports.show = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        var user_id = req.params.id

        user_coll.findById(user_id, function(err, userInfoResult) {
            if (!userInfoResult) {
                routeApp.err404(req, res)
                return
            }

            log_coll.findByOperatorIdIncludeTask(user_id, 0, 50, function(err, logResults) {
                var log_grouped_arry = []
                var date_arry        = []
                if (logResults) {
                    logResults.forEach(function(item, index, array) {
                        var log_date 

                        if (time_helper.is_today(item.created_time)) {
                            log_date = '今天'
                        } else {
                            log_date = time_helper.format_to_date(item.created_time)
                        }

                        var date_index = date_arry.indexOf(log_date)

                        if (date_index == -1) {
                            date_arry.push(log_date)
                            log_grouped_arry.push({ date : log_date, content : [time_helper.format_specify_field(item, {created_time : 'time'})]})
                        } else {
                            log_grouped_arry[date_index].content.push(time_helper.format_specify_field(item, {created_time : 'time'}))
                        }
                    })
                }
                res.render('user/info', 
                    { 
                        title   : userInfoResult.name,
                        user    : userInfoResult,
                        me      : loginUser,
                        logs    : log_grouped_arry,
                    }
                )
            })
        })
    })
}

exports.update = function(req, res) {
    user_coll.updateById(req.params.id, 
        {
            name            : req.body.name,
            ip              : req.body.ip,
            role            : req.body.role,
            avatar_url      : req.body.avatar_url,
            modify_time     : new Date()
        },
        function(err, userInfoResult) {
            res.send({ ok : 1 })
        }
    ) 
}

exports.active = function(req, res) {
    var active_option = {}
    if (req.body.active == 'open') {
        active_option = {active : 'open'}
    } else {
        active_option = {active : 'close'}
    }

    user_coll.updateById(req.params.id, active_option, function(err, userInfoResult) {
        res.send({ok : 1})
    })
}

exports.delete = function(req, res) {
    //delete avatar
    user_coll.findById(req.params.id, function(err, result) {
        var fileName = result.avatar_url.split('/')[result.avatar_url.split('/').length - 1]
        fs.exists(avatarLocalDir + fileName, function(exists) {
            if (exists) {
                fs.unlink(avatarLocalDir + fileName, function() {
                    deleteUserInfo(req, res) 
                })
            } else {
                deleteUserInfo(req, res)     
            }
            // delete user-info
            function deleteUserInfo(req, res) {
                user_coll.removeById(req.params.id, function(err, result) {
                    res.send({ ok : 1 })
                })
            }
        })
    })
}
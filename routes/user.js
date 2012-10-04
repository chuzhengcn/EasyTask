var user_coll       = require('../db/user')
var fs              = require('fs')
var avatarLocalDir  = __dirname + '/../public/attachments/avatar/'
var upload          = require('./upload')
var routeApp        = require('./app')

exports.list = function(req, res) {
    routeApp.identifying(req, function(user) {
        user_coll.findAll(function(err, userListResult) {
            res.render('user/index', 
                { 
                    title   : '用户列表' ,
                    users   : userListResult,
                    user    : user
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
    user_coll.findById(req.params.id, function(err, userInfoResult) {
        res.render('user/info', 
            { 
                title   : userInfoResult.name ,
                user    : userInfoResult
            }
        )
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

exports.delete = function(req, res) {
    //delete avatar
    user_coll.findById(req.params.id, function(err, result) {
        var fileName = result.avatar_url.split('/')[result.avatar_url.split('/').length - 1]
        fs.exists(avatarLocalDir + fileName, function(exists) {
            if (exists) {
                fs.unlink(avatarLocalDir + fileName, function () {
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
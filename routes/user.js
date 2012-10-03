var user_coll = require('../db/user')

exports.list = function(req, res) {
    user_coll.findAll(function(err, userListResult) {
        res.render('user/index', 
            { 
                title   : '用户列表' ,
                users   : userListResult
            }
        )
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
    user_coll.findById(req.params.id, function(err, userInfoResult) {
        res.render('user/info', 
            { 
                title   : userInfoResult.name ,
                user    : userInfoResult
            }
        )
    }) 
}

exports.delete = function(req, res) {
    user_coll.removeById(req.params.id, function(err, result) {
        res.send({ ok : 1 })
    })
}
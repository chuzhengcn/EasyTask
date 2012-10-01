var user_coll = require('../db/user')

exports.list = function(req, res) {
    res.render('user/index', { title: '用户列表' })
}

exports.create = function(req, res) {
    user_coll.create({
        name            : req.body.name,
        ip              : req.body.ip,
        role            : req.body.role,
        created_time    : new Date()
    }, function(err, result) {
        if (err) {
            res.send({ ok : 0, msg : '数据库错误' })
            return
        }

        res.send({ ok : 1 })
    })
}
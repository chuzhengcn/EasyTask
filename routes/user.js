var user_coll       = require('../db/user')
var log_coll        = require('../db/log')

var fs              = require('fs'),
    avatarLocalDir  = __dirname + '/../public/attachments/avatar/',
    upload          = require('./upload'),
    routeApp        = require('./app'),
    userModel       = require('../model/user').user,
    time            = require('../helper/time'),
    userRole        = require('../model/data').role,
    logModel        = require('../model/log').log,
    taskModel       = require('../model/task').task,
    view            = require('../helper/view');

exports.info = function(req, res) {
    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ok : 0, msg : 'no user'})
            return
        }

        userModel.findByIp(req.ip, function(err, user) {
            if (err) {
                res.send({ok : 0, msg : 'db error'})
                return
            }

            if (!user) {
                res.send({ok : 0, msg : 'no user'})
                return
            }

            res.send({ok : 1, result : user})
        })
    })
    
}


exports.list = function(req, res) {
    userModel.find({}, {}, {sort : {active : 1, role : 1, created_time : 1}}, function(err, userListResult) {
        res.render('user/index', 
            { 
                title      : '用户列表' ,
                users      : userListResult,
                roles      : userRole,
            }
        )
    })
}

exports.create = function(req, res) {
    var data = req.body,
        role = [];

    if (!data.name || !data.ip) {
        res.send({ok : 0, msg: "不合法"})
        return
    }

    if (data.role) {
        if (Array.isArray(data.role)) {
            role = data.role
        } else {
            role = [data.role]
        }
    }

    var newUser = new userModel({
        name            : data.name, 
        ip              : data.ip,
        role            : role,
        password        : req.body.password || '1234554321',
        avatar_url      : req.body.avatar_url,
        updated_time    : new Date(),
        created_time    : new Date(),
    })

    newUser.save(function(err, userResult) {
        if (err) {
            res.send({ ok : 0, msg : '数据库错误' })
            return
        }

        res.send({ ok : 1 })
    })
}

exports.show = function(req, res) {
    var id          = req.params.id,
        logGroup    = {};

    userModel.findById(id, function(err, userResult) {
        if (!userResult) {
            routeApp.err404(req, res)
            return
        }

        logModel.findLogIncludeTaskByUserId(id, 20, function(err, logResults) {

            logResults.forEach(function(item, index) {
                var date = time.format_to_date(item.created_time).split(' ')[0]
                item.created_time = time.format_to_time(item.created_time)
                if (date in logGroup) {
                    logGroup[date].push(item)
                } else {
                    logGroup[date] = [item]
                }
            })

            res.render('user/info', 
                { 
                    title   : userResult.name,
                    user    : userResult,
                    logs    : logGroup,
                    roles   : userRole,
                }
            )
        })
    })
}

exports.update = function(req, res) {
    var id          = req.params.id,
        updateDoc   = {},
        role        = [];

    routeApp.ownAuthority(req, function(hasAuth, operator) {
        if (!hasAuth) {
            res.send({ok : 0, msg : 'no user'})
            return
        }

        if (!req.body.name || !req.body.ip) {
            res.send({ok : 0, msg: "不合法"})
            return
        }

        if (req.body.role) {
            if (Array.isArray(req.body.role)) {
                role = req.body.role
            } else {
                role = [req.body.role]
            }
        }

        updateDoc = {
            name            : req.body.name,
            ip              : req.body.ip,
            role            : role,
            avatar_url      : req.body.avatar_url,
            updated_time    : new Date(),
        }

        userModel.findByIdAndUpdate(id, updateDoc, function(err, userResult) {
            res.send({ ok : 1 , user : userResult})
        })
    })
}

exports.active = function(req, res) {
    var id          = req.params.id,
        updateDoc   = {};

    if (req.body.active == 'open') {
        updateDoc = {active : 'open'}
    } else {
        updateDoc = {active : 'close'}
    }

    userModel.findByIdAndUpdate(id, updateDoc, function(err, userResult) {
        res.send({ok : 1, user : userResult})
    })
}

exports.delete = function(req, res) {
    var id          = req.params.id
        fileName    = ''

    userModel.findById(id, function(err, userResult) {
        fileName = userResult.avatar_url.split('/')[userResult.avatar_url.split('/').length - 1]

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
                userModel.findByIdAndRemove(id, function(err) {
                    res.send({ ok : 1 })
                })
            }
        })
    })
}
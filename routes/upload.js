var fs              = require('fs')
var file_coll       = require('../db/file')
var routeApp        = require('./app')


var avatarLocalDir  = __dirname + '/../public/attachments/avatar/'
var avatarServerDir = '/attachments/avatar/'

exports.createAvatar = function(req, res) {
    var fileName        = Date.now() + Math.floor(Math.random()*100) + '.' + req.files.avatar.type.split('/')[1]

    fs.rename(req.files.avatar.path, avatarLocalDir + fileName, function() {
        res.send({ ok : 1, url : avatarServerDir + fileName })
    })
}

exports.updateAvatar = function(req, res) {
    var fileName        = req.params.file_name

    fs.exists(avatarLocalDir + fileName, function(exists) {
        if (exists) {
            fs.unlink(avatarLocalDir + fileName, function () {
                fs.rename(req.files.avatar.path, avatarLocalDir + fileName, function() {
                    res.send({ ok : 1, url : avatarServerDir + fileName })
                })
            })
        }
    }) 
}

exports.deleteAvatar = function(req, res) {
    var fileName        = req.params.file_name

    fs.exists(avatarLocalDir + fileName, function(exists) {
        if (exists) {
            fs.unlink(avatarLocalDir + fileName, function () {
                res.send({ ok : 1 })
            })
        }
    }) 
}

exports.createTaskFiles = function(req, res) {
    routeApp.ownAuthority(req, function(isOwn, operator) {
        if (!isOwn) {
            res.send({ ok : 0, msg : '没有权限'})
            return
        }

        var taskId              = req.params.task_id
        var taskFileLocalDir    = __dirname + '/../public/attachments/task/' + taskId + '/'
        var taskFileServerDir   = '/attachments/task/' + taskId + '/'
        var savedFiles          = []

        fs.exists(taskFileLocalDir, function(exists) {
            if (!exists) {
                fs.mkdir(taskFileLocalDir, function() {
                    saveFiles(req, res)
                })
            } else {
                saveFiles(req, res)
            }
        })

        function saveFiles(req, res) {
            var files = req.files.task_files
            if (Array.isArray(files)) {
                var filesNum = files.length
                files.forEach(function(item, index, array) {
                    saveToDiskAndDb(item, res)
                })
            } else {
                var filesNum = 1
                saveToDiskAndDb(files, res)
            }

            function saveToDiskAndDb(file, res) {
                var type = file.type
                var name = file.name
                var size = file.size
                fs.exists(taskFileLocalDir + name , function(exists) {
                    if(exists) {
                        name = Date.now() + name 
                    }

                    fs.rename(file.path, taskFileLocalDir + name, function() {
                        file_coll.create({
                            name            : name,
                            type            : type,
                            size            : size,
                            url             : taskFileServerDir + name,
                            task_id         : taskId,
                            operator_name   : operator.name,
                            operator_id     : operator._id,
                            created_time    : new Date(),
                        }, function(err, fileResult) {
                            if (err) {
                                res.send({ ok : 0, msg : '数据库错误'})
                                return
                            }
                            savedFiles.push(fileResult[0])
                            filesNum = filesNum - 1
                            if (filesNum == 0) {
                                res.send({ ok : 1, files : savedFiles})
                            }
                        })
                    })
                })
            }
        }
    })  
}
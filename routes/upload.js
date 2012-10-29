var fs              = require('fs')
var file_coll       = require('../db/file')
var task_coll       = require('../db/task')
var routeApp        = require('./app')
var time            = require('../helper/time')


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

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        file_coll.findByTaskId(req.params.task_id, function(err, files) {
            task_coll.findById(req.params.task_id, function(err, task) {
                res.render('upload/index', 
                    { 
                        title   : '附件 -' + task.name , 
                        me      : loginUser, 
                        task    : task,
                        files   : time.format_specify_field(files,{created_time : 'datetime'}),
                    } 
                )
            })
        }) 
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
            var files
            //where file from due to editor use different res format
            if (req.files.task_files) {
                files = req.files.task_files
            } else if (req.files.imgFile) {
                files = req.files.imgFile
            } else {
                res.send({ ok : 0, msg: '没有上传文件' })
                return
            }
            
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
                        name = Date.now() + '-' + name 
                    }

                    fs.rename(file.path, taskFileLocalDir + name, function() {
                        file_coll.create({
                            name            : name,
                            type            : type,
                            size            : size,
                            url             : taskFileServerDir + name,
                            task_id         : taskId,
                            operator_id     : operator._id,
                            created_time    : new Date(),
                        }, function(err, fileResult) {
                            savedFiles.push(fileResult[0])
                            filesNum = filesNum - 1
                            if (filesNum == 0) {
                                if (err) {
                                    res.send({ ok : 0, msg : '数据库错误'})
                                    return
                                }

                                if (req.files.imgFile) {
                                    //editor plubin need this res format
                                    res.send({ error : 0, url : savedFiles[0].url })
                                } else {
                                    res.send({ ok : 1, files : savedFiles})
                                }

                                task_coll.findById(taskId, function(err, taskResult) {
                                    routeApp.createLogItem({ log_type : 12 }, operator, taskResult)
                                })
                            }
                        })
                    })
                })
            }
        }
    })  
}

exports.deleteTaskFiles = function (files, cb) {
    if (!files || typeof files !== 'object') {
        cb(false)
        return
    }

    var taskFileLocalDir = __dirname + '/../public/attachments/task/'

    var filesCount = 1

    if (Array.isArray(files)) {
        filesCount = files.length
        files.forEach(function(item, index, array) {
            removeFileCollRecordAndFile(item)
        })

        return
    }

    removeFileCollRecordAndFile(files)

    function removeFileCollRecordAndFile(file) {
        file_coll.removeById(file._id.toString(), function(err) {
            if (err) {
                cb(false)
                return
            }

            filesCount--

            if (filesCount == 0) {
                cb(true)
            }

            fs.exists(taskFileLocalDir + file.task_id + '/' + file.name, function(exists) {
                if (exists) {
                    fs.unlink(taskFileLocalDir + file.task_id + '/' + file.name, function() {
                        fs.readdir(taskFileLocalDir + file.task_id, function(err, files) {
                            if (files.length == 0) {
                                fs.rmdirSync(taskFileLocalDir + file.task_id)
                            }
                        })
                    })
                }
            })
        })
    }
}
var fs              = require('fs')
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
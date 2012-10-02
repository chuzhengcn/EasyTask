var fs          = require('fs')

exports.createAvatar = function(req, res) {
    var fileName        = Date.now() + Math.floor(Math.random()*100) + req.files.avatar.name
    var avatarServerDir = '/../public/attachments/avatar/'
    var avatarLocalDir  = __dirname + avatarServerDir

    fs.rename(req.files.avatar.path, avatarLocalDir + fileName, function() {
        console.log(req.files.avatar.path)
        console.log(avatarLocalDir + fileName)
        res.send({ ok : 1, url : avatarServerDir + fileName })
    })
}
var fs = require('fs')

exports.createAvatar = function(req, res) {
    var fileName        = Date.now() + Math.floor(Math.random()*100) + '.' + req.files.avatar.type.split('/')[1]
    var avatarServerDir = '/attachments/avatar/'
    var avatarLocalDir  = __dirname + '/../public/attachments/avatar/'

    fs.rename(req.files.avatar.path, avatarLocalDir + fileName, function() {
        res.send({ ok : 1, url : avatarServerDir + fileName })
    })
}
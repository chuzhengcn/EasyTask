exports.list = function(req, res) {
    res.render('user/index', { title: '用户列表' })
}

exports.create = function(req, res) {
    res.send("respond with a resource")
}
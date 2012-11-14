var routeApp        = require('./app')

exports.list = function(req, res) {
    routeApp.identifying(req, function(loginUser) {
        res.render('wiki/index', 
            { 
                title   : 'wiki列表', 
                me      : loginUser,
            } 
        )
    })
}
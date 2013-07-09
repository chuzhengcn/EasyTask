var routeApp        = require('./app'),
	userModel       = require('../model/user').user;

exports.checkLogin = function (req, res) {
	if (!req.session.login) {
		req.session = null
		res.send({ok : 0, msg : '没有登录'})
		return
	}

	if (req.session.login === true) {
		res.send({ok : 1})
		return
	}

	res.send({ok : 0, msg : '没有登录'})
}

// todo : 1.加密用户密码  2.在线状态存入数据库 
exports.enter = function (req, res) {
	var ip 			= req.ip,
		password	= req.body.password && req.body.password.trim();

	userModel.findOne({ip : ip, password : password}, function(err, userResult) {
		if (err || !userResult) {
			res.send({ok : 0, msg : "用户名或者密码错误"})
			return
		}

		req.session.login = true
		res.send({ok : 1})
	})
}

exports.logout = function(req, res) {
	req.session = null
	res.send({ok : 1, msg: '登出成功'})
}
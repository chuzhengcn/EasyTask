var db          = require('./config').db
var user_coll   = db.collection('user')

exports.create = function(user, cb) {
    user_coll.insert(user, cb)
}

exports.findAll = function(cb) {
    user_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    user_coll.findById(id, cb)
}

exports.findByIp = function(ip, cb) {
	// ip must be unique, todo：create method ensure ip must be unique
	user_coll.findOne({ip : ip}, cb)
}

exports.updateById = function(id, userDoc, cb) {
    user_coll.updateById(id, { $set : userDoc }, cb)
}

exports.removeById = function(id, cb) {
    user_coll.removeById(id, cb)
}

exports.findTaskUsers = function(userNameArray, cb) {
    user_coll.find({name : {$in : userNameArray}}).toArray(cb)
}
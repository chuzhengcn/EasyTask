var db          = require('./config').db
var user_coll   = db.collection('user')

exports.create = function(user, cb) {
    user_coll.insert(user, cb)
}

exports.findAll = function(cb) {
    user_coll.find().sort({ role : -1 }).toArray(cb)
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

exports.findTaskUsers = function(userArray, cb) {
    user_coll.find({_id : {$in : userArray}}).sort({ role : -1 }).toArray(cb)
}

exports.findByName = function(name, cb) {
    user_coll.findOne({ name : name } , cb)
}

exports.includeUsers = function(originArray, cb) {
    var userMap = {}
    user_coll.find().toArray(function(err, userResults) {
        userResults.forEach(function(item, index, array) {
            userMap[item._id] = item
        })
        
        var originArrayIncludeUser = originArray.map(function(item, index, array) {
            item.operator = userMap[item.operator_id]
            return item
        })
        cb(err, originArrayIncludeUser)
    })
}
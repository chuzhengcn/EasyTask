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

exports.removeById = function(id, cb) {
    user_coll.removeById(id, cb)
}
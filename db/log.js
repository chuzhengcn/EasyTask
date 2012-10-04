var db          = require('./config').db
var log_coll   = db.collection('log')

exports.create = function(log, cb) {
    log_coll.insert(log, cb)
}

exports.findAll = function(cb) {
    log_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    log_coll.findById(id, cb)
}

exports.findByTask = function(task_id, cb) {
    log_coll.find({task_id : task_id}).toArray(cb)
}
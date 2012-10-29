var db             = require('./config').db
var status_coll    = db.collection('status')
var user_coll      = require('./user')

exports.create = function(status, cb) {
    status_coll.insert(status, cb)
}

exports.findAll = function(cb) {
    status_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    status_coll.findById(id, cb)
}

exports.updateById = function(id, statusDoc, cb) {
    status_coll.updateById(id, { $set : statusDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    status_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, statusDoc, cb) {
    status_coll.findAndModify({ _id : status_coll.id(id) }, {}, { $set : statusDoc }, {new : true}, cb)
}

exports.findByTask = function(task_id, cb) {
    status_coll.find({ task_id : task_id}).sort({ created_time : -1 }).toArray(function(err, statusResults) {
        user_coll.includeUsers(statusResults, cb)
    })
}

exports.findLastStatusByTask = function(task_id, cb) {
    status_coll.find({ task_id : task_id}).sort({ created_time : -1 }).limit(1).toArray(function(err, statusResults) {
        user_coll.includeUsers(statusResults, cb)
    })
}
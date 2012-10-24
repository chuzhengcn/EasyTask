var db          = require('./config').db
var task_coll   = db.collection('task')

exports.create = function(task, cb) {
    task_coll.insert(task, {safe:true}, cb)
}

exports.findAll = function(filter, cb) {
    task_coll.find(filter).sort({status : 1, custom_id : -1, create_time : -1}).toArray(cb)
}

exports.findById = function(id, cb) {
    task_coll.findById(id, cb)
}

exports.updateById = function(id, taskDoc, cb) {
    task_coll.updateById(id, { $set : taskDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    task_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, taskDoc, cb) {
    task_coll.findAndModify({ _id : task_coll.id(id) }, {}, { $set : taskDoc}, {new : true}, cb)
}
var db          = require('./config').db
var file_coll   = db.collection('file')

exports.create = function(file, cb) {
    file_coll.insert(file, {safe:true}, cb)
}

exports.findAll = function(cb) {
    file_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    file_coll.findById(id, cb)
}

exports.updateById = function(id, fileDoc, cb) {
    file_coll.updateById(id, { $set : fileDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    file_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, fileDoc, cb) {
    file_coll.findAndModify({ _id : file_coll.id(id) }, {}, { $set : fileDoc}, {new : true}, cb)
}

exports.findByTaskIdInSummary = function(taskId,cb) {
    file_coll.find({ task_id : taskId}).sort({ created_time : -1 }).limit(4).toArray(cb)
}
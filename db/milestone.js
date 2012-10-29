var db              = require('./config').db
var milestone_coll  = db.collection('milestone')

exports.create = function(milestone, cb) {
    milestone_coll.insert(milestone, {safe:true}, cb)
}

exports.findAll = function(cb) {
    milestone_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    milestone_coll.findById(id, cb)
}

exports.updateById = function(id, milestoneDoc, cb) {
    milestone_coll.updateById(id, { $set : milestoneDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    milestone_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, milestoneDoc, cb) {
    milestone_coll.findAndModify({ _id : milestone_coll.id(id) }, {}, { $set : milestoneDoc}, {new : true}, cb)
}

exports.findByTaskId = function(taskId, cb) {
    milestone_coll.find({ task_id : taskId }).sort({ event_time : 1 }).toArray(cb)
}

exports.findNotExpiredByTaskId = function(taskId, cb) {
    milestone_coll.find({ task_id : taskId, event_time : { $gt : new Date()}}).sort({ event_time : 1 }).toArray(cb)
}
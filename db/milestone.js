var db              = require('./config').db
var milestone_coll  = db.collection('milestone')
var time            = require('../helper/time')

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

exports.removeByTask = function(task_id, cb) {
    milestone_coll.remove({task_id : task_id}, cb)
}

exports.findAndModifyById = function(id, milestoneDoc, cb) {
    milestone_coll.findAndModify({ _id : milestone_coll.id(id) }, {}, { $set : milestoneDoc}, {new : true}, cb)
}

exports.findByTaskId = function(taskId, cb) {
    milestone_coll.find({ task_id : taskId }).sort({ event_time : 1 }).toArray(cb)
}

exports.findNotExpiredByTaskId = function(taskId, cb) {
    milestone_coll.find({ task_id : taskId, event_time : { $gte : time.beginning_of_day(new Date()) }}).sort({ event_time : 1 }).toArray(cb)
}
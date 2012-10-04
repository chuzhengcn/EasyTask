var db          = require('./config').db
var counter_coll   = db.collection('counter')

exports.saveTaskId = function(cb) {
    counter_coll.findAndModify({ task_id : {$gt: 0}}, {}, {$inc : {task_id : 1}}, { new : true, upsert : true }, function(err, result) {
        cb(err, result.task_id)
    })
}
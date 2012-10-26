var db          = require('./config').db
var counter_coll   = db.collection('counter')

exports.saveTaskId = function(cb) {
    counter_coll.findAndModify({ task_id : {$gt: 0}}, {}, {$inc : {task_id : 1}}, { new : true, upsert : true }, function(err, result) {
        if (!result) {
            counter_coll.update({ task_id : {$exists : true}}, {$set : { task_id : 2000}}, {}, function(err, result) {
                cb(err, 2000)
            })

            return
        }
        cb(err, result.task_id)
    })
}

exports.saveCommentId = function(cb) {
    counter_coll.findAndModify({ comment_id : {$gt: 0}}, {}, {$inc : {comment_id : 1}}, { new : true, upsert : true }, function(err, result) {
        cb(err, result.comment_id)
    })
}
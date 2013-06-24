var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'counter';
    

var counterSchema = mongoose.Schema({
    task_id         : Number,
    comment_id      : Number,
},{ 
    collection: collectionName, 
})

counterSchema.statics.saveTaskId = function(cb) {
    this.findOneAndUpdate({ task_id : {$exists : true}}, {$inc : {task_id : 1}}, {upsert : true}, function(err, counterResult) {
        cb(err, counterResult.task_id)
    });
}

counterSchema.statics.saveCommentId = function(cb) {
    this.findOneAndUpdate({ comment_id : {$exists : true}}, {$inc : {comment_id : 1}}, {upsert : true}, function(err, counterResult) {
        cb(err, counterResult.comment_id)
    });
}

var Counter = mongoose.model(collectionName, counterSchema)

exports.counter = Counter

// test code

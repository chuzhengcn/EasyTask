var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    userModel       = require('./user').user,
    collectionName  = 'status';
    

var statusSchema = mongoose.Schema({
    name            : String,
    task_id         : String,
    content         : String,
    files           : Array,
    operator_id     : String,
    updated_time    : Date,
    created_time    : Date,
},{ 
    collection: collectionName, 
})

statusSchema.statics.findLatestStatusIncludeUserByTaskId = function(taskId, cb) {
    this.findOne({task_id : taskId}, {}, {sort : {created_time : -1}}, function(err, statusResult) {
        if (err) {
            cb(err)
            return
        }
        
        userModel.findById(statusResult.operator_id, function(err, userResult) {
            statusResult            = statusResult.toObject()
            statusResult.operator   = userResult 
            cb(err, statusResult)
        })
    });
}

var Status = mongoose.model(collectionName, statusSchema)

exports.status = Status

// test code
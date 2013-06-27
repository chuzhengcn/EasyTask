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

statusSchema.statics.findAllIncludeUserByTaskId = function(taskId, cb) {
    var userList = []

    this.find({task_id : String(taskId)}, {}, {sort : {created_time : -1}}, function(err, statusResults) {
        if (err) {
            cb(err)
            return
        }

        statusResults = statusResults.map(function(item, index) {
            if (userList.indexOf(item.operator_id) === -1) {
                userList.push(item.operator_id)
            }

            return item.toObject()
        })

        userList = userList.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : userList}}, function(err, userResults) {
            statusResults = statusResults.map(function(item, index) {
                userResults.forEach(function(value, key) {
                    if (item.operator_id === String(value._id)) {
                        item.operator = value
                    }
                })

                return item
            })

            cb(err, statusResults)
        })
    });
}

var Status = mongoose.model(collectionName, statusSchema)

exports.status = Status

// test code
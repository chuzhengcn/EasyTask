var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    userModel       = require('./user').user,
    collectionName  = 'log';
    

var logSchema = mongoose.Schema({
    log_type        : String,
    task_id         : String,
    content         : String,
    operator_id     : String,
    created_time    : Date,
},{ 
    collection: collectionName, 
})

logSchema.statics.findLogIncludeUserByTaskId = function(taskId, limitNum, cb) {
    var userList = []

    this.find({task_id : String(taskId)}, {}, {sort : {created_time : -1}, limit : limitNum}, function(err, logResults) {
        if (err) {
            cb(err)
            return
        }

        logResults = logResults.map(function(item, index) {
            if (userList.indexOf(item.operator_id) === -1) {
                userList.push(item.operator_id)
            }

            return item.toObject()
        })

        userList = userList.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : userList}}, function(err, userResults) {
            logResults = logResults.map(function(item, index) {
                userResults.forEach(function(value, key) {
                    if (item.operator_id === String(value._id)) {
                        item.operator = value
                    }
                })

                return item
            })

            cb(err, logResults)
        })
    });
}

var Log = mongoose.model(collectionName, logSchema)

exports.log = Log
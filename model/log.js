var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    userModel       = require('./user').user,
    taskModel       = require('./task').task,
    collectionName  = 'log';
    

var logSchema = mongoose.Schema({
    log_type        : String,
    task_id         : {type : String, index : true},
    content         : String,
    operator_id     : {type : String, index : true},
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

logSchema.statics.findLogIncludeTaskByUserId = function(userId, limitNum, cb) {
    var taskList = []

    this.find({operator_id : String(userId)}, {}, {sort : {created_time : -1}, limit : limitNum}, function(err, logResults) {
        if (err) {
            cb(err)
            return
        }

        logResults = logResults.map(function(item, index) {
            if (taskList.indexOf(item.task_id) === -1) {
                taskList.push(item.task_id)
            }

            return item.toObject()
        })

        taskList = taskList.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        taskModel.find({_id : {$in : taskList}}, function(err, taskrResults) {
            logResults = logResults.map(function(item, index) {
                taskrResults.forEach(function(value, key) {
                    if (item.task_id === String(value._id)) {
                        item.task = value
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
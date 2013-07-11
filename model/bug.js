var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'bug',
    userModel       = require('./user').user,
    taskModel       = require('./task').task,
    bugStatus       = require('./data').bugStatus;
    

var bugSchema = mongoose.Schema({
    name            : String,
    task_id         : {type : String, index : true},
    content         : String,
    operator_id     : {type : String, index : true},
    score           : Number,
    status          : {type : String, index : true},
    level           : String,
    type            : {type : String, index : true},
    comments        : Array,
    files           : Array,
    closed          : Boolean,
    updated_time    : Date,
    created_time    : Date,
    assign_to       : {type : String, index : true}
},{ 
    collection: collectionName, 
})

bugSchema.statics.findBugsIncludeUsersByTaskId = function(filter, cb) {
    var operators = []

    this.find(filter, {}, {sort : { created_time : -1}}, function(err, bugResults) {
        if (err) {
            cb('数据库错误')
            return
        }

        bugResults = bugResults.map(function(item, index) {
            item = item.toObject()

            if (operators.indexOf(item.operator_id) === -1 && item.operator_id) {
                operators.push(item.operator_id)
            }

            if (operators.indexOf(item.assign_to) === -1 && item.assign_to) {
                operators.push(item.assign_to)
            }

            return item

        })

        operators = operators.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : operators}}, function(err, users) {
            bugResults = bugResults.map(function (item, index) {
                users.forEach(function(value, key) {
                    if (item.operator_id === String(value._id)) {
                        item.operator = value
                    }

                    if (item.assign_to === String(value._id)) {
                        item.programmer = value
                    }
                })

                return item
            })


            cb(err, bugResults)
        })
    })
}

bugSchema.statics.findBugsIncludeTaskByAssignTo = function(bugFilter, cb) {
    var tasks       = [];

    if (!bugFilter) {
        cb(null, null)
        return
    }

    this.find(bugFilter, {}, {sort : { created_time : -1}}, function(err, bugResults) {
        if (err) {
            cb('数据库错误')
            return
        }

        bugResults = bugResults.map(function(item, index) {
            item = item.toObject()

            if (tasks.indexOf(item.task_id) === -1 && item.task_id) {
                tasks.push(item.task_id)
            }

            return item

        })

        tasks = tasks.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        taskModel.find({_id : {$in : tasks}}, function(err, taskResults) {
            bugResults = bugResults.map(function (item, index) {
                taskResults.forEach(function(value, key) {
                    if (item.task_id === String(value._id)) {
                        item.task = value
                    }
                })

                return item
            })

            cb(err, bugResults)
        })
    })
}

bugSchema.statics.findOneBugsIncludeUsersId = function(id, cb) {
    var operators = []

    this.findById(id, function(err, bugResult) {
        if (err) {
            cb('数据库错误')
            return
        }

        bugResult = bugResult.toObject()

        operators.push(bugResult.operator_id)

        if (bugResult.assign_to) {
            operators.push(bugResult.assign_to)
        }

        if (bugResult.comments.length > 0) {
            bugResult.comments.forEach(function(item, index) {
                operators.push(item.operator_id)
            })
        }

        operators = operators.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : operators}}, function(err, users) {
            users.forEach(function(value, key) {
                if (bugResult.operator_id === String(value._id)) {
                    bugResult.operator = value
                }

                if (bugResult.assign_to === String(value._id)) {
                    bugResult.programmer = value
                }

                if (bugResult.comments.length > 0) {
                    bugResult.comments.forEach(function(item, index) {
                        if (item.operator_id === String(value._id)) {
                            item.operator = value
                        }
                    })
                }
            })

            cb(err, bugResult)
        })
    })
}

var Bug = mongoose.model(collectionName, bugSchema)

exports.bug = Bug
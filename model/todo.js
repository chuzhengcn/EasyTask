var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    userModel       = require('./user').user,
    collectionName  = 'todo';
    

var todoSchema = mongoose.Schema({
    name            : String,
    task_id         : String,
    category        : String,
    content         : String,
    files           : Array,
    comments        : Array,
    complete        : Boolean,
    operator_id     : String,
    updated_time    : Date,
    created_time    : Date,
},{ 
    collection: collectionName, 
})

todoSchema.statics.findOneTodoIncludeUser = function(id, cb) {
    var operators = []

    this.findById(id, function(err, todoResult) {
        if (err) {
            cb('数据库错误')
            return
        }

        todoResult = todoResult.toObject()

        operators.push(todoResult.operator_id)

        if (todoResult.comments.length > 0) {
            todoResult.comments.forEach(function(item, index) {
                operators.push(item.operator_id)
            })
        }

        operators = operators.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : operators}}, function(err, users) {
            users.forEach(function(value, key) {
                if (todoResult.operator_id === String(value._id)) {
                    todoResult.operator = value
                }

                if (todoResult.comments.length > 0) {
                    todoResult.comments.forEach(function(item, index) {
                        if (item.operator_id === String(value._id)) {
                            item.operator = value
                        }
                    })
                }
            })

            cb(err, todoResult)
        })
    })
}

todoSchema.statics.findAllIncludeUserByTaskId = function(taskId, cb) {
    var userList = []

    this.find({task_id : String(taskId)}, {}, {sort : {created_time : -1}}, function(err, todoResults) {
        if (err) {
            cb(err)
            return
        }

        todoResults = todoResults.map(function(item, index) {
            if (userList.indexOf(item.operator_id) === -1) {
                userList.push(item.operator_id)
            }

            return item.toObject()
        })

        userList = userList.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : userList}}, function(err, userResults) {
            todoResults = todoResults.map(function(item, index) {
                userResults.forEach(function(value, key) {
                    if (item.operator_id === String(value._id)) {
                        item.operator = value
                    }
                })

                return item
            })

            cb(err, todoResults)
        })
    });
}

var Todo = mongoose.model(collectionName, todoSchema)

exports.todo = Todo

// test code
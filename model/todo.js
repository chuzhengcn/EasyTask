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

var Todo = mongoose.model(collectionName, todoSchema)

exports.todo = Todo

// test code
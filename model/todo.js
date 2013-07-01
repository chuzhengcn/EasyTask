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

var Todo = mongoose.model(collectionName, todoSchema)

exports.todo = Todo

// test code
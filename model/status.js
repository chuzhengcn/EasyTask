var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
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

var Status = mongoose.model(collectionName, statusSchema)

exports.status = Status

// test code
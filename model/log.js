var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
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

var Log = mongoose.model(collectionName, logSchema)

exports.log = Log
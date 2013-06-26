var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'file';

var fileSchema = mongoose.Schema({
    name            : String,
    type            : String,
    size            : Number,
    url             : String,
    task_id         : String,
    operator_id     : String,
    created_time    : Date,
},{
    collection : collectionName,
})

var File = mongoose.model(collectionName, fileSchema);

exports.file = File;

// test code
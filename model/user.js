var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'user';
    

var userSchema = mongoose.Schema({
    name            : String,
    ip              : String,
    role            : String,
    avatar_url      : String,
    active          : String,
    created_time    : Date,
},{ 
    collection: collectionName, 
})

userSchema.statics.findByIp = function (ip, cb) {
    this.findOne({ip : ip}, function(err, user) {
        cb(err, user)
    });
}

userSchema.statics.findActiveUsers = function (cb) {
    this.find({active : {$nin : ['close']}}, {}, {sort : {role : 1}}, function(err, users) {
        cb(err, users)
    });
}

var User = mongoose.model(collectionName, userSchema)

exports.user = User

// test code

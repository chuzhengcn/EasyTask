var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'user';
    

var userSchema = mongoose.Schema({
    name                : {type : String, index : true},
    ip                  : {type : String, index : true},
    role                : Array,
    avatar_url          : String,
    active              : String,
    updated_time        : Date,
    password            : String,
    created_time        : Date,
    week_work_load      : Number,
    excess_work_load    : Number,     
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

userSchema.statics.findUsersByIdGroup = function (ids, cb) {
    ids = ids.map(function(item, index) {
        return mongoose.Types.ObjectId(item)
    })

    this.find({_id : {$in : ids}}, {}, {}, function(err, users) {
        if (err || users.length < 1) {
            cb('no users')
            return
        }
        
        cb(err, users)
    });
}

var User = mongoose.model(collectionName, userSchema)

exports.user = User

// test code

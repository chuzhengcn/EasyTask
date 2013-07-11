var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'review',
    userModel       = require('./user').user;
    

var reviewSchema = mongoose.Schema({
    type            : {type : String, index : true},
    user_id         : {type : String, index : true},
    operator_id     : {type : String, index : true},
    updated_time    : Date,
    created_time    : Date,
    description     : String,
    content         : mongoose.Schema.Types.Mixed,
},{ 
    collection: collectionName, 
})

reviewSchema.statics.findAllIncludeUserByUserId = function(userId, cb) {
    var userList = []

    this.find({user_id : String(userId)}, {}, {sort : {created_time : -1}}, function(err, reviewResults) {
        if (err) {
            cb(err)
            return
        }

        reviewResults = reviewResults.map(function(item, index) {
            if (userList.indexOf(item.operator_id) === -1) {
                userList.push(item.operator_id)
            }

            return item.toObject()
        })

        userList = userList.map(function(item, index) {
            return mongoose.Types.ObjectId(item)
        })

        userModel.find({_id : {$in : userList}}, function(err, userResults) {
            reviewResults = reviewResults.map(function(item, index) {
                userResults.forEach(function(value, key) {
                    if (item.operator_id === String(value._id)) {
                        item.operator = value
                    }
                })

                return item
            })

            cb(err, reviewResults)
        })
    });
}

var Review = mongoose.model(collectionName, reviewSchema)

exports.review = Review

// test code
var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'bug',
    userModel       = require('./user').user;
    

var bugSchema = mongoose.Schema({
    name            : String,
    task_id         : String,
    content         : String,
    operator_id     : String,
    score           : Number,
    status          : String,
    level           : String,
    type            : String,
    comments        : Array,
    files           : Array,
    closed          : Boolean,
    updated_time    : Date,
    created_time    : Date,
    assign_to       : String,
},{ 
    collection: collectionName, 
})

bugSchema.statics.findOpenBugsIncludeUsersByTaskId = function(filter, cb) {
    var operators = []

    this.find(filter, {}, {sort : { created_time : -1}}, function(err, bugResults) {
        if (err) {
            cb('数据库错误')
            return
        }

        bugResults = bugResults.map(function(item, index) {
            item = item.toObject()

            if (operators.indexOf(item.operator_id) === -1) {
                operators.push(item.operator_id)
            }

            if (operators.indexOf(item.assign_to) === -1) {
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

var Bug = mongoose.model(collectionName, bugSchema)

exports.bug = Bug
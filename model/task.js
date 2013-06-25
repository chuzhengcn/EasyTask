var mongoose        = require('./config').mongoose,
    ObjectId        = mongoose.Schema.Types.ObjectId,
    collectionName  = 'task',
    userModel       = require('./user').user,
    milestoneModel  = require('./milestone').milestone,
    time            = require('../helper/time'),
    Emitter         = require('events').EventEmitter,
    statusNameModel = require('./data').statusNames;

var taskSchema = mongoose.Schema({
    name            : String,
    status          : String,
    branch          : String,
    custom_id       : Number,
    active          : Boolean,
    deleted         : Boolean,
    updated_time    : Date,
    created_time    : Date,
    users           : Array,
    score           : Number,
    projects        : Array,
},{
    collection : collectionName,
})

taskSchema.statics.findDeveloping = function(cb) {
    var filter = {
        active  : true,
        deleted : false,
        status  : {'$nin' : [statusNameModel[0]]},
    }

    this.find(filter, function(err, tasks) {
        cb(err, tasks)
    });
}

taskSchema.statics.findDevelopingIncludeUserAndMilestone = function(cb) {
    var filter              = {active : true, deleted : false, status : {'$nin' : [statusNameModel[0]]}},
        option              = {sort : {status : -1, custom_id : -1, create_time : -1}};   

    this.find(filter, {}, option, function(err, tasks) {
        if (err) {
            cb(err)
            return
        }

        tasks = tasks.map(function(item, index) {
            item = item.toObject()
            return item
        })

        includeUser(tasks, function(err, tasks) {
            includeNotExpireMilestone(tasks, function(err, tasks) {
                cb(err, tasks)
            })
        })
    });
}

taskSchema.statics.findArchivedIncludeUser = function (page, cb) {
    if (!page) {
        page = 1
    }

    var self                = this,
        filter              = {active : false, deleted : false},
        limit               = 20,
        option              = {sort : {custom_id : -1}, limit : limit, skip : (page-1)*limit};   

    this.find(filter, {}, option, function(err, tasks) {
        if (err) {
            cb(err)
            return
        }

        self.count(filter, function(err, num) {
            if (err) {
                cb(err)
                return
            }

            tasks = tasks.map(function(item, index) {
                item = item.toObject()
                return item
            })

            includeUser(tasks, function(err, tasks) {
                cb(err, tasks, num)
            })
        })
    });
}

taskSchema.statics.findOneTaskIncludeUser = function(conditions, fields, options, cb) {
    this.findOne(conditions, fields, options, function(err, task) {
        if (err) {
            cb(err)
            return
        }

        if (!task) {
            cb('没有此任务')
            return
        }

        task = task.toObject()

        includeUser([task], function(err, tasks) {
            cb(err, tasks[0])
        })
    });
}

var Task = mongoose.model(collectionName, taskSchema);

exports.task = Task;

// helper -----------------------------------------------------------------------------------
function includeUser(tasks, cb) {
    userModel.find(function(err, users) {
        if (err) {
            cb(err)
            return
        }

        tasks.forEach(function(taskItem) {
            var usersIdGroup = taskItem.users.map(function(userObjectIdItem) {
                return String(userObjectIdItem)
            })

            users.forEach(function(userItem) {
                var userIndex = usersIdGroup.indexOf(String(userItem._id))
                if (userIndex > -1) {
                    taskItem.users[userIndex] = userItem.toObject()
                }
            })
        })

        cb(null, tasks)
    })
}

function includeMilestone(tasks, cb) {
    var developingTaskIdGroup = tasks.map(function(taskItem) {
        taskItem.milestones = []
        return String(taskItem._id)
    })

    milestoneModel.find({task_id : {$in : developingTaskIdGroup}}, {}, {sort : {event_time : 1}}, function(err, milestones) {
        if (err) {
            cb(err)
            return
        }

        tasks.forEach(function(taskItem) {
            milestones.forEach(function(milestoneItem) {
                if (String(taskItem._id) === milestoneItem.task_id) {
                    taskItem.milestones.push(milestoneItem.toObject())
                }
            })
        })

        cb(null, tasks)
    })
}

function includeNotExpireMilestone(tasks, cb) {
    var developingTaskIdGroup = tasks.map(function(taskItem) {
        taskItem.milestones = []
        return String(taskItem._id)
    })

    milestoneModel.find({task_id : {$in : developingTaskIdGroup}, event_time : { $gte : time.beginning_of_day(new Date())}}, {}, {sort : {event_time : 1}}, function(err, milestones) {
        if (err) {
            cb(err)
            return
        }

        tasks.forEach(function(taskItem) {
            milestones.forEach(function(milestoneItem) {
                if (String(taskItem._id) === milestoneItem.task_id) {
                    taskItem.milestones.push(milestoneItem.toObject())
                }
            })
        })

        cb(null, tasks)
    })
}

// test code
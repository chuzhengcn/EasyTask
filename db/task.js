var db              = require('./config').db
var task_coll       = db.collection('task')
var milestone_model = require('./milestone')
var milestone_coll  = db.collection('milestone')
var user_model      = require('./user')
var user_coll       = db.collection('user')

exports.create = function(task, cb) {
    task_coll.insert(task, {safe:true}, cb)
}

exports.findAll = function(filter, cb) {
    if (filter.users) {
        filter.users = user_coll.id(filter.users)
        console.log(filter)
    }

    if (filter.branch) {
        filter.branch = new RegExp(filter.branch, 'i')
    }

    task_coll.find(filter).sort({status : 1, custom_id : -1, create_time : -1}).toArray(function(err, tasks) {
        if (tasks.length == 0) {
            cb(err,[])
            return
        }

        var i = tasks.length * 2
        tasks.forEach(function(item, index, array) {
            
            milestone_model.findByTaskId(item._id.toString(), function(err, milestones) {
                tasks[index].milestones = milestones
                i--
                checkComplete()
            })

            user_model.findTaskUsers(item.users, function(err, users) {
                tasks[index].users = users
                i--
                checkComplete()
            })
            
        })

        function checkComplete() {
            if (i==0) {
                cb(err, tasks)
            }
        }
    })
}

exports.findByUser = function(userId, cb) {
    task_coll.find({ users : task_coll.id(userId), active : true}).toArray(cb)
}

exports.findById = function(id, cb) {
    task_coll.findById(id, cb)
}

exports.updateById = function(id, taskDoc, cb) {
    task_coll.updateById(id, { $set : taskDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    task_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, taskDoc, cb) {
    task_coll.findAndModify({ _id : task_coll.id(id) }, {}, { $set : taskDoc}, {new : true}, cb)
}
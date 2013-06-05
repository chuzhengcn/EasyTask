var db              = require('./config').db
var task_coll       = db.collection('task')
var milestone_model = require('./milestone')
var milestone_coll  = db.collection('milestone')
var user_model      = require('./user')
var user_coll       = db.collection('user')
var db_coll         = require('../framework/collection')

function addUserInfoToTasks(tasks, users) {
    tasks.forEach(function(task_item, task_key) {
        users.forEach(function(user_item, user_key) {
            var user_index = task_item.users.indexOf(String(user_item._id))
            if (user_index > -1) {
                task_item.users[user_index] = user_item
            }
        })
    })
}

exports.create = function(task, cb) {
    task_coll.insert(task, {safe:true}, cb)
}

exports.findAll = function(filter, skipNum, limitNum, cb) {
    if (filter.users) {
        filter.users = user_coll.id(filter.users)
    }

    if (filter.branch) {
        filter.branch = new RegExp(filter.branch, 'i')
    }
    task_coll.find(filter).sort({status : -1, custom_id : -1, create_time : -1}).limit(limitNum).skip(skipNum).toArray(function(err, tasks) {
        if (!tasks || tasks.length == 0) {
            var i = 0
            checkComplete([])
            return
        }

        var i = tasks.length * 2
        tasks.forEach(function(item, index, array) {
            
            milestone_model.findNotExpiredByTaskId(item._id.toString(), function(err, milestones) {
                tasks[index].milestones = milestones
                i--
                checkComplete(tasks)
            })

            user_model.findTaskUsers(item.users, function(err, users) {
                tasks[index].users = users
                i--
                checkComplete(tasks)
            })
            
        })

        function checkComplete(tasksResult) {
            if (i==0) {
                task_coll.count(filter, function(err, number) {
                    cb(err, {list : tasksResult, total : number})
                })
                
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

exports.findAllDeveloping = function(cb) {
    var filter = {
        active : true,
        status : {'$nin' : ['需求提交','已发外网']},
    };
    task_coll.find(filter).sort({status : -1, custom_id : -1, create_time : -1}).toArray(function(err, tasks) {
        if (err) {
            cb(err)
            return
        }

        user_model.findAll(function(err, users) {

            addUserInfoToTasks(tasks, users)
            cb(err, tasks)
        })
    })
}

exports.task = new db_coll.mongo_coll(task_coll)
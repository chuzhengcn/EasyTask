var db              = require('../db/config').db,
    task_coll       = db.collection('task'),
    status_coll     = db.collection('status'),
    user_coll       = db.collection('user');

var taskModel       = require('../model/task').task,
    statusModel     = require('../model/status').status,
    userModel       = require('../model/user').user;
    
exports.changeCustomId = function (req, res) {
    task_coll.find().toArray(function(err, tasks) {
        tasks.forEach(function(item, index) {
            console.log(typeof item.custom_id)
            if (typeof item.custom_id === 'string') {
                item.custom_id = parseInt(item.custom_id, 10)
                task_coll.save(item, function(err, tasks){})
            }
        })
    })

    res.send({ok : 1})
}

function change_task() {
    task_coll.find().toArray(function(err, tasks) {
        tasks = tasks.map(function(item, index) {
            var users = item.users.map(function(value, key) {
                return String(value)
            })

            var score = users.map(function(value, key) {
                return 0
            })

            var new_task = {
                _id : item._id,
                name : item.name,
                status : item.status,
                branch : item.branch,
                custom_id : item.custom_id,
                active    : item.active,
                deleted   : false,
                updated_time : new Date(),
                created_time : item.created_time,
                score        : score,
                projects     : [],
                rating       : [],
                end_time     : new Date(),
                users        : users,
            }

            return new_task
        })

        taskModel.create(tasks, function(err, results) {
            console.log('ok')
        })
    })
}

function change_user() {
    user_coll.find().toArray(function(err, users) {
        users = users.map(function(item, index) {
            var role = [item.role]

            var new_user = {
                _id : item._id,
                name : item.name,
                ip : item.ip,
                avatar_url : item.avatar_url,
                role : item.role,
                active    : item.active || 'open',
                updated_time : new Date(),
                created_time : item.created_time,
                password        : '123456',
                week_work_load     : 90,
                excess_work_load       : 0,
            }

            return new_user
        })

        userModel.create(users, function(err, results) {
            console.log('ok')
        })
    })
}

function change_status() {
    status_coll.find().toArray(function(err, status) {
        status = status.map(function(item, index) {
            var operator_id = String(item.operator_id)

            var status_item = {
                _id : item._id,
                name : item.name,
                task_id : item.task_id,
                content : item.content,
                files : item.files,
                updated_time : new Date(),
                created_time : item.created_time,
                operator_id        : operator_id,
            }

            return status_item
        })

        statusModel.create(status, function(err, results) {
            console.log('ok')
        })
    })
}

change_status()
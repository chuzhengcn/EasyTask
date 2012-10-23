var db          = require('./config').db
var todo_coll   = db.collection('todo')
var user_coll   = require('./user')

exports.create = function(todo, cb) {
    todo_coll.insert(todo, {safe:true}, cb)
}

exports.findAll = function(cb) {
    todo_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    todo_coll.findById(id, cb)
}

exports.findByIdIncludeUser = function(id, cb) {
    todo_coll.findById(id, function(err, todoResult) {
        user_coll.includeUsers([todoResult], function(err, todoResultIncludeUser) {
            user_coll.includeUsers(todoResultIncludeUser[0].comments, function(err, commentsInlucdeUser) {
                todoResultIncludeUser[0].comments = commentsInlucdeUser.reverse()
                cb(err, todoResultIncludeUser[0])
            })
        })
    })
}

exports.updateById = function(id, todoDoc, cb) {
    todo_coll.updateById(id, { $set : todoDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    todo_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, todoDoc, cb) {
    if (todoDoc.comment) {
        var comment     = todoDoc.comment
        delete todoDoc.comment
        todo_coll.findAndModify({ _id : todo_coll.id(id) }, {}, { $set : todoDoc, $push: {comments : comment}}, {new : true}, cb)
    } else {
        todo_coll.findAndModify({ _id : todo_coll.id(id) }, {}, { $set : todoDoc}, {new : true}, cb)
    }
}

exports.findByTask = function(taskId, cb) {
    todo_coll.find({task_id : taskId}).sort({ created_time : -1 }).toArray(function(err, todoResults) {
        user_coll.includeUsers(todoResults, cb)
    })
}
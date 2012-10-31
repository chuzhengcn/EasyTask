var db          = require('./config').db
var log_coll   = db.collection('log')
var task_coll  = db.collection('task')

exports.logType = {
    createTask      : '新建任务',
    deleteTask      : '删除任务',
    archiveTask     : '把任务存档', 
    activeTask      : '重新激活任务',
    editTaskName    : '编辑任务名称', 
    editTaskUsers   : '编辑任务成员',
    addMilestone    : '添加任务时间点',
    deleteMilestone : '删除任务时间点',
    editMilestone   : '编辑任务时间点',
    setTaskBranch   : '编辑任务分支',
    setTaskStatus   : '修改任务状态',
    uploadTaskFile  : '上传文件',
    addTodo         : '添加待办事项', 
    completeTodo    : '标记待办事项已完成',
    reopenTodo      : '标记待办事项未完成',
    updateTodo      : '编辑待办事项内容',
    deleteTodo      : '删除了待办事项',
    addTodoComment  : '添加了待办事项评论',
    deleteStatus    : '删除了一条任务状态历史',
    deleteTaskFile  : '删除了文件',
}

exports.create = function(log, cb) {
    log_coll.insert(log, cb)
}

exports.findAll = function(cb) {
    log_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    log_coll.findById(id, cb)
}

exports.findByTask = function(task_id, cb) {
    log_coll.find({task_id : task_id}).toArray(cb)
}

exports.findByOperatorIdIncludeTask = function(operator_id, skip_num, limit_num, cb) {
    // var log_result  = []
    // var isAllFilled = false

    log_coll.find({operator_id : log_coll.id(operator_id)}).skip(skip_num).limit(limit_num).sort({created_time : -1}).toArray(function(err, logs) {

        // if (log.length == 0) {
            cb(err, logs)
            return
        // }

        // log.forEach(function(item, index, array) {
        //     task_coll.findById(item.task_id.toString(),{ name : 1, custom_id : 1}, function(err, taskResult) {
        //         item.task = taskResult
        //         log_result[index] = item

        //         isAllFilled = log_result.every(function(item, index, array) {
        //             if (item) {
        //                 return true
        //             }
        //         })

        //         if (log_result.length == log.length && isAllFilled) {
        //             cb(err, log_result)
        //             return
        //         }
        //     })
        // })
    })
}
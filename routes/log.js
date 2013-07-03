var routeApp        = require('./app'),
    taskModel       = require('../model/task').task,
    userModel       = require('../model/user').user,
    logModel        = require('../model/log').log,
    time            = require('../helper/time'),
    view            = require('../helper/view');

exports.listByTask = function(req, res) {
    var customId = parseInt(req.params.task_custom_id, 10),
        logGroup = {};

    taskModel.findOne({custom_id : customId}, function(err, taskResult) {
        logModel.findLogIncludeUserByTaskId(String(taskResult._id), 0, function(err, logResults) {
            logResults.forEach(function(item, index) {
                var date = time.format_to_date(item.created_time).split(' ')[0]
                item.created_time = time.format_to_time(item.created_time)
                if (date in logGroup) {
                    logGroup[date].push(item)
                } else {
                    logGroup[date] = [item]
                }
            })


            res.render('log/index', 
                { 
                    title           : '任务日志 - ' + taskResult.name, 
                    logs            : logGroup,
                    task            : taskResult,
                } 
            )
        })
    }) 
}
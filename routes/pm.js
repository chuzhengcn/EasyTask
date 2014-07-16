var taskModel       = require('../model/task').task,
    statusModel     = require('../model/status').status,
    milestoneModel  = require('../model/milestone').milestone;

exports.score = function (req, res) {
    var begin_str = new Date(Date.now() - 1000*60*60*24*91).toISOString().split("T")[0];
    var end_str = new Date().toISOString().split("T")[0];

    res.redirect("/pm_score_time?begin_date=" + begin_str + "&end_date=" + end_str)
}

exports.score_by_time = function(req, res) {
    var begin_date = req.query.begin_date;
    var end_date = req.query.end_date;
    var total_task = 0;
    var delay_task = 0;

    taskModel.find({end_time : {$gt : new Date(begin_date), $lt : new Date(end_date)}}, function(err, tasks) {
        if (err) {
            return res.send("出错了");
        }

        total_task = tasks.length;

        var id_group = tasks.map(function(item) {
            return item._id.toString()
        })

        statusModel.find({task_id : {$in : id_group}, name : '已发布外网'}, function(err, status_result) {
            var status_info = status_result.map(function(item) {
                return  {
                    time : item.created_time,
                    id : item.task_id
                }
            })

            milestoneModel.find({task_id : {$in : id_group}, name : '发外网'}, function(err, milestone_result) {
                milestone_result.forEach(function(mile_item) {
                    status_info.forEach(function(status_item) {
                        if (mile_item.task_id === status_item.id && (status_item.time.getTime() > mile_item.created_time.getTime() + 1000*60*60*24)) {
                            delay_task++
                        }
                    })
                })

                res.send({
                    "任务总数" : total_task,
                    "延迟任务数" : delay_task
                })
            })

        })
    })
}
var routeApp        = require('./app'),
    taskModel       = require('../model/task').task,
    time            = require('../helper/time'),
    view            = require('../helper/view'),
    projectModel    = require('../model/data').project;

exports.index = function(req, res) {
    var projects = {}

    taskModel.findDeveloping(function(err, taskResults) {
        if (err) {
            routeApp.errPage(req, res, '异常错误')
            return
        } 

        taskResults.forEach(function(item, index) {
            projectModel.forEach(function(value, key) {
                if (item.projects.indexOf(value.name) > -1) {
                    if (value.name in projects) {
                        projects[value.name].push(item)
                    } else {
                        projects[value.name] = [item]
                    }
                }
            })
        })
        res.render('project/index', {projects : projects})
    })
}

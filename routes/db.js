var db              = require('../db/config').db
var task_coll       = db.collection('task')
    
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
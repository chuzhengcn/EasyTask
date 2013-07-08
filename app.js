//-----------------------------Module dependencies------------------------------
var express = require('express')
var http    = require('http')
var path    = require('path')
var stylus  = require('stylus')
//-----------------app-------------------------------------------------------
var app = express()

app.configure(function(){
    app.set('port', process.env.PORT || 5000)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'))
    app.use(express.logger('dev'))
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname }))
    app.use(express.methodOverride())
    app.use(app.router)
    app.use(stylus.middleware({src: path.join(__dirname, 'public')}))
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(express.errorHandler())
})

app.configure('development', function(){
})

app.configure('production', function(){
})
//-----------------------route-----------------------------------

//---------task--------------------------------------------------
var task = require('./routes/task')
app.get('/',                    task.index)
app.get('/tasks-requirement',   task.requirement)
app.post('/tasks',              task.create)
app.get('/tasks/:id',           task.show)
app.put('/tasks/:id',           task.update)
app.put('/tasks/:id/rating',    task.rating)
app.delete('/tasks/:id/rating-delete',task.ratingDelete)
app.delete('/tasks/:id',        task.delete)
app.put('/tasks/:id/archive',   task.archive)
app.put('/get-new-custom-id',   task.newCustomId)
app.get('/tasks-archive',       task.archiveList)
app.get('/tasks-search',        task.search)

//--------milestone-------------------------------------------------
var milestone = require('./routes/milestone')
app.post('/tasks/:taskId/milestones',          milestone.create)
app.put('/tasks/:taskId/milestones/:id',       milestone.update)
app.delete('/milestones/:id',                  milestone.delete)

//--------status-------------------------------------------------
var status = require('./routes/status')
app.get('/tasks/:task_id/status',       status.listByTask)
app.post('/tasks/:task_id/status',      status.create)
app.delete('/tasks/:task_id/status/:id', status.delete)

//---------user------------------------------------------------------
var user    = require('./routes/user')
app.get('/userinfo',        user.info)
app.get('/users',           user.list)
app.post('/users',          user.create)
app.get('/users/:id',       user.show)
app.put('/users/:id',       user.update)
app.put('/users/:id/active',user.active)
app.delete('/users/:id',    user.delete)
//---------todo------------------------------------------------------
var todo    = require('./routes/todo')
app.get('/tasks/:task_custom_id/todo-new',              todo.new)
app.get('/tasks/:task_custom_id/todos',                 todo.list)
app.get('/tasks/:task_custom_id/todo/:id/edit',         todo.edit)
app.get('/tasks/:task_custom_id/todos/:id',             todo.show)
app.post('/tasks/:task_id/todos',                       todo.create)
app.put('/tasks/:task_id/todos/:id',                    todo.update)
app.put('/tasks/:task_id/todos/:id/add-comment',        todo.addComment)
app.delete('/tasks/:task_id/todos/:id/files-delete',    todo.removeFile)
app.delete('/tasks/:task_id/todos/:id',                 todo.delete)

//---------bug------------------------------------------------------
var bug    = require('./routes/bug')
app.post('/tasks/:task_id/bugs',                            bug.create)
app.get('/tasks/:task_id/bugs-new',                         bug.new)
app.get('/tasks/:task_id/bugs',                             bug.list)
app.get('/tasks/:task_id/bugs-list',                        bug.listPage)
app.put('/tasks/:task_id/bugs/:id/change-status',           bug.changeStatus)
app.put('/tasks/:task_id/bugs/:id/add-comment',             bug.addComment)
app.put('/tasks/:task_id/bugs/:id/open-close',              bug.openClose)
app.get('/tasks/:task_custom_id/bugs/:id',                  bug.show)
app.get('/tasks/:task_custom_id/bugs/:id/edit',             bug.edit)
app.put('/tasks/:task_id/bugs/:id',                         bug.update)
app.delete('/tasks/:task_id/bugs/:id/file-delete',          bug.removeFile)
app.delete('/tasks/:task_id/bugs/:id',                      bug.delete)

//---------log------------------------------------------------------
var log    = require('./routes/log')
app.get('/tasks/:task_custom_id/logs',                 log.listByTask)

//---------review------------------------------------------------------
var review    = require('./routes/review')
app.get('/review-index',                 review.index)
app.get('/review/:user_id/new',          review.new)
app.post('/review/:user_id',             review.create)
app.get('/review/:user_id/item/:id/edit',review.edit)
app.put('/review/:user_id/item/:id',     review.update)
app.delete('/review/:user_id/item/:id',  review.delete)
app.post('/review/:user_id/caculate',    review.caculate)

//---------project------------------------------------------------------
var project    = require('./routes/project')
app.get('/projects',                 project.index)

//---------upload----------------------------------------------
var upload    = require('./routes/upload')
app.post('/upload-avatar',                  upload.createAvatar)
app.put('/upload-avatar/:file_name',        upload.updateAvatar)
app.delete('/upload-avatar/:file_name',     upload.deleteAvatar)
app.get('/tasks/:task_id/uploads',          upload.list)
app.post('/tasks/:task_id/upload-files',    upload.createTaskFiles)
//keep file in disk because some item used it
app.delete('/tasks/:task_id/uploads/:id',   upload.deleteFileRecord) 

//---------wiki--------------------------------------------------
var wiki = require('./routes/wiki')

app.get('/wikis', wiki.list)

//---------change_db--------------------------------------------------
var db_change = require('./routes/db')

// app.get('/db-change-custom-id', db_change.changeCustomId)
//---------------------------------------------------------------
http.createServer(app).listen(app.get('port'), function(){
    console.log("EasyTask server listening on port " + app.get('port'))
})

//-----------------------------Module dependencies------------------------------
var express = require('express')
var http    = require('http')
var path    = require('path')
var stylus  = require('stylus')
//-----------------app-------------------------------------------------------
var app = express()

app.configure(function(){
    app.set('port', process.env.PORT || 3000)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.favicon(__dirname + '/public/images/favicon.ico'))
    app.use(express.logger('dev'))
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname }))
    app.use(express.methodOverride())
    app.use(app.router)
    app.use(stylus.middleware({src: path.join(__dirname, 'public')}))
    app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function(){
    app.use(express.errorHandler())
})
//-----------------------route-----------------------------------
//---------task--------------------------------------------------
var task = require('./routes/task')
app.get('/',                    task.list)
app.get('/tasks',               task.list)
app.post('/tasks',              task.create)
app.get('/tasks/:id',           task.show)
app.put('/tasks/:id',           task.update)
app.delete('/tasks/:id',        task.delete)
app.put('/tasks/:id/archive',   task.archive)
//--------milestone-------------------------------------------------
var milestone = require('./routes/milestone')
app.post('/tasks/:task_id/milestones',          milestone.create)
app.get('/tasks/:task_id/milestones/:id',       milestone.show)
app.get('/tasks/:task_id/milestones',           milestone.list)
app.put('/tasks/:task_id/milestones/:id',       milestone.update)
app.delete('/tasks/:task_id/milestones/:id',    milestone.delete)
//---------user------------------------------------------------------
var user    = require('./routes/user')
app.get('/users',           user.list)
app.post('/users',          user.create)
app.get('/users/:id',       user.show)
app.put('/users/:id',       user.update)
app.delete('/users/:id',    user.delete)
//---------upload----------------------------------------------
var upload    = require('./routes/upload')
app.post('/upload-avatar',              upload.createAvatar)
app.put('/upload-avatar/:file_name',    upload.updateAvatar)
app.delete('/upload-avatar/:file_name', upload.deleteAvatar)
//--------------------error------------------------
var error = require('./routes/error')
app.get('/404', error.handler404)
//---------------------------------------------------------------
http.createServer(app).listen(app.get('port'), function(){
    console.log("EasyTask server listening on port " + app.get('port'))
})

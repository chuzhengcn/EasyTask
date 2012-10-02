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
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(app.router)
    app.use(stylus.middleware({src: path.join(__dirname, 'public')}))
    app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function(){
    app.use(express.errorHandler())
})
//-----------------------route-----------------------------------
var user    = require('./routes/user')

app.get('/',                user.list)
app.get('/users',           user.list)
app.post('/users',          user.create)
app.get('/users/:id',       user.show)
app.put('/users/:id',       user.update)
app.delete('/users/:id',    user.delete)


//---------------------------------------------------------------
http.createServer(app).listen(app.get('port'), function(){
    console.log("EasyTask server listening on port " + app.get('port'))
})

var db              = require('./config').db
var version_coll    = db.collection('version')

exports.create = function(version, cb) {
    version_coll.insert(version, cb)
}

exports.findAll = function(cb) {
    version_coll.find().toArray(cb)
}

exports.findById = function(id, cb) {
    version_coll.findById(id, cb)
}

exports.updateById = function(id, versionDoc, cb) {
    version_coll.updateById(id, { $set : versionDoc }, {safe:true}, cb)
}

exports.removeById = function(id, cb) {
    version_coll.removeById(id, cb)
}

exports.findAndModifyById = function(id, versionDoc, cb) {
    version_coll.findAndModify({ _id : version_coll.id(id) }, {}, { $set : versionDoc}, {new : true}, cb)
}
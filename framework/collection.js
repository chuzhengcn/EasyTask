exports.mongo_coll = function (collection) {
    this.coll = collection
}

exports.mongo_coll.prototype = {
    create : function(doc, cb) {
        this.coll.insert(doc, cb)
    },

    find_by_id : function(id, cb) {
        this.coll.findById(id.toString(), cb)
    },

    update_by_id : function(id, doc, cb) {
        this.coll.updateById(id.toString(), {$set : doc}, cb)
    },

    remove_by_id : function(id, cb) {
        this.coll.removeById(id.toString(), cb)
    },
}  
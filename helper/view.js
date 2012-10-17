// view helper
exports.keepLineBreak = function(collection, field) {
    // only handle Object or Array
    if (!field || !Array.isArray(field)) {
        return 'you should specify format field with Array'
    }

    //handle Array use recursive function --search field in array
    if(Array.isArray(collection) && collection.length > 0) {
        collection.forEach(function(item, index, array) {
            exports.keepLineBreak(item, field)
        })
    } else {
        // reject item in array but objcet
        if (typeof collection == 'object') {
            //processing
            for (var key in collection) { // --search field in Object
                if (collection[key]) {
                    if (field.indexOf(key) > -1 ) {//-- search specify_field
                        collection[key] = collection[key].replace(/\n/g,'<br/>')
                    }
                }
            }
        }
    }

    return collection
}
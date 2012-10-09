//------constant---------------maybe_later_todo: zone_ms should be able to set, but now, no need to do that----------
var zone_ms         = 8*60*60*1000 //beijing time
var one_day_ms      = 24*60*60*1000
var one_hour_ms     = 60*60*1000
var one_minute_ms   = 60*1000
var one_second_ms   = 1000
//-------------time module method------------------------------------------------------------------
//beijing time at midnight: 2012/02/14 02:15:36 => 2012/02/14 00:00:00------------------------------
exports.beginning_of_day = function (date) {
    if (!(date instanceof Date)) {
        return 'invalid Date'
    }

    var utc_time_ms     = date.getTime()
    var local_time_ms   = new Date(utc_time_ms + zone_ms)

    var hours           = local_time_ms.getUTCHours()
    var minutes         = local_time_ms.getUTCMinutes()
    var seconds         = local_time_ms.getUTCSeconds()
    var milliseconds    = local_time_ms.getUTCMilliseconds()

    var distance_to_local_beginning_of_day = 1000*60*60*hours + 1000*60*minutes + 1000*seconds + milliseconds

    return new Date(utc_time_ms - distance_to_local_beginning_of_day)
}

//beijing time at next_day mignight: 2012/02/14 02:15:36 => 2012/02/15 00:00:00-------------------------------------
exports.end_of_day = function (date) {
    if (!(date instanceof Date)) {
        return 'invalid Date'
    }

    var utc_time_ms     = date.getTime()
    var local_time_ms   = new Date(utc_time_ms + zone_ms)

    var hours           = local_time_ms.getUTCHours()
    var minutes         = local_time_ms.getUTCMinutes()
    var seconds         = local_time_ms.getUTCSeconds()
    var milliseconds    = local_time_ms.getUTCMilliseconds()

    var distance_to_local_end_of_day = one_day_ms - (1000*60*60*hours + 1000*60*minutes + 1000*seconds + milliseconds)

    return new Date(date.getTime() + distance_to_local_end_of_day)
}
// Date => 2012/02/14 ---------------------------------------------------------------------------------------
exports.format_to_data = function (date, connectors) {
    if (!(date instanceof Date)) {
        return 'invalid Date'
    }

    //set_defaule_connectors == '/'
    if (!connectors || typeof connectors !== 'string') {
        connectors = '/'
    }

    var utc_time_ms     = date.getTime()
    var local_time_ms   = new Date(utc_time_ms + zone_ms)

    var year            = local_time_ms.getUTCFullYear()
    var month           = time_zero_completion(local_time_ms.getUTCMonth() + 1)
    var day             = time_zero_completion(local_time_ms.getUTCDate())

    return year + connectors + month + connectors + day
}
// Date => 02:15:36 -------------------------------------------------------------------------
exports.format_to_time = function (date) {
    if (!(date instanceof Date)) {
        return 'invalid Date'
    }

    var utc_time_ms     = date.getTime()
    var local_time_ms   = new Date(utc_time_ms + zone_ms)

    var hours           = time_zero_completion(local_time_ms.getUTCHours())
    var minutes         = time_zero_completion(local_time_ms.getUTCMinutes())
    var seconds         = time_zero_completion(local_time_ms.getUTCSeconds())

    return hours + ':' + minutes + ':' + seconds
}
// Date => 2012/02/14 02:15:36 -----------------------------------------------------------------
exports.format_to_datetime = function (date, connectors) {
    if (!(date instanceof Date)) {
        return 'invalid Date'
    }

    var format_data = exports.format_to_data(date, connectors)
    var format_time = exports.format_to_time(date)

    return format_data + ' ' + format_time
}

// var collection = [{ time : new Date() }, { time2 : new Date() }] => [{ time : 2012-08-07 }, {time2: 14:55:52}]
// exports.format_specify_field(collection ,{time : 'data:-', time2 : 'time'}),string after ':' means connectors
exports.format_specify_field = function(collection, field) {
    // only handle Object or Array
    if (!field || typeof field !== 'object') {
        return 'you should specify format field with Object or Array'
    }

    // custom format string maps to method
    var format_time_map = {
        'date'      : exports.format_to_data,
        'time'      : exports.format_to_time,
        'datetime'  : exports.format_to_datetime
    }

    //handle Array use recursive function --search field in array
    if(Array.isArray(collection) && collection.length > 0) {
        collection.forEach(function(item, index, array) {
            exports.format_specify_field(item, field)
        })
    } else {
        // reject item in array but objcet
        if (typeof collection == 'object') {
            //processing
            for (var key in collection) { // --search field in Object
                if (collection[key]) {
                    if (field.hasOwnProperty(key)) {//-- search specify_field
                        collection[key] = format_time_map[field[key].split(':')[0]](collection[key], field[key].split(':')[1])
                    }
                }
            }
        }
    }

    return collection
}
// 2012/08/07 or 2012-08-07 or 2012/08/07 14:55:05 => Date Warning: Client must be in Eastern 8 timezone
exports.parse_date = function (date_str) {
    if (typeof date_str !== 'string') {
        return 'must be string'
    }

    date_str = date_str.replace(/-/g,'/')


    var date_part = date_str.split(' ')[0]

    var date_part_arr = date_part.split('/')
    if (!date_part_arr[0] || !date_part_arr[1] || !date_part_arr[2]) {
        return 'invalid date string'
    }

    var year     = parseInt(date_part_arr[0], 10)
    var month    = parseInt(date_part_arr[1], 10)-1
    var day      = parseInt(date_part_arr[2], 10)

    if ( typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
        return 'invalid date string'
    }

    var hour     = 0
    var minute   = 0
    var second   = 0
    
    var time_part = date_str.split(' ')[1]

    if (time_part) {
        var time_arr = time_part.split(':')
        if (time_arr[0] && typeof parseInt(time_arr[0], 10) == 'number') {
            hour    = parseInt(time_arr[0], 10)
        }

        if (time_arr[1] && typeof parseInt(time_arr[1], 10) == 'number') {
            minute  = parseInt(time_arr[1], 10)
        }

        if (time_arr[2] && typeof parseInt(time_arr[2], 10) == 'number') {
            second  = parseInt(time_arr[2], 10)
        }
    }

    return new Date(Date.UTC(year, month, day, hour, minute, second) - zone_ms)
}
// helper-----------------------------------------------------------------------------------------------
// 8:7:2 => 08:07:02
function time_zero_completion (time_number) {
    if (parseInt(time_number, 10) < 10) {
        return '0' + time_number
    } else {
        return time_number
    }
}
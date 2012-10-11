var app = {}
app.utility = {
    highlightCurrentPage : function(target_nav_text) {
        $('#sidebar ul a').each(function() {
            if ($(this).find('span').text() ==  target_nav_text) {
                $(this).addClass('selected')
                $(this).find('i').addClass('icon-white')
            }
        })
    },
    showRightSideBar : function() {
        $('#content .detail-wrapper').animate({ width : '432px' })
    },
    hideRightSideBar : function() {
        $('#content .detail-wrapper').animate({ width : '0px' })
    },
    isImage : function(fileType) {
        if (/image/.test(fileType)) {
            return true
        } else {
            return false
        }
    },
    createObjectURL : function (blob) {
        if (window.URL) {
            return window.URL.createObjectURL(blob)
        } else if (window.webkitURL) {
            return window.webkitURL.createObjectURL(blob)
        } else {
            return null
        }
    },
    isValidForm : function(formId) {
        var valid = document.getElementById(formId).checkValidity()
        return valid
    },
    isWorking   : function($btn) {
        $btn.html('提交中...').addClass('disabled').off()
    },
    //get queryKey through url in client js
    get_query_value : function(query_key) {
        var query_str = location.search.substring(1)

        if (query_str == '' || query_str == undefined) {
            return
        }

        var key_value_group = query_str.split('&')

        for(var i = 0 ; i < key_value_group.length; i++) {
            var key   = key_value_group[i].split('=')[0]
            var value = key_value_group[i].split('=')[1]
            if (key == query_key) {
                return value
            }
        }
    }
}

app.viewhelper = {
    setSelect : function(selectId) {
        var defauleValue = $('#' + selectId).data('originName')
        $('#' + selectId + ' option').each(function() {
            if ($(this).val() == defauleValue) {
               $(this).attr('selected', 'selected')
            }
        })
    }
}
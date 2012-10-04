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
    }
}

app.viewhelper = {
    setSelect : function(selectId) {
        var defauleValue = $('#' + selectId).data('originName')
        $('#' + selectId).change(function() {
            $('#' + selectId + ' option').each(function() {
                if ($(this).val() == defauleValue) {
                   $(this).attr('selected', 'selected')
                }
            })
        }).change() 
    }
}
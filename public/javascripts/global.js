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
    highlightTaskNav : function(target_nav_text) {
        $('#task_inside_nav ul li').each(function() {
            if ($(this).find('a').text() ==  target_nav_text) {
                $(this).addClass('active')
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
    },
    setFileIcon : function() {
        if (!$('.file-item')) {
            return
        } 

        $('.file-item').each(function() {
            var type = $(this).data('type')
            switch(type) {
                case 'text/plain' :
                    setIcon.call(this, 'txt.png')
                    break
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                    setIcon.call(this, 'xlsx.png')
                    break
                case 'application/msword' :
                    setIcon.call(this, 'doc.png')
                    break
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                    setIcon.call(this, 'docx.png')
                    break
                case 'application/pdf' :
                    setIcon.call(this, 'pdf.png')
                    break
                case 'application/vnd.ms-excel' :
                    setIcon.call(this, 'xls.png')
                    break
                case 'application/x-shockwave-flash' :
                    setIcon.call(this, 'swf.png')
                    break
                case 'application/vnd.ms-powerpoint' :
                    setIcon.call(this, 'ppt.png')
                    break
                case 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
                    setIcon.call(this, 'pptx.png')
                    break
                case 'image/jpeg' :
                    setImgPreview.call(this)
                    break
                case 'image/png' :
                    setImgPreview.call(this)
                    break
                case 'image/gif' :
                    setImgPreview.call(this)
                    break
                default :
                    setIcon.call(this, 'binary.png')
            }   
        })

        function setIcon(iconAddress) {
            $(this).children('img').attr('src', '/images/' + iconAddress)
        }

        function setImgPreview() {
            $(this).children('img').attr('src', $(this).children('.name').attr('href'))
        }
    }
}
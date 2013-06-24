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
};

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
    },
    markDifferentColorToTodoCategory : function($statusObjGroup) {
        $statusObjGroup.each(function() {
            removeOtherColor($(this))

            switch ($(this).text()) {
                case '需求' :
                    $(this).addClass('label-warning')
                    break
                case 'bug' :
                    $(this).addClass('label-important')
                    break
                case '功能点' :
                    $(this).addClass('label-info')
                    break
                default :
                    break
            }
        })

        function removeOtherColor($statusObj) {
            $statusObj.removeClass('label-success label-warning label-important label-info label-inverse')
        }
    },
    markDifferentColorToTaskStatus : function($statusObjGroup) {
        $statusObjGroup.each(function() {
            removeOtherColor($(this))
            switch ($.trim($(this).text())) {
                case '需求提交' :
                    $(this).addClass('label-warning')
                    break
                case '开发已完成' :
                    $(this).addClass('label-info')
                    break
                case '已提交Release' :
                    $(this).addClass('label-inverse')
                    break
                case '已提交Master' :
                    $(this).addClass('label-inverse')
                    break
                case '已提交Test' :
                    $(this).addClass('label-inverse')
                    break
                case '已提交Dev' :
                    $(this).addClass('label-inverse')
                    break
                case '测试打回' :
                    $(this).addClass('label-important')
                    break
                case '测试通过' :
                    $(this).addClass('label-success')
                    break
                case 'Master测试通过' :
                    $(this).addClass('label-success')
                    break
                case 'Test测试通过' :
                    $(this).addClass('label-success')
                    break
                case 'Dev测试通过' :
                    $(this).addClass('label-success')
                    break
                case '已发布外网' :
                    $(this).addClass('label-inverse')
                    break
                default :
                    break
            }
        })
        function removeOtherColor($statusObj) {
            $statusObj.removeClass('label-success label-warning label-important label-info label-inverse')
        }
    }
};

(function() {
    function toggleSearchForm() {
        $('#header .search span').click(function (event) {
            $(this).next().fadeToggle()
        })
    };

    function hideSearchForm() {
        $('#header .search input').blur(function (event) {
            $(this).parent().fadeOut();
        })
    };

    function setClientInfo() {
        var client = {
            name        : localStorage.getItem("userName"),
            ip          : localStorage.getItem("userIp"),
            role        : localStorage.getItem("userRole"),
            avatar_url  : localStorage.getItem("userAvatarUrl"),
            _id         : localStorage.getItem("userId"),
        };

        function getClientInfo() {
            $.ajax({
                url     : '/userinfo',
                success : function(data) {
                    if (!data.ok) {
                        return
                    }

                    saveClinetInfo(data.result)
                }
            })
        };

        function saveClinetInfo(user) {
            localStorage.userName       = user.name
            localStorage.userIp         = user.ip
            localStorage.userRole       = user.role
            localStorage.userAvatarUrl  = user.avatar_url
            localStorage.userId         = user._id
            showClientInfo()
        }

        function showClientInfo() {
            $('#header .user-avatar a').attr("href", "/users/" + localStorage.userId)
            $('#header .user-avatar a img').attr("src", localStorage.userAvatarUrl)
            $('#header .user-avatar span').html(localStorage.userName)
            $('#header .user-avatar a').data("role", localStorage.userRole)
            $('#header .user-avatar a').data("ip", localStorage.userIp)
        }

        // if (!client.name) {
        //     getClientInfo()
        // } else {
        //     showClientInfo()
        // }

        // todo : 避免每次请求服务器获取个人信息
        getClientInfo()
    }

    $(function() {
        setClientInfo()
        toggleSearchForm();
        hideSearchForm();
    })
})();
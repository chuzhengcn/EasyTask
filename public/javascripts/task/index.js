(function() {
    $(function() {
        highlightCurrentPage()
        fillTaskStatusToFilter()
        fillTaskBranchToFilter()
        fillTaskUserToFilter()
        eventBind()
        popoverTaskInfo()
        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))
        setPage()
    })

    function eventBind() {
        $('.operate-wrapper button').click(function() {
            app.utility.showRightSideBar()
            resetCreateTaskForm()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#add_more_task_user').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })

        $('#create_task_btn').click(function(event) {           
            var self = this
            readyToCreateTask.call(self, event)
        })
    }
    function highlightCurrentPage() {
        if(app.utility.get_query_value('active')) {
            app.utility.highlightCurrentPage('已存档')
            return
        }
        
        if( decodeURIComponent(app.utility.get_query_value('status')) == '需求提交') {
            app.utility.highlightCurrentPage('需求')
            return
        }

        app.utility.highlightCurrentPage('任务')

    }

    function setPage(){
        var total           = parseInt($('ul.pager').data('count'), 10)
        var perPageNum      = 20
        var currentPage     = parseInt(app.utility.get_query_value('page'), 10) || 1

        if (total <= perPageNum ) {
            return
        } else {
             $('ul.pager').show()
        }

        if (currentPage*perPageNum < total) {
            $('ul.pager li.next a').attr('href', setPagerUrl(currentPage + 1))
        } else {
            $('ul.pager li.next').addClass('disabled').find('a').attr('href', '#')
        } 

        if (currentPage > 1) {
            $('ul.pager li.previous a').attr('href', setPagerUrl(currentPage - 1))
        } else {
            $('ul.pager li.previous').addClass('disabled').find('a').attr('href', '#')
        }

        function setPagerUrl(pageNum) {
            var newUrlArray = location.href.split('&').filter(function(item, index, array) {
                if (item.indexOf('page') == -1) {
                    return true
                }
            })
            var newUrl = newUrlArray.join('&')

            if (newUrl.indexOf('?') == -1) {
                return newUrl + '?page=' + pageNum 
            }
            
            return newUrl + '&page=' + pageNum
        }
    }

    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover'
        })
    }

    function addMoreTaskUserInput() {
        $('input[name="task_users"]:first').clone().insertBefore($('#add_more_task_user')).val('').focus()
    }

    function resetCreateTaskForm() {
        $('#create_task_form input[type="text"]').val('')
    }

    function agreePossibleUnknowUser() {
        var userOptionArray = [] 
        var agree           = true
        $('#task_users_option option').each(function() {
            userOptionArray.push($(this).val())
        })

        $('input[name="task_users"]').each(function() {
            var userName = $(this).val()
            if (userName !== '') {
                if (userOptionArray.indexOf(userName) == -1) {
                    alert('未知参与者\n\n' + userName + '\n\n不能包含该人员')
                    agree = false
                }
            }
        })
        return agree
    }
    
    function readyToCreateTask(event) {
        if (app.utility.isValidForm('create_task_form')) {
            if (agreePossibleUnknowUser()) {
                createTaskIsWorking()
                satrtCreateTask()
            } 
            event.preventDefault() 
        }
    }

    function createTaskIsWorking() {
        $('#create_task_btn').html('提交中...').addClass('disabled').off()
    }

    function satrtCreateTask() {
        $.ajax({
            type        : 'post',
            url         : $('#create_task_form').attr('action'),
            data        : $('#create_task_form').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks/' + data.id
                } else {
                    createTaskIsComplete()
                    alert(data.msg)
                }
            }
        })
    }

    function createTaskIsComplete() {
        $('#create_task_btn').html('提交').removeClass('disabled').on('click', function(event) {
            var self = this
            readyToCreateTask.call(self, event)
        })
    }

    function fillTaskStatusToFilter() {
        var currentStatus = app.utility.get_query_value('status') || app.utility.get_query_value('active')
        var taskBaseLink =  '/tasks'
        //mark current status
        if(currentStatus) {
            if (currentStatus == 'false') {
                $('#task_status_filter button:first').html('已存档')
            } else {
                $('#task_status_filter button:first').html(decodeURIComponent(currentStatus))
            }
        }

        $('#datalist_status_selecter option').each(function(index, value) {
            if (index == 0) {
                return
            }

            $('#task_status_filter .dropdown-submenu .dropdown-menu').append('<li><a href="'
                + taskBaseLink + '?status=' + $(this).val()
                + '">'
                + $(this).val()
                + '</a></li>')
        })
    }

    function fillTaskBranchToFilter() {
        var currentBranch = app.utility.get_query_value('branch')
        if (currentBranch) {
            $('#task_branch_filter button:first').html(decodeURIComponent(currentBranch))
        }
    }

    function fillTaskUserToFilter() {
        var currentUserId = app.utility.get_query_value('user')
        if (currentUserId) {
            $('#task_user_filter span.name').each(function() {
                if ($(this).data('id') == currentUserId) {
                    $('#task_user_filter button:first').html($(this).text())
                }
            })
        }
    }

})()
(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        eventBind()
    })

    function eventBind() {
        $('#delete_task_btn').click(function() {
            deleteTask()
        })

        $('#archive_task_btn').click(function() {
            archiveTask()
        })

        $('#edit_task_info').click(function() {
            app.utility.showRightSideBar()
            $('#edit_task_info_form_wrapper').show()
        })

        $('#edit_task_users').click(function() {
            app.utility.showRightSideBar()
            $('#edit_task_users_form_wrapper').show()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
            $('.inner .task-form-wrapper').fadeOut()
        })

        $('#edit_task_info_form_btn').click(function(event) {
            var self = this
            readyToEditTaskInfo.call(this, event)
        })

        $('#edit_task_users_form_btn').click(function(event) {
            var self = this
            readyToEditTaskUsers.call(this, event)
        })

        $('#add_more_task_user').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })
    }

    function deleteTask() {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/tasks/' + getTaskId(),
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = '/tasks'
                    } else {
                        alert(data.msg)
                    }
                }
            })
        }
    }

    function archiveTask() {
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/archive',
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks/' + getTaskId()
                } else {
                    alert(data.msg)
                }
            }
        })
    }

    function readyToEditTaskInfo(event) {
        if (app.utility.isValidForm('edit_task_info_form')) {
            startEditTaskInfo()
            editTaskIsWorking()
            event.preventDefault() 
        }
    }

    function startEditTaskInfo() {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_info_form').attr('action'),
            data        : $('#edit_task_info_form').serialize(),
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }

    function readyToEditTaskUsers(event) {
        if (app.utility.isValidForm('edit_task_users_form')) {
            if (agreePossibleUnknowUser()) {
                editTaskUsersIsWorking()
                startEditTaskUsers()
            }
            event.preventDefault() 
        }
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

    function startEditTaskUsers() {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_users_form').attr('action'),
            data        : $('#edit_task_users_form').serialize(),
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }

    function addMoreTaskUserInput() {
        $('input[name="task_users"]:first').clone().insertBefore($('#add_more_task_user')).val('').focus()
    }
    
    function getTaskId() {
        return $('.breadcrumb li.active').data('id')
    }

    function editTaskIsWorking() {
        $('#edit_task_info_form_btn').html('提交中...').addClass('disable').off()
    }

    function editTaskUsersIsWorking() {
        $('#edit_task_users_form_btn').html('提交中...').addClass('disable').off()
    }
})()
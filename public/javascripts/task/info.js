(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        eventBind()
    })

    function eventBind() {
        //delete task btn
        $('#delete_task_btn').click(function() {
            deleteTask()
        })

        //archive task btn
        $('#archive_task_btn').click(function() {
            archiveTask()
        })

        //edit task name btn
        $('#edit_task_info').click(function() {
            app.utility.showRightSideBar()
            $('#edit_task_info_form_wrapper').show()
        })

        //edit task user btn
        $('#edit_task_users').click(function() {
            app.utility.showRightSideBar()
            $('#edit_task_users_form_wrapper').show()
        })

        //close pane btn
        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
            $('.inner .task-form-wrapper').fadeOut()
        })

        //submit task name
        $('#edit_task_info_form_btn').click(function(event) {
            var self = this
            readyToEditTaskInfo.call(this, event)
        })

        //submit task users
        $('#edit_task_users_form_btn').click(function(event) {
            var self = this
            readyToEditTaskUsers.call(this, event)
        })

        //add more task users btn-link
        $('#add_more_task_user').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })

        //add task milestone btn
        $('#add_milestone_in_taskinfo').click(function() {
            app.utility.showRightSideBar()
            $('#add_task_milestone_form_wrapper').show()
        })

        //submit task milestone btn
        $('#add_task_milestone_form_btn').click(function(event) {
            readyToAddMilestone()
        })

        //custome milestone name btn
        $('#custom_milestone_name').toggle(
            function() {
                $('#custom_milestone_name_input').show()
                $('#add_task_milestone_form select').hide()
                $(this).html('选择常用事件')
            },
            function() {
                $('#custom_milestone_name_input').hide()
                $('#add_task_milestone_form select').show()
                $(this).html('自定义事件名称')
            }
        )
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
        $('#edit_task_info_form_btn').html('提交中...').addClass('disabled').off()
    }

    function editTaskUsersIsWorking() {
        $('#edit_task_users_form_btn').html('提交中...').addClass('disabled').off()
    }

    function readyToAddMilestone() {
        if (app.utility.isValidForm('add_task_milestone_form')) {
            addMilestoneIsWorking()
            startAddMilestone()
            event.preventDefault() 
        }
    }

    function addMilestoneIsWorking() {
        $('#add_task_milestone_form_btn').html('提交中...').addClass('disabled').off()
    }

    function startAddMilestone() {
        $.ajax({
            type        : 'post',
            url         : $('#add_task_milestone_form').attr('action'),
            data        : $('#add_task_milestone_form').serialize(),
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }
})()
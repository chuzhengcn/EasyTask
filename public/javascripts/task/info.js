(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('摘要')
        app.viewhelper.setFileIcon()
        app.viewhelper.markDifferentColorToTaskStatus($('.status span.label'))
        app.viewhelper.markDifferentColorToTodoCategory($('.task-summary-todo .category span.label'))
        eventBind()
    })

    function eventBind() {
        //delete task btn
        $('#delete_task_btn').click(function() {
            deleteTask($(this))
        })

        //archive task btn
        $('#archive_task_btn').click(function() {
            archiveTask($(this))
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
            readyToEditTaskInfo.call(this, event, $(this))
        })

        //submit task users
        $('#edit_task_users_form_btn').click(function(event) {
            readyToEditTaskUsers.call(this, event, $(this))
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
            readyToAddMilestone.call(this, event, $(this))
        })

        //custome milestone name btn
        $('#custom_milestone_name').toggle(
            function() {
                $('#custom_milestone_name_input').show()
                $('#add_task_milestone_form select').hide().val('')
                $(this).html('选择常用事件')
            },
            function() {
                $('#custom_milestone_name_input').hide().val('')
                $('#add_task_milestone_form select').show()
                $(this).html('自定义事件名称')
            }
        )

        //add task milestone btn
        $('#task_branch_btn').click(function() {
            app.utility.showRightSideBar()
            $('#task_branch_form_wrapper').show()
        })

        //add or update task branch
        $('#task_branch_form_btn').click(function(event) {
            readyToUpsertBranch.call(this, event, $(this))
        })
        //get the new task custom id
        $('#get_new_custom_id').click(function(event) {
            getNewCustomId()
            event.preventDefault()
        })

        // complete todo
        $('span.un-complete, span.complete').click(function(){
            changeCompleteStatus.call(this)
        }) 

    }

    function deleteTask($btn) {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/tasks/' + getTaskId(),
                beforeSend  : function() {
                    app.utility.isWorking($btn)
                },
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

    function archiveTask($btn) {
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/archive',
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks'
                } else {
                    alert(data.msg)
                }
            }
        })
    }

    function readyToEditTaskInfo(event, $btn) {
        if (app.utility.isValidForm('edit_task_info_form')) {
            startEditTaskInfo($btn)
            event.preventDefault() 
        }
    }

    function startEditTaskInfo($btn) {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_info_form').attr('action'),
            data        : $('#edit_task_info_form').serialize(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }

    function readyToEditTaskUsers(event, $btn) {
        if (app.utility.isValidForm('edit_task_users_form')) {
            if (agreePossibleUnknowUser()) {
                startEditTaskUsers($btn)
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

    function startEditTaskUsers($btn) {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_users_form').attr('action'),
            data        : $('#edit_task_users_form').serialize(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
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
        return $('.list-header header').data('id')
    }

    function readyToAddMilestone(event, $btn) {
        if (app.utility.isValidForm('add_task_milestone_form')) {
            startAddMilestone($btn)
            event.preventDefault() 
        }
    }

    function startAddMilestone($btn) {
        $.ajax({
            type        : 'post',
            url         : $('#add_task_milestone_form').attr('action'),
            data        : $('#add_task_milestone_form').serialize(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }

    function readyToUpsertBranch(event, $btn) {
        if (app.utility.isValidForm('task_branch_form')) {
            $.ajax({
                type        : 'put',
                url         : $('#task_branch_form').attr('action'),
                data        : $('#task_branch_form').serialize(),
                beforeSend  : function() {
                    app.utility.isWorking($btn)
                },
                success     : function(data) {
                    if (!data.ok) {
                        alert(data.msg)
                    }
                    location.href = location.href
                }
            })
            event.preventDefault() 
        }
    }

    function getNewCustomId() {
        $('#get_new_custom_id').html('正在获取')
        $.ajax({
            type        : 'put',
            url         : '/get-new-custom-id',
            success     : function(data) {
                if (data.ok == 1) {
                    $('#task_branch_form input[name="branch"]').val('/' + data.id)
                    $('#get_new_custom_id').html('再次获取')
                }
            }
        })
    }

    function changeCompleteStatus() {
        var status = 1
        if ($(this).attr('class') == 'complete') {
            $(this).attr({
                'class' : 'un-complete',
                'title' : '标记事项已完成'
            })
            status = 0
        } else {
            $(this).attr({
                'class' : 'complete',
                'title' : '标记事项未完成'
            })
        }

        var todoId = $(this).parent().data('id')
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/todos/' + todoId,
            data        : { complete : status},
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                } 
            }
        })
    }
})()
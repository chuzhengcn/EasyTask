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

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
            $('.inner .task-info_form-wrapper').fadeOut()
        })

        $('#edit_task_info_form_btn').click(function(event) {
            var self = this
            readyToEditTaskInfo.call(this, event)
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
            event.preventDefault() 
        }
    }

    function startEditTaskInfo() {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_info_form').attr('action'),
            data        : $('#edit_task_info_form').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = location.href
                } else {
                    alert(data.msg)
                    location.href = location.href
                }
            }
        })
    }

    function getTaskId() {
        return $('.breadcrumb li.active').data('id')
    }
})()
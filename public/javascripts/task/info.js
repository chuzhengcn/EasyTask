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
                    location.href = '/tasks'
                } else {
                    alert(data.msg)
                }
            }
        })
    }

    function getTaskId() {
        return $('.breadcrumb li.active').data('id')
    }
})()
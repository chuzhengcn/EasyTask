(function() {
    var target_file
    var files_info = []

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function getTodoId() {
        return $('.todo-info').data('id')
    }

    function submitCommentForm(event, $btn) {
        if (app.utility.isValidForm('add_comment_form')) {
            event.preventDefault() 
            $.ajax({
                type        : 'put',
                url         : $('#add_comment_form').attr('action'),
                data        : $('#add_comment_form').serialize(),
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
    }

    function delete_todo(event, $btn) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }

        $.ajax({
            type        : 'delete',
            url         : '/tasks/' + getTaskId() + '/todos/' + getTodoId(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = '/tasks/' + getTaskCustomId()
            }
        })
    }

    function getTaskCustomId() {
        return $('.list-header header').data('custom-id')
    }

    function eventBind() {
        // $('#complete_todo_btn').click(function(){
        //     changeCompleteStatus.call(this)
        // })

        $('#add_comment_btn').click(function(event) {
            submitCommentForm.call(this, event, $(this))
        })

        $('#delete_todo').click(function(event) {
            delete_todo.call(this, event, $(this))
        })
    }
    
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.viewhelper.markDifferentColorToTodoCategory($('.todo-info h3 span.label'))
        eventBind()

        setTimeout(function() {
            $('.my-avatar').attr('src', localStorage.userAvatarUrl)
        }, 1000)
    })

    // function changeCompleteStatus() {
    //     var status = 1
    //     if ($(this).attr('class') == 'complete') {
    //         $(this).attr({
    //             'class' : 'un-complete',
    //             'title' : '标记事项已完成'
    //         })
    //         status = 0
    //     } else {
    //         $(this).attr({
    //             'class' : 'complete',
    //             'title' : '标记事项未完成'
    //         })
    //     }
    //     $.ajax({
    //         type        : 'put',
    //         url         : '/tasks/' + getTaskId() + '/todos/' + getTodoId(),
    //         data        : { complete : status},
    //         success     : function(data) {
    //             if (!data.ok) {
    //                 alert(data.msg)
    //             } 
    //         }
    //     })
    // }

    

})()
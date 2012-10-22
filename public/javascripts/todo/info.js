(function() {
    var target_file
    var files_info = []
    
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('待办事项')
        eventBind()
    })

    function eventBind() {
        $('#complete_todo_btn').click(function(){
            changeCompleteStatus.call(this)
        })
    }

    function changeCompleteStatus() {
        var classCompleteMap = {
            'complete'    : true,
            'un-complete' : false
        }
        if (classCompleteMap[$(this).attr('class')]) {
            $(this).attr({
                'class' : 'un-complete',
                'title' : '标记事项已完成'
            })
        } else {
            $(this).attr({
                'class' : 'complete',
                'title' : '标记事项未完成'
            })
        }
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/todos/' + getTodoId(),
            data        : { complete : classCompleteMap[$(this).attr('class')]},
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                
            }
        })
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function getTodoId() {
        return $('.todo-info').data('id')
    }

})()
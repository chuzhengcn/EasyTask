(function() {
    var target_file
    var files_info = []
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('待办事项')
        app.viewhelper.markDifferentColorToTodoCategory($('.todo-list span.category'))
        eventBind()
    })

    function eventBind() {

        // complete todo
        $('span.un-complete, span.complete').click(function(){
            changeCompleteStatus.call(this)
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

    function getTaskId() {
        return $('.list-header header').data('id')
    }

})()
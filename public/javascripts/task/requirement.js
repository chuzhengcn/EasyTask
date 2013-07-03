(function() {
    
    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover'
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('任务')

        eventBind()

        popoverTaskInfo()

        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))

    })

})()
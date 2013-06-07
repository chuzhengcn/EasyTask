(function() {
    $(function() {
        // app.utility.highlightCurrentPage('我的任务')
        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))
        popoverTaskInfo()
    })

    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover'
        })
    }
})()
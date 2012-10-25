(function() {
    $(function() {
        app.utility.highlightCurrentPage('我的任务')
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
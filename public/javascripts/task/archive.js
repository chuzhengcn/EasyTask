(function() {

    $(function() {
        app.utility.highlightCurrentPage('任务')
        popoverTaskInfo()
        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))
        setPage()
    })
    

    function setPage(){
        var total           = parseInt($('ul.pager').data('count'), 10)
        var perPageNum      = 20
        var currentPage     = parseInt(app.utility.get_query_value('page'), 10) || 1

        if (total <= perPageNum ) {
            return
        } else {
            $('ul.pager').show()
        }

        if (currentPage*perPageNum < total) {
            $('ul.pager li.next a').attr('href', setPagerUrl(currentPage + 1))
        } else {
            $('ul.pager li.next').addClass('disabled').find('a').attr('href', '#')
        } 

        if (currentPage > 1) {
            $('ul.pager li.previous a').attr('href', setPagerUrl(currentPage - 1))
        } else {
            $('ul.pager li.previous').addClass('disabled').find('a').attr('href', '#')
        }

        function setPagerUrl(pageNum) {
            var newUrlArray = location.href.split('&').filter(function(item, index, array) {
                if (item.indexOf('page') == -1) {
                    return true
                }
            })
            var newUrl = newUrlArray.join('&')

            if (newUrl.indexOf('?') == -1) {
                return newUrl + '?page=' + pageNum 
            }
            
            return newUrl + '&page=' + pageNum
        }
    }

    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover'
        })
    }

})()
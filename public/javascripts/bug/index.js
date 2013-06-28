(function() {
    function fetchOpenBugList() {
        $.ajax({
            url         : '/tasks/' + getTaskId() + '/bugs',
            data        : { closed : false },
            beforeSend  : function() {
                $('#bugList').hide()
                $('#fetchBugProgress').show()
            },
            success : function(data) {
                if (data.ok !== 1) {
                    $('#fetchBugProgress').hide()
                    alert(data.msg)
                    return
                }

                displayBugs(data.bugs)
            }
        })
    }

    function displayBugs(bugs) {
        $('#bugList tbody').empty()

        bugs.forEach(function(item, index) {
            $('#bugList tbody').append('<tr><td class="index">' 
                + (bugs.length - index)
                + '</td><td><a href="/tasks/'
                + getTaskCustomId()
                + '/bugs/'
                + item._id
                + '">'
                + item.name 
                + '</a></td><td><span class="label bug-status">'
                + item.status
                + '</span></td><td>'
                + item.score
                + '</td><td>'
                + item.level
                + '</td><td>'
                + ((item.programmer&&item.programmer.name) || "无")
                + '</td><td>'
                + (item.updated_time.length > 16? item.updated_time.substring(5) : item.updated_time)
                + '</td><td>'
                + item.operator.name
                + '</td><td>'
                + showProperStatusBtn(item.status)
                + '</td><td><span class="badge">'
                + item.comments.length
                + '</span></td><td><i class="icon-picture" title="预览"></i><i class="icon-edit" title="编辑"></i>'
                + '</td></tr>')
            $('#bugList tbody tr:last').data(item)
        })   

        $('#bugList').show()
        $('#fetchBugProgress').hide()

        displayBugCount()
        app.viewhelper.markDifferentColorToBugStatus($('.bug-status'))
    }

    function showProperStatusBtn() {
        var role    = localStorage.getItem("userRole");
            html    = ''            

        function insertStatusBtn(name, btnclass) {
            if (html.indexOf(name) === -1) {
                html = html + '<button class="btn btn-mini '+ btnclass +'">' + name +'</button>'
            }
        }

        if (role.indexOf('Programmer') > -1) {
            insertStatusBtn('解决中', 'btn-warning')
            insertStatusBtn('已解决', 'btn-info')
            insertStatusBtn('挂起', 'btn-inverse')
        }

        if (role.indexOf('Tester') > -1) {
            insertStatusBtn('未解决', 'btn-danger')
            insertStatusBtn('测试通过', 'btn-success')
            insertStatusBtn('挂起', 'btn-inverse')
        } 

        insertStatusBtn('挂起', 'btn-inverse')

        return '<div class="btn-group change-bug-status">' + html + '</div>'

    }

    function displayBugCount() {
        var bugCount = {}

        $('#bugFilter button').each(function() {
            $(this).find('strong').remove()
            bugCount[$(this).text()] = 0
        })

        $('#bugList tbody tr').each(function() {
            bugCount[$(this).data('status')]++
        })

        bugCount['全部'] = $('#bugList tbody tr').size()

        $('#bugFilter button').each(function() {
            var count = bugCount[$(this).text()]
            $(this).append('<strong>' + count + '</strong>')
        })
    }

    function filterBugs($btn) {
        var statusName = $btn.find('span').text()

        if ($btn.hasClass('active')) {
            return
        }

        if ($btn.html() ===  $('#bugFilter button:first').html()) {
            fetchOpenBugList()
            return
        }

        $('#bugList tbody tr').each(function() {
            if (statusName === $(this).data('status')) {
                $(this).show()
            } else {
                $(this).hide()
            }
        })
    }

    function showBugPreview($btn) {
        var bugInfo = $btn.parent().parent().data()
        $('#previewBugModal h3').html(bugInfo.name)
        $('#previewBugModal .modal-body').html(bugInfo.content)
        $('#previewBugModal').modal()

    }

    function startChangeBugStatus($btn) {
        var status  = $btn.text(),
            $tr     = $btn.parent().parent().parent(),
            bugInfo = $tr.data();


        $.ajax({
            type        : 'put',
            url         : '/tasks/' + bugInfo.task_id + '/bugs/' + bugInfo._id + '/change-status',
            data        : {status : status},
            beforeSend  : function() {
                $('#fetchBugProgress').show()
            },
            success     : function(data) {
                $('#fetchBugProgress').hide()

                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }
                $tr.find('.bug-status').html(status)
                $tr.data('status', status)
                displayBugCount()
                app.viewhelper.markDifferentColorToBugStatus($('.bug-status'))

                if (!$('#bugFilter button:first').hasClass('active')) {
                    $tr.hide()
                }
            }
        })
    }

    function getTaskCustomId() {
        return $('.list-header header').data('custom-id')
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function eventBind() {    

        $('#bugFilter button').click(function() {
            filterBugs($(this))
        })

        //preview bug
        $('#bugList tbody').delegate('tr i.icon-picture', 'click', function(event) {
            showBugPreview($(this))
        })

        //change bug status
        $('#bugList tbody').delegate('.change-bug-status button', 'click', function(event) {
            startChangeBugStatus($(this))
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('Bug')
        fetchOpenBugList()
        eventBind()
    })
})()
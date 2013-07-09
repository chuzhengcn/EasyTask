(function() {
    function saveReview($btn) {
        var sendToServerDate = {},
            key              = '',
            isValide         = true;

        $('#reviewForm input').each(function() {
            var name = $(this).attr('name')

            if (name in sendToServerDate) {
                return
            }

            if ($(this).attr('type') === 'radio') {
                sendToServerDate[name] = $('#reviewForm input[name="'+ name +'"]:checked').val()
            } else {
                sendToServerDate[name] = $(this).val()                
            }
        })

        for (key in sendToServerDate) {
            if (!sendToServerDate[key]) {
                isValide = false
                break
            }
        }

        sendToServerDate.description = $('#reviewForm textarea').val()

        if (!isValide) {
            alert('所有选项必填')
            return
        }

        $.ajax({
            type        : 'put',
            url         : $('#reviewForm').attr('action'),
            data        : sendToServerDate,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }
                alert('编辑成功')
                location.href = location.href
            }
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('代码检视')

        $('#saveReviewBtn').click(function(event) {
            saveReview($(this))
            event.preventDefault()
        })

    })

})()
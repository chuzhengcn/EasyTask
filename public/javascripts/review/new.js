(function() {
    function saveReview($btn, $form) {
        var sendToServerDate = {},
            key              = '',
            isValide         = true;

         $form.find('input').each(function() {
            var name = $(this).attr('name')

            if (name in sendToServerDate) {
                return
            }

            if ($(this).attr('type') === 'radio') {
                sendToServerDate[name] = $form.find('input[name="'+ name +'"]:checked').val()
            } else {
                sendToServerDate[name] = $(this).val()                
            }
        })

        sendToServerDate.description = $form.find('textarea').val()

        for (key in sendToServerDate) {
            if (!sendToServerDate[key]) {
                isValide = false
                break
            }
        }

        if (!isValide) {
            alert('所有选项必填')
            return
        }

        $.ajax({
            type        : 'post',
            url         : $form.attr('action'),
            data        : sendToServerDate,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }
                alert('添加成功')
                location.href = location.href.split('?')[0] + '?type=' + sendToServerDate.type
            }
        })
    }

    function deleteReview($btn) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }

        $.ajax({
            type        : 'delete',
            url         : $btn.attr('href'),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert('删除失败，刷新页面后重试')
                }

                location.href = location.href.split('?')[0] + '?type=' + $btn.data('type')
            } 
        })
    }

    function bindSaveReview($btn, $form) {
        $btn.click(function(event) {
            saveReview($btn, $form)
            event.preventDefault()
        }) 
    }

    function setTab() {
        var tabTypeValue,
            targetId;

        $('#reviewTab a').click(function(event) {
            event.preventDefault()

            $(this).tab('show')
        })

        tabTypeValue = app.utility.get_query_value('type')

        if (!tabTypeValue) {
            $('#reviewTab a:first').tab('show')
            return
        }

        targetId = $('input[value="'+ tabTypeValue +'"]').parent().parent().attr('id')

        $('#reviewTab a[href="#'+ targetId +'"]').tab('show')

    }

    function addAllReview($btn) {
        var isValide            = true,
            reviewGroup         = [],
            sendToServerDate    = {};

        $('.review-item').each(function() {
            if ($(this).find('input:checked').length !== 1) {
                isValide = false
            }
        })

        if (!isValide) {
            alert('要给每个人都打分')
            return
        }

        $('.review-item').each(function() {
            var $self = $(this),
                name  = $self.find('input:checked').data('name'),
                item  = {};

            item.user_id = $self.find('h5').data('user-id')
            item.description = ''
            item.content = {}
            item.content[name] = $self.find('input:checked').val()

            reviewGroup.push(item)
        })
        sendToServerDate.group = reviewGroup
        sendToServerDate.type  = $('#type3Form input[name="type"]').val()

        $.ajax({
            url         : $('#type3Form').attr('action'),
            type        : 'post',
            data        : sendToServerDate,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert('删除失败，刷新页面后重试')
                }
                location.href = location.href.split('?')[0] + '?type=' + sendToServerDate.type
            }
        })

    }

    function caculateScore($btn) {
        if (!app.utility.isValidForm('caculateForm')) {
            alert('开始结束时间必填')
            return
        }

        $.ajax({
            type : 'post',
            data : $('#caculateForm').serialize(),
            url  : $('#caculateForm').attr('action'),
            beforeSend : function() {
                app.utility.isWorking($btn)
            },
            success : function(data) {
                $btn.removeClass('disabled').text('计算')
                if (data.ok !== 1) {
                    alert(data.msg)
                }

                $('#scoreResult h3').html('总分：' + data.finalScore)
                $('#scoreResult span.label').html(data.beginTime + '--' + data.endTime)
                $('#scoreDetail').empty()
                data.scoreGroup.forEach(function (item, index) {
                    $('#scoreDetail').append('<dt>' + item.name +'</dt>')
                    $('#scoreDetail').append('<dd>' + item.score +'</dd>')
                })
            }
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('评价')

        bindSaveReview($("#saveType1Btn"), $('#type1Form'))
        bindSaveReview($("#saveType2Btn"), $('#type2Form'))
        bindSaveReview($("#saveType4Btn"), $('#type4Form'))
        bindSaveReview($("#saveType5Btn"), $('#type5Form'))

        $('.delete-review-btn').click(function(event) {
            deleteReview($(this))
            event.preventDefault()
        })

        $('#saveType3Btn').click(function(event) {
            addAllReview($(this))
            event.preventDefault()
        })

        setTab()  

        $('#caculateForm').submit(function(event) {
            caculateScore($('#caculateBtn'))
            event.preventDefault()
        })    
    })

})()
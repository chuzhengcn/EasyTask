exports.project = [{name : 'nycs.syyx.com'}, {name : 'adminnycs.syyx.com'}, {name : 'events.syyx.com'},
                   {name : 'user.syyx.com'}, {name : 'r.syyx.com'}, {name : 'party.syyx.com'},
                   {name : 'adminparty.syyx.com'},{name : 'others'},{name : 'unknown'}]

exports.statusNames = ['需求提交','任务已分配','开发已完成','已提交Dev','已提交Test','已提交Master',
                       '测试拒绝','Dev测试通过','Test测试通过','Master测试通过','已发布外网','已验收通过']

exports.role = ['PM','Programmer','Tester', 'Customer']

exports.branch = ['master','test', 'dev', 'release']

exports.bugType = ['测试Bug', '现网Bug']

exports.bugStatus = ['未解决', '解决中', '已解决', '测试通过', '挂起']

exports.bugLevel = ['C', 'B', 'A']

exports.rating = [{name : '满意', score : 50}, {name : '一般', score : 30}, {name : '不满意', score : 10}]

exports.review = {
    'type1' : {
        description : '周考评',
        standards   : {
            workflow        : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '流程规范',
            },

            code_standards   : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '编码规范',
            },
            clear_code   : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '清晰度与通用度',
            },
        }
    }
}

exports.logType = {
    '1' : '新建任务',
    '2' : '编辑任务',
    '3' : '删除任务',
    '4' : '把任务存档',
    '5' : '重新激活任务',
    '6' : '添加了时间点',
    '7' : '更新了时间点',
    '8' : '删除了时间点',
    '9' : '修改任务状态',
    '10': '添加了附件',
    '11': '回退了任务状态',
    '12': '添加了bug',
    '13': '修改了bug状态',
    '14': '添加了bug评论',
    '15': '修改了bug',
    '16': '添加了文档',
    '17': '添加了文档评论',
    '18': '删除了文档',
    '19': '删除了Bug',
    '20': '修改了文档',
    '21': '评价了该任务',
    '22': '修改了任务评价',
    '23': '删除了任务评价',
} 

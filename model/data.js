exports.project = [{name : 'nycs.syyx.com'}, {name : 'adminnycs.syyx.com'}, {name : 'events.syyx.com'},
                   {name : 'user.syyx.com'}, {name : 'r.syyx.com'}, {name : 'party.syyx.com'},
                   {name : 'adminparty.syyx.com'}]

exports.statusNames = ['需求提交','任务已分配','开发已完成','已提交Dev','已提交Test','已提交Master',
                       '测试拒绝','Dev测试通过','Test测试通过','Master测试通过','已发布外网','验收通过']

exports.role = ['PM','Programmer','Tester','Designer', 'Customer']

exports.branch = ['master','test', 'dev', 'release']

exports.bugType = ['测试Bug', '现网Bug']

exports.bugStatus = ['未解决', '已解决', '测试通过', '挂起']

exports.bugLevel = ['C', 'B', 'A']

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
} 

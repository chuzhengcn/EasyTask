exports.project = [{name : 'adminnycs.syyx.cn'}, 
                   {name : 'adminparty.syyx.cn'}, {name : 'adminres.syyx.cn'},
                   {name : 'appdm.syyx.cn'}, {name : 'caiwu.syyx.cn'}, {name : 'di.syyx.com'},
                   {name : 'events.syyx.com'}, {name : 'finance.syyx.cn'}, {name : 'fn.syyx.com'},
                   {name : 'fn2.syyx.com'}, {name : 'gamecards.syyx.cn'}, {name : 'ggfx.syyx.cn'},
                   {name : 'hr.sygame.com'}, {name : 'if.syyx.cn'}, {name : 'kf.syyx.cn'},
                   {name : 'nycs.syyx.com'}, {name : 'nycsdm.syyx.cn'}, {name : 'party.syyx.com'},
                   {name : 'payvip.syyx.com'}, {name : 'r.syyx.com'}, {name : 'service.syyx.com'},
                   {name : 'stat.syyx.com'},{name : 'stat2.syyx.com'}, {name : 'vip.syyx.com'},
                   {name : 'user.syyx.com'}, {name : 'safe.syyx.com'},{name : 'pay.syyx.com'},
                   {name : 'fwg.syyx.cn'}, {name : 'ad.syyx.cn'},{name : 'adminpay.syyx.cn'},
                   {name : 'kfwg.syyx.cn'},{name : 'jbl.syyx.com'},{name : 'nycs.jbl.syyx.com'},
                   {name : 'z.syyx.com'}, {name : 'others'}, {name : 'unknown'}]

exports.statusNames = ['需求提交','任务已分配','开发已完成','已提交Dev','已提交Test','已提交Master','已提交Release',
                       '测试拒绝','Dev测试通过','Test测试通过','Master测试通过','Release测试通过','已发布外网','已验收通过']

exports.role = ['PM','Programmer','Tester', 'Customer']

exports.branch = ['master','test', 'dev', 'release']

exports.bugType = ['测试Bug', '现网Bug']

exports.bugStatus = ['未解决', '解决中', '已修改', '已解决', '挂起']

exports.bugScore  = [{name : '1', score : 1},{name : '5', score : 5},{name : '10', score : 10},{name : '20', score : 20},]

exports.bugLevel = ['C', 'B', 'A']

exports.rating = [{name : '很好', score : 7}, {name : '好', score : 5}, {name : '一般', score : 3}, {name : '差', score : 1}, {name : '很差', score : 0}]

exports.manager = [{ip : '192.168.10.142'},{ip : '192.168.3.32'}]

exports.admin  = [{ip : '192.168.3.32'},{ip : '192.168.3.22'},{ip : '192.168.3.34'}]

exports.review = {
    'type1' : {
        description : '代码检视',
        standards : {
            code_standards : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '编码规范',
            },
            clear_code : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '清晰度与通用度',
            },
        }
    },
    'type2' : {
        description : '季度考评',
        standards   : {
            improvement : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '个人成长',
            },
            focus_result_1 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '从公司目标的意义出发',
            },
            focus_result_2 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '关注事情的各个环节',
            },
            focus_result_3 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '关注细节',
            },
            focus_result_4 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '锲而不舍',
            },
            focus_user_1 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}],
                name    : '清楚用户是谁',
            },
            focus_user_2 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '与用户经常沟通',
            },
            focus_user_3 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '知道用户究竟想要什么',
            },
            focus_user_4 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '从用户角度思考问题',
            },
            communicate_1 : {
                level   : [{score : 1, name : '0'}, {score : 1, name : '1'}],
                name    : '及时沟通',
            },
            communicate_2 : {
                level   : [{score : 1, name : '0'}, {score : 1, name : '1'}],
                name    : '清晰表达',
            },
            communicate_3 : {
                level   : [{score : 1, name : '0'}, {score : 1, name : '1'}],
                name    : '求真不求胜',
            },
            communicate_4 : {
                level   : [{score : 1, name : '0'}, {score : 1, name : '1'}],
                name    : '坦诚直接',
            },
            communicate_5 : {
                level   : [{score : 1, name : '0'}, {score : 1, name : '1'}],
                name    : '理解与倾听',
            },
            share_1 : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}],
                name    : 'rtx等简单分享',
            },
            share : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : 'wiki分享',
            },
            share : {
                level   : [{score : 0, name : '0'}, {score : 1, name : '1'}, {score : 2, name : '2'}],
                name    : '会议分享',
            },

        }
    },
    'type3' : {
        description : '团队贡献',
        standards   : {
            contribution : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, 
                           {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '团队贡献',
            },
        }
    },
    'type4' : {
        description : '流程规范',
        standards   : {
            workflow : {
                level   :  [{score : 1, name : '1'}, {score : 2, name : '2'}, {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '流程规范',
            },
        }
    },
    'type5' : {
        description : '创新',
        standards   : {
            creative : {
                level   : [{score : 1, name : '1'}, {score : 2, name : '2'}, {score : 3, name : '3'}, {score : 4, name : '4'}, {score : 5, name : '5'}],
                name    : '创新',
            },
        }
    },
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

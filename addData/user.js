// 新增userinfo 表数据

// 导入表规则对象使用
const userinfoDB = require('../schemas/userinfo')

userinfoDB.create({
    username: '溪亭',
    password: 'xt123456',
    admin: true
})
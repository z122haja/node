const expressSession = require('express-session')
const connectMongo= require('connect-mongo')

//此函数作用：相当于设置一个cookie
//  res.cookie("$xit","hklsa;oescs","{maxAge:1000*60*60}")
module.exports = expressSession({
    name:'$xit',
    secret:'dwkfflw',     // 结合此内容生成秘钥
    cookie:{maxAge:1000*60*60},

    //向服务端发送请求后是否重置cookie时间  建议true
    rolling:true,
    
    //是否强制重新保存session
    resave:false,

    //是否在session还未初始化时就存储session  建议true
    saveUninitialized:true,

    //session存入数据库
    store:connectMongo.create({
        mongoUrl:'mongodb://127.0.0.1:27017/cms'
    })
})
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')

// 连接数据库
require('./middle/mongoose')

// json格式解析
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('./dist'))
// cookie解析
app.use(cookieParser())
// 使用session中间件
app.use(require('./middle/session'))

// 添加数据
require('./addData')

app.use('/', require('./router'))

app.listen(5252, () => {
    console.log('http://localhost:5252');
})
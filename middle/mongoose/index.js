const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/cms', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('连接数据库成功');
    })
    .catch(() => {
        console.log('连接数据库失败');
    })
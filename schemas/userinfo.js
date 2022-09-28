// 创建 userinfo表规则
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const Schema = mongoose.Schema

const userSchema = new Schema({
    // 姓名
    username: {
        type: String,
        require: true,
        unique: true
    },
    // 密码
    password: {
        type: String,
        require: true,
        // 存入密码的同时转为加密值存入数据库  第三方包  bcryptjs
        set: function (value) {
            return bcryptjs.hashSync(value, 10)
        }
    },
    // 是否管理员
    admin: {
        type: Boolean,
        default: false
    },
    // 头像
    photo:{
        type:String,
        default:'/images/huabanimg.gif'   // 默认图片
    }
})

// 创建表并导出
module.exports = mongoose.model('userinfo', userSchema)
const express = require('express')
const router = express.Router()
const studentDB = require('../../schemas/student')
const path = require('path')

// 获取学员列表
router.get('/studentList', async (req, res) => {
    // 前端需要  具体页数currentPage  具体的数据条数pageSize  筛选项：kindName(类别) courseName(课程) className(班期)
    const {
        kindName,
        courseName,
        className,
        currentPage,
        pageSize
    } = req.query
    console.log(
        kindName,
        courseName,
        className,
        currentPage,   // 1 页码
        pageSize  // 10  一页的当前页的数据
    );

    let data = await studentDB.find()

    // 根据筛选条件进行数据的一轮筛选
    if (kindName) {     // 有传值的时候走进来
        data = data.filter((item) => item.kindName === kindName)
    }

    if (courseName) {
        data = data.filter((item) => item.courseName === courseName)
    }

    if (className) {
        data = data.filter((item) => item.className.includes(className))
    }

    // 按照更新时间倒序排序
    data.sort((a, b) => {
        return b.updateTime - a.updateTime;   // 倒序排序
    })

    // 总数
    const total = data.length;

    // 根据页码以及当前页的数据来剪切数据  返回splice剪切下来的数组 
    data = data.splice((currentPage - 1) * pageSize, pageSize)

    // console.log(data.length);

    res.send({
        code: 0,
        data,
        total
    })
})

// 获取课程分类对象
router.get('/courseObj', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dataJson/courseObj.json'))
})

// 修改学员信息
router.post('/reviseStudent', async (req, res) => {
    // 前端传来的信息：
    //{
    // "phoneNumber": '',   // 查询对象
    // "name": "",
    // "wechat": "",
    // "QQ": "",
    // "card": "",
    // "age": "",
    // "sex": "",
    // "location": "",   // 前端传来的可能是 ['河北省','唐山市']
    // "education": ""
    // }
    const student = req.body;

    if (Array.isArray(student.location)) {
        // 是数组形式 ['河北省','唐山市'] ==>  '河北省/唐山市'
        student.location = student.location.join('/')
    }

    await studentDB.updateOne({ phoneNumber: student.phoneNumber }, { info: student })

    res.send({
        code: 0,
        txt: '修改成功'
    })
})

// 修改学员班期
router.post('/reviseStudentClass', async (req, res) => {
    const { className, phoneNumber } = req.body

    await studentDB.updateOne({ phoneNumber }, { className })

    res.send({
        code: 0,
        txt: '修改成功'
    })
})

// 修改课程是否启用
router.post('/reviseIsEnable', async (req, res) => {
    const { phoneNumber, isEnable } = req.body

    await studentDB.updateOne({ phoneNumber }, { isEnable: !isEnable })

    let txt = '';

    if(isEnable){
        txt = '关闭成功'
    }else{
        txt = '启用成功'
    }

    res.send({
        code: 0,
        txt
    })
})



module.exports = router

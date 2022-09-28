const express = require('express')
const router = express.Router()

const courseDB = require('../../schemas/course')
const upload = require('../../middle/multer/coverImage')

const path = require('path')

// 获取课程列表
router.get('/courseList', async (req, res) => {
    const {
        kindName,
        courseName,
        currentPage,
        pageSize
    } = req.query

    let data = await courseDB.find()

    // 筛选类别
    if (kindName) {
        data = data.filter(item => item.kindName === kindName)
    }

    // 筛选课程
    if (courseName) {
        data = data.filter(item => item.courseName.includes(courseName))
    }

    // 按照更新数据倒序排序
    data.sort((a, b) => {
        return b.updateTime - a.updateTime
    })

    // 总数
    const total = data.length

    // 返回splice切下来的数组
    data = data.splice((currentPage - 1) * pageSize, pageSize)

    res.send({
        code: 0,
        data,
        total
    })
})

// 修改基础课程信息
router.post('/reviseCourseBase', async (req, res) => {
    const {
        courseName,
        downPrice,
        originalPrice,
        sellingPrice
    } = req.body

    courseDB.findOneAndUpdate({ courseName }, { downPrice, originalPrice, sellingPrice })
        .then(data => {
            // 修改成功
            res.send({
                code: 0,
                txt: '修改课程信息成功'
            })
        })
        .catch(err => {
            // 修改不成功
            res.send({
                code: 1,
                txt: '修改课程信息失败'
            })
        })
})

// 修改课程封面
router.post('/reviseCourseCover', upload.single('file'), async (req, res) => {
    const {
        courseName,
        description
    } = req.body

    if (description) {
        // 有描述走进来
        courseDB.findOneAndUpdate({ courseName }, { description }).then(() => { })

        res.send({
            code:0,
            txt:'修改描述信息成功'
        })
    }

    if (req.file) {
        // 有上传文件的时候走进来
        let coverImage = `/images/coverImage/${req.file.filename}`

        courseDB.findOneAndUpdate({ courseName }, { coverImage }).then(() => { })

        res.send({
            code:0,
            txt:'修改封面信息成功'
        })
    }
})

module.exports = router
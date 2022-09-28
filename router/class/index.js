const express = require('express')
const router = express.Router()

const classDB = require('../../schemas/class')
const liveDB = require('../../schemas/live')

// 获取班期列表
router.get('/classList', async (req, res) => {
    const {
        currentPage,
        pageSize,
        // 班期
        className,
        // 招生时间
        enrollTime
    } = req.query

    // 深度取值
    let data = await classDB.find().populate('liveList')

    // 筛选项 要包含 招生时间 对象才能被找到
    if (enrollTime) {
        // 有数据走进来
        const startTime = enrollTime[0] / 1
        const endTime = enrollTime[1] / 1

        data = data.filter(item => {
            return startTime <= item.enrollTime[0] && endTime >= item.enrollTime[1]
        })
    }

    if (className) {
        data = data.filter(item => item.className.includes(className))
    }

    const total = data.length

    data = data.splice((currentPage - 1) * pageSize, pageSize)

    res.send({
        code:0,
        total,
        data
    })
})

module.exports = router
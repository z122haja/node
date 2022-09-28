const express = require('express')
const router = express.Router()

const classDB = require('../../schemas/class')
const liveDB = require('../../schemas/live')

// 新增直播
router.post('/addLive', async (req, res) => {
    const {
        // 直播标题
        liveName,
        // 直播时长
        liveDuration,
        // 直播讲师
        teacher,
        // 直播时间
        liveTime,
        // 班期名称
        className,
        // 课程名称
        courseName,
        _id
    } = req.body

    if (courseName && className && liveName && liveDuration && teacher && liveTime && _id) {
        // 全部都有值 才能走进来
        try {
            // 中间代码
            await liveDB.findByIdAndUpdate({ _id }, {
                $push: {
                    liveList: {
                        className,
                        courseName,
                        liveName,
                        teacher,
                        liveDuration: liveDuration / 1,    // 转成数值
                        liveTime: new Date(liveTime) / 1    // 转成毫秒值
                    }
                }
            })
        } catch (err) {
            //  对错误的处理
            return res.send({
                code: 1,
                txt: '新增直播失败'
            })
        }

        res.send({
            code: 0,
            txt: '新增直播成功'
        })
    } else {
        res.send({
            code: 2,
            txt: '新增直播失败'
        })
    }
})

// 删除直播
router.post('/deleteLive', async (req, res) => {
    const {
        // 外侧的id：找是哪个班期
        _id,
        // 内侧的id: 找删除的是哪个数组项
        id
    } = req.body

    try {
        // 通过外侧_id来找到是哪个老师的班期
        await liveDB.findByIdAndUpdate({ _id }, {
            // 找到之后通过内侧id来决定移除其直播列表中哪一项
            $pull: {
                liveList: {
                    _id: id
                }
            }
        })
    } catch (err) {
        return res.send({
            code: 1,
            txt: '删除失败'
        })
    }

    res.send({
        code: 0,
        txt: '删除成功'
    })
})

// 修改直播
router.post('/reviseLive', async (req, res) => {
    const {
        // 直播标题
        liveName,
        // 直播时长
        liveDuration,
        // 直播讲师
        teacher,
        // 直播时间
        liveTime,
        _id,  // 外层id
        id    // 内层id
    } = req.body

    if (liveName && liveDuration && teacher && liveTime && _id && id) {
        // 全部都有值 才能走进来
        const data = await liveDB.findById({ _id })

        if (data) {
            const reviseObj = data.liveList.find(item => item._id.toString() === id)

            reviseObj.liveName = liveName
            reviseObj.liveDuration = liveDuration
            reviseObj.teacher = teacher
            reviseObj.liveTime = liveTime

            // 将改变的值应用到数据库
            liveDB.findByIdAndUpdate({ _id }, { liveList: data.liveList })
                .then(() => {
                    res.send({
                        code: 0,
                        txt: '修改直播成功'
                    })
                })
                .catch(() => {
                    res.send({
                        code: 1,
                        txt: '修改直播失败'
                    })
                })
        }

    } else {
        res.send({
            code: 2,
            txt: '修改直播失败'
        })
    }
})

// 获取直播
router.get('/liveList', async (req, res) => {
    const {
        liveName,
        liveTime,
        currentPage,
        pageSize
    } = req.query

    let data = await liveDB.find()

    data = data.filter(item => item.liveList[0].className === 'web-前端进阶框架-朱雀')[0]

    // 筛选时间
    if (liveTime) {
        let startTime = new Date(liveTime[0]) / 1
        let endTime = new Date(liveTime[1]) / 1

        data.liveList = data.liveList.filter(item => item.liveTime >= startTime && item.liveTime <= endTime)
    }

    // 筛选直播名
    if (liveName) {
        data.liveList = data.liveList.filter(item => item.liveName.inclouds(liveName))
    }

    const total = data.liveList.length

    data.liveList = data.liveList.sort((a, b) => b.liveTime - a.liveTime)

    data.liveList = data.liveList.splice((currentPage - 1) * pageSize, pageSize)

    res.send({
        code: 0,
        total, data
    })
})

module.exports = router
const express = require('express')
const router = express.Router()

const articleDB = require('../../schemas/article')

// 新增文章
router.post('/addArticle', async (req, res) => {
    const {
        title,
        description,
        content
    } = req.body

    if (!title || !description || !content) {
        // 说明有空值  有一个空值都会走进来
        return res.send({
            code: 1,
            txt: '文章创建失败'
        })
    }

    let data = await articleDB.find()

    await articleDB.create({
        title,
        content,
        description,
        author: 'queque',
        date: Date.now(),
        rank: data.length + 1
    })

    res.send({
        code: 0,
        txt: '文章创建成功'
    })
})

// 获取文章
router.get('/articleList', async (req, res) => {
    const {
        pageSize,
        currentPage
    } = req.query

    let data = await articleDB.find()

    const total = data.length

    data = data.sort((a, b) => {
        return a.rank - b.rank
    })

    data = data.splice((currentPage - 1) * pageSize, pageSize)

    res.send({
        code: 0,
        total,
        data
    })
})

// 修改文章排名
router.post('/reviseRank', async (req, res) => {
    const {
        // 被拖拽的
        man,
        // 被挤开的
        woman
    } = req.body

    let manRank = man.rank
    let womanRank = woman.rank

    await articleDB.findByIdAndUpdate({ _id: man._id }, { rank: womanRank })

    await articleDB.findByIdAndUpdate({ _id: woman._id }, { rank: manRank })

    res.send({
        code: 0,
        txt: "排序成功"
    })
})

// 删除文章
router.post('/deleteArticle', async (req, res) => {
    const { _id } = req.body

    const data = await articleDB.find()

    // 找到删除项的下标
    const deleteIndex = data.findIndex(item => item._id.toString() === _id)
    // console.log(deleteIndex);

    // 取出删除项之后的所有项
    let reviseArr = data.slice(deleteIndex + 1)

    // 遍历reviseArr并将其rank减1
    reviseArr.forEach(async item => {
        await articleDB.findByIdAndUpdate({ _id: item._id }, { rank: item.rank - 1})
    })

    await articleDB.findByIdAndDelete({_id})

    res.send({
        code: 0,
        txt: '删除文章成功'
    })
})

module.exports = router
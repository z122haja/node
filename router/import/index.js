const express = require('express')
const router = express.Router()
const path = require('path')

const xlsx = require('node-xlsx')

const upload = require('../../middle/multer/importFile')
const fs = require('fs')

const iconvLite = require('iconv-lite')
const studentDB = require('../../schemas/student')
const importDB = require('../../schemas/import')

// 下载模板
router.get('/template', async (req, res) => {
    // download配合前端的a标签使用
    res.download(path.join(__dirname, '../../dist/excel/模板.xlsx'), (err) => {
        if (err) throw err
    })
})

// 导入文件
router.post('/student', upload.single('file'), (req, res) => {
    // console.log(req.file);

    // xlsx.parse() 接收一个表格的路径 解析一个对象出来
    // 返回第一张表中有数据的
    const arr = xlsx.parse(req.file.path)[0].data.filter(item => item.length)
    // console.log(arr);
    // property用来筛选出 中文属性 并替换成 英文属性
    const property = {
        手机号: 'phoneNumber',
        课程分类: 'kindName',
        课程名称: 'courseName',
        班期名称: 'className',
        是否开通权限: 'isEnable',
        姓名: 'name',
        微信: 'wechat',
        QQ: 'QQ',
        身份证号: 'card',
        年龄: 'age',
        性别: 'sex',
        地址: 'location',
        学历: 'education'
    }
    /* 
        [
            [
                '*手机号',      '*课程分类',
                '*课程名称',    '*班期名称',
                '是否开通权限', '姓名',
                '微信',         'QQ',
                '身份证号',     '年龄',
                '地址',         '学历',
                '性别'
            ],
            [ 19714085053, '后端', 'Python全栈开发', '6-7全栈开发班', '是' ],
            [ 19076247859, '前端', 'web前端全栈进阶班', 'web-前端进阶框架-朱雀', '是' ]
        ]
    */
    // 把表(arr)中的第一行数据由中文替换成英文
    let header = arr[0].map(item => {
        // 去除*号
        item = item.replace('*', '')
        // '*手机号' ==> 'phoneNumber'
        return property[item]
    })
    // console.log(header);

    // 数据主体 除了表头以外的其他数据
    let result = arr.slice(1)
    // console.log(result);

    let total = result.length;

    if (!total) {
        // total为0的时候走进来
        return res.send({
            code: 1,
            txt: '空表无数据'
        })
    }
    // 有数据继续往下走
    /*  
        格式化student对象  [{...},{...}] 

        phoneNumber: 19076247859,
        kindName: '前端',
        courseName: 'web前端全栈进阶班',
        className: 'web-前端进阶框架-朱雀',
        isEnable: true,
        name: undefined,
        wechat: undefined,
        QQ: undefined,
        card: undefined,
        age: undefined,
        location: undefined,
        education: undefined,
        sex: undefined
    */
    let resultStudent = []

    for (let i = 0; i < result.length; i++) {
        let student = {}

        for (let j = 0; j < header.length; j++) {
            // 需要对isEnable中的'是'进行处理
            if (header[j] === 'isEnable') {
                student[header[j]] = result[i][j] === '是' ? true : false
            } else {
                student[header[j]] = result[i][j]
            }
        }

        resultStudent.push(student)
    }

    // console.log(resultStudent);

    // 记录不符合规范的 student对象 以及数据库添加失败的student对象
    let errorStudent = []

    // 符合规范的student  必填项都有的
    let successStudent = []

    // 记录数据库真正添加成功的student
    let succeedStudent = []

    let reg = /^(\d{11})$/

    let courseObj = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dataJson/courseObj.json')))

    for (let k = 0; k < resultStudent.length; k++) {
        // 对里面每一个对象进行规则筛选

        if (!resultStudent[k].phoneNumber && !resultStudent[k].kindName && !resultStudent[k].courseName && !resultStudent[k].className) {
            // 如果每个项目都为空 那么有可能这个表不对
            return res.send({   // 结束响应
                code: 2,
                txt: "表格格式不对，请按照模板要求填写"
            })
        }

        if (!resultStudent[k].phoneNumber || !resultStudent[k].kindName || !resultStudent[k].courseName || !resultStudent[k].className) {
            // 只要一个为空 就可以走进来
            resultStudent[k].reason = '缺少必填项'
            errorStudent.push(resultStudent[k])
            continue
        }

        if (!reg.test(resultStudent[k].phoneNumber)) {
            // 手机号码不符合规则走进来
            resultStudent[k].reason = '手机号不符合规则'
            errorStudent.push(resultStudent[k])
            continue
        }

        // kindName类别是否是前端/后端
        const kindNameIndex = courseObj.kindName.findIndex(item => {
            // item 数组项  条件为true 返回当前item的index（就算有多个满足条件 也只找第一个）  条件全为false 返回-1
            return resultStudent[k].kindName === item.value
        })

        if (kindNameIndex === -1) {
            // 说明项目的分类不符合规则
            resultStudent[k].reason = '项目分类不符合规则'
            errorStudent.push(resultStudent[k])
            continue
        }

        const courseNameArr = courseObj.kindName[kindNameIndex].courseName

        const courseNameIndex = courseNameArr.findIndex(item => {
            // item 数组项  条件为true 返回当前item的index（就算有多个满足条件 也只找第一个）  条件全为false 返回-1
            return resultStudent[k].courseName === item.value
        })

        if (courseNameIndex === -1) {
            // 说明课程名称不在指定的分类中
            resultStudent[k].reason = '课程不在指定的分类中'
            errorStudent.push(resultStudent[k])
            continue
        }

        const classNameArr = courseNameArr[courseNameIndex].className

        if (!classNameArr.includes(resultStudent[k].className)) {
            // 班期名称不在指定的课程中
            resultStudent[k].reason = '班期名称不在指定的课程中'
            errorStudent.push(resultStudent[k])
            continue
        }

        // 现在是符合规则的student对象
        successStudent.push(resultStudent[k])
    }

    // 存到数据库中
    function addStudent() {
        const promiseAll = []

        successStudent.forEach(item => {
            promiseAll.push(new Promise((resolve, reject) => {
                studentDB.create({
                    phoneNumber: item.phoneNumber,
                    kindName: item.kindName,
                    courseName: item.courseName,
                    className: item.className,
                    origin: '后台导入',
                    updatePeople: 'queque',
                    updateTime: Date.now(),
                    isEnable: item.isEnable,
                    info: {
                        phoneNumber: item.phoneNumber,
                        name: item.name,
                        wechat: item.wechat,
                        QQ: item.QQ,
                        card: item.card,
                        age: item.age,
                        location: item.location,
                        education: item.education,
                        sex: item.sex
                    }
                }).then(() => {
                    // 数据上传成功
                    succeedStudent.push(item)
                    resolve()
                }).catch(() => {
                    item.reason = '手机号重复'
                    errorStudent.push(item)
                    resolve()
                })
            }))
        })

        return Promise.all(promiseAll)
    }

    addStudent().then(() => {
        // 说明所有的异步操作全部完成 可以进行下一步操作

        // 将文件名称转换为中文
        let filename = iconvLite.decode(req.file.originalname, 'utf8')
        // 处理信息 
        // 存入到 导入表中
        // 给前端反馈
        let status;

        let succeedNum = succeedStudent.length;
        let errNum = errorStudent.length;

        if (!succeedNum) {   //成功数组内没有数据
            // 全部失败
            status = 2
        } else if (!errNum) {    // 失败数组内没有数据
            // 全部成功
            status = 0
        } else {
            // 部分成功
            status = 1
        }

        let txt = `成功上传${succeedNum}条数据,失败${errNum}条数据`

        importDB.create({
            // 文件名
            filename,
            importPeople: 'queque',
            status,
            total,
            succeedNum,
            errNum,
            errorStudent,
            succeedStudent,
            time: Date.now()
        })

        res.send({
            code: status,
            txt
        })
    })
})

// 给前端返回导入列表
router.get('/importList', async (req, res) => {
    const {
        currentPage,
        pageSize
    } = req.query

    let data = await importDB.find()

    data.sort((a, b) => {
        return b.time - a.time
    })

    const total = data.length;

    data = data.splice((currentPage - 1) * pageSize, pageSize)

    res.send({
        code:0,
        data,
        total
    })
})



module.exports = router
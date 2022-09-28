// 新增student 表数据

// 导入表规则对象使用
const studentDB = require('../schemas/student')

// 随机取值使用
// 创建 随机整数函数
const randomNum = (num1, num2) => {
    return Math.floor(Math.random() * (num2 - num1 + 1) + num1)
}

// 创建 随机手机号
const randomPhone = () => {
    let str = '1'

    // 10个随机数字
    for (let i = 0; i < 10; i++) {
        str += randomNum(0, 9)
    }
    return str
}


const arr = [
    {
        // 类别 
        kindName: '后端',
        // 课程名
        courseName: 'Python基础核心语法',
        // 班期名
        className: [
            "55期开发基础班",
            "53期开发基础班",
            "52期开发基础班",
            "51期开发基础班"
        ]
    },
    {
        kindName: '后端',
        courseName: 'Python全栈开发',
        className: [
            "6-7全栈开发班",
            "4-28全栈开发班",
            "3-17全栈开发班"
        ]
    },
    {
        kindName: '前端',
        courseName: 'web前端基础班',
        className: [
            "三十七期javacript",
            "三十九期javacript"
        ]
    },
    {
        kindName: '前端',
        courseName: 'web前端全栈进阶班',
        className: [
            "web-前端进阶框架-朱雀",
            "web-前端进阶框架-cherry ",
            "web-前端进阶框架-丸子"
        ]
    },
]

for (let i = 0; i < 500; i++) {
    // 创建一个arr数组中随机数
    const num = randomNum(0, arr.length - 1)
    // 创建手机号
    const randomPhoneNumber = randomPhone()

    const item = arr[num]   // 取出随机对象
    // 创建arr对象中班期名随机数
    const classNum = randomNum(0, item.className.length - 1)

    studentDB.create({
        phoneNumber: randomPhoneNumber,
        kindName: item.kindName,
        courseName: item.courseName,
        className: item.className[classNum],
        updatePeople: '铁锤',
        updateTime: Date.now(), // 获取当前时间戳 
        info: {
            phoneNumber: randomPhoneNumber
        }
    })
}
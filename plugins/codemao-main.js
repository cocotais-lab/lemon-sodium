const { CocotaisBotPlugin } = require("cocotais-bot")
const axios = require("axios").default
const fse = require("fs-extra")
const plugin = new CocotaisBotPlugin("codemao-main", "1.1.1")
function banURL(url) {
    return url.replaceAll('.', '%2E')
}

function ts() {
    const sha = require('js-sha256').sha256
    let t = Date.now();
    let str = "pBlYqXbJDu" + String(Math.round(t / 1e3) - 1) + "3b55572b"
    return {
        timestamp: Math.round(t / 1e3) - 1,
        sign: sha(str).toLocaleUpperCase(),
        client_id: "3b55572b"
    }
}

plugin.onMounted((bot) => {
    console.log("官方交流群·通用 插件上线")

    plugin.command.register('/查用户', '查询编程猫用户\n    用法：@机器人 /查用户 用户ID', (type, msg, event) => {
        let uid = msg[1]
        axios.get('https://api.codemao.cn/api/user/info/detail/' + uid)
            .then((x) => {
                if (x.data.code != 200) {
                    event.reply("找不到这名训练师~")
                    return
                }
                let user = {
                    nickname: x.data.data.userInfo.user.nickname,
                    avatar: x.data.data.userInfo.user.avatar,
                    description: x.data.data.userInfo.user.description,
                    doing: x.data.data.userInfo.user.doing,
                    sex: x.data.data.userInfo.user.sex
                }
                let reply = "查询到的用户：\n"
                reply += "===============\n"
                reply += `昵称：${user.nickname} ${user.sex == 1 ? '♂' : '♀'}\n`
                reply += `个人简介：${user.description}\n`
                reply += `在做：${user.doing}\n`
                reply += "==============="
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(banURL(reply))
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[群聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)
                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(reply)
            })
    })

    plugin.command.register('/查昵称', "用昵称查询编程猫用户\n   用法：@机器人 /查昵称 用户昵称 页码(可选)", (type, msg, event) => {
        let nickname = msg[1]
        let page = msg.length >= 3 ? msg[2] : "1"
        axios.get(encodeURI(`https://udbapi.hachimlab.top/search/onlyid?nickname=${nickname}&page=${page}&limit=5`))
            .then((x) => {
                if (x.data.status !== "success") {
                    event.reply("查询失败~ 状态：" + x.data.status)
                    return
                }
                let reply = "查询到的用户：\n"
                reply += "===============\n"
                x.data.items.forEach((element, index) => {
                    reply += `${(page - 1) * 5 + index + 1}. [ID: ${element.id}] ${element.nickname}\n`
                })
                reply += "===============\n"
                let start = (page - 1) * 5 + 1
                let end = (page - 1) * 5 + x.data.items.length
                reply += `第${start}到${end}条，共${x.data.total}条。`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(banURL(reply))
            })
            .catch((e) => {
            if (e.response?.status === 404) {
                event.reply("找不到这名训练师~")
                return
            }
                let time = Date.now()
                const error = `[群聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)

                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')

                event.reply(reply)
            })
    })

    plugin.command.register('/查帖子', "查询社区帖子\n    用法：@机器人 /查帖子 关键词 页码(可选)", (type, msg, event) => {
        let title = msg[1]
        let page = msg.length >= 3 ? msg[2] : "1"
        axios.get(encodeURI(`https://api.codemao.cn/web/forums/posts/search?title=${title}&limit=5&page=${page}`))
            .then((x) => {
                let reply = "查询到的帖子：\n"
                reply += "===============\n"
                let ark_list = [];
                x.data.items.forEach((element, index) => {
                    reply += `${x.data.offset + index + 1}. [ID: ${element.id}] ${element.title} - ${element.user.nickname}\n`
                });
                reply += "===============\n"
                reply += `第${x.data.offset + 1}到${x.data.offset + x.data.items.length}条，共${x.data.total}条。`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(banURL(reply))
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[群聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)
                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(reply)
            })
    })

    plugin.command.register('/查作品', "查询社区作品(仅支持Kitten/Nemo)\n    用法：@机器人 /查作品 关键词 页码(可选)", (type, msg, event) => {
        let title = msg[1]
        let page = Number(msg.length >= 3 ? msg[2] : "1")
        page = page == NaN ? 1 : page
        axios.get(encodeURI(`https://api.codemao.cn/nemo/community/work/name/search?query=${title}&limit=5&offset=${(page - 1) * 5}`),
        {
            headers: {
                "X-Creation-Tools-Device-Auth": JSON.stringify(ts())
            }
        })
            .then((x) => {
                let reply = "查询到的作品：\n"
                reply += "===============\n"
                x.data.items.forEach((element, index) => {
                    reply += `${x.data.offset + index + 1}. [ID: ${element.id}] [${element.type}]${element.name} - ${element.user.nickname}\n`
                });
                reply += "===============\n"
                reply += `第${x.data.offset + 1}到${x.data.offset + x.data.items.length}条，共${x.data.total}条。`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(banURL(reply))
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[群聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)
                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(reply)
            })
    })
})

module.exports = plugin

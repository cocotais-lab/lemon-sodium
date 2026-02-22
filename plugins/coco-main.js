const { CocotaisBotPlugin } = require("cocotais-bot")
const axios = require("axios").default
const fse = require("fs-extra")
const plugin = new CocotaisBotPlugin("coco-main", "1.0.0")

const COCO_GROUP = require('../groups.json').coco
function banURL(url) {
    return url.replaceAll('.', '%2E')
}

plugin.onMounted((bot) => {
    console.log("官方交流群·CoCo编辑器 插件上线")

    // plugin.command.register('/查控件', "查询CoCo控件\n    用法：@机器人 /查控件 控件名", (type, msg, event) => {
    //     let title = msg[1]
    //     event.reply(
    //         `请访问https://shequ%2Epgaot%2Ecom/?mod=cocojs&key=${encodeURIComponent(title)}查看查询结果。`
    //         + fse.readFileSync("./globalnote.txt").toString('utf-8')
    //     )
    // }, {
    //     onlyTriggerAt: COCO_GROUP
    // })

    plugin.command.register('/查手册', "查询CoCo手册\n    用法：@机器人 /查手册 关键词", (type, msg, event) => {
        let title = msg[1]
        axios.get(`https://codemao-guide.yuque.com/api/zsearch?p=1&q=${title}&limit=21&sence=modal&type=content&scope=bfiekm%2Fsbo5kh&tab=book`)
            .then((x) => {
                let reply = "查询到的页面：\n"
                reply += "===============\n"
                x.data.data.hits.forEach((element, index) => {
                    if (index + 1 > 3) return
                    reply += banURL(`${index + 1}· ${element.title}\n`)
                    reply += ` - https://codemao-guide%2Eyuque%2Ecom${element.url}\n`
                });
                reply += "===============\n"
                reply += `节选第1到3条，共${x.data.data.hits.length}条。`
                reply += "要查看更多，请查阅《CoCo 手册》（网址见群公告）"
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')

                event.reply(reply)
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[Co插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)
                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(reply)
            })
    }, {
        onlyTriggerAt: COCO_GROUP
    })

    plugin.command.register("/欢迎", "向新成员发送欢迎消息\n    用法：@机器人 /欢迎 @新成员(可选)", (type, msg, event) => {
        let reply = "对新成员表示欢迎！\n"
        reply += "===============\n"
        let welcomes = fse.readJsonSync("./welcome-messages.json")
        reply += welcomes.coco
        reply += "\n===============\n"
        reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
        event.reply(reply)
    }, {
        onlyTriggerAt: COCO_GROUP
    })
})

module.exports = plugin

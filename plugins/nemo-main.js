const { CocotaisBotPlugin } = require("cocotais-bot")
const axios = require("axios").default
const fse = require("fs-extra")
const plugin = new CocotaisBotPlugin("nemo-main", "1.0.0")

const NEMO_GROUP = require('../groups.json').nemo
function banURL(url) {
    return url.replaceAll('.', '%2E')
}

plugin.onMounted((bot) => {
    console.log("官方交流群·Nemo小宇宙 插件上线")

    plugin.command.register('/查手册', "查询Nemo手册\n    用法：@机器人 /查手册 关键词", (type, msg, event) => {
        let title = msg[1]
        axios.get(`https://www.yuque.com/api/zsearch?p=1&q=${title}&limit=21&sence=modal&type=content&scope=pangguanzhejers%2Enemo_guide&tab=book`)
            .then((x) => {
                let reply = "查询到的页面：\n"
                reply += "===============\n"
                x.data.data.hits.forEach((element, index) => {
                    if (index + 1 > 3) return
                    reply += banURL(`${index + 1}. ${element.title}\n`)
                    reply += ` - https://www%2Eyuque%2Ecom${element.url}\n`
                });
                reply += "===============\n"
                reply += `节选第1到3条，共${x.data.data.hits.length}条。`
                reply += "要查看更多，请查阅《Nemo 手册》（网址见群公告）"
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')

                event.reply(reply)
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[Nemo插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                fse.appendFileSync('./error_reporting.txt', error)
                let reply = "查询失败，请稍后重试~\n"
                reply += "===============\n"
                reply += `TraceID: ${time}`
                reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                event.reply(reply)
            })
    }, {
        onlyTriggerAt: NEMO_GROUP
    })

    plugin.command.register("/欢迎", "向新成员发送欢迎消息\n    用法：@机器人 /欢迎 @新成员(可选)", (type, msg, event) => {
        let reply = "对新成员表示欢迎！\n"
        reply += "===============\n"
        let welcomes = fse.readJsonSync("./welcome-messages.json")
        reply += welcomes.nemo
        reply += "\n===============\n"
        reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
        event.reply(reply)
    }, {
        onlyTriggerAt: NEMO_GROUP
    })
})

module.exports = plugin

const { CocotaisBotPlugin } = require("cocotais-bot")
const axios = require("axios").default
const fse = require("fs-extra")
const plugin = new CocotaisBotPlugin("c2c-main", "1.1.0")
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
    console.log("私聊·通用 插件上线")
    plugin.command.register("/看帖子", "查看社区帖子详细信息\n    用法：@机器人 /看帖子 帖子ID\n    备注：帖子ID可从交流群中\"@机器人 /查帖子\"获得！",
        (type, msg, event) => {
            let id = msg[1]
            axios.get(`https://api.codemao.cn/web/forums/posts/${id}/details`)
                .then((data) => {
                    let reply = "查询到的帖子信息：\n"
                    reply += "===============\n"
                    if (data.data.is_pinned) reply += "【📌置顶】"
                    if (data.data.ask_help_flag) reply += "[求助]"
                    if (data.data.tutorial_flag) reply += "[教程]"
                    if (data.data.is_authorized) reply += "[官方]"
                    if (data.data.is_featured) reply += "[精选]"
                    if (data.data.is_hotted) reply += "[热门]"
                    reply += ' ' + data.data.title + '\n'
                    reply += `作者: ${data.data.user.nickname}(${data.data.user.id})\n`
                    reply += `时间：${new Date(data.data.created_at * 1000).toString()}\n`
                    reply += `板块：${data.data.board_name}\n`
                    reply += `👁️ ${data.data.n_views}  💬 ${data.data.n_replies + data.data.n_comments}\n`
                    reply += "=====帖子内容=====\n"
                    reply += data.data.content.replace(/<[^>]+>/g, '').substring(0, 200)
                    reply += "\n===============\n"
                    reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    event.reply(banURL(reply))
                })
                .catch((e) => {
                    if (e.response && e.response.code == 404) {
                        let reply = "找不到这个帖子哦~\n"
                        reply += "===============\n"
                        reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    }
                    let time = Date.now()
                    const error = `[私聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                    fse.appendFileSync('./error_reporting.txt', error)
                    let reply = "查询失败，请稍后重试~\n"
                    reply += "===============\n"
                    reply += `TraceID: ${time}`
                    reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    event.reply(banURL(reply))
                })
        },
        {
            availableScenes: ['c2c']
        }
    )
    plugin.command.register("/看作品", "查看社区作品详细信息\n    用法：@机器人 /看作品 作品ID\n    备注：帖子ID可从交流群中\"@机器人 /查作品\"获得！看作品支持除神岛作品之外的所有作品。",
        (type, msg, event) => {
            let id = msg[1]
            axios.get(`https://api.codemao.cn/creation-tools/v1/works/${id}`)
                .then(async (data) => {
                    let reply = "查询到的作品信息：\n"
                    reply += "===============\n"
                    reply += `[${data.data.type}]`
                    reply += ' ' + data.data.work_name + '\n'
                    reply += `作者: ${data.data.user_info.nickname}(${data.data.user_info.id})\n`
                    reply += `时间：${new Date(data.data.publish_time * 1000).toString()}\n`
                    reply += `👁️ ${data.data.view_times}  📤 ${data.data.share_times}\n`
                    reply += `❤️ ${data.data.praise_times}  🔧 ${data.data.n_tree_nodes}\n`
                    reply += `🌟 ${data.data.collect_times}  💬 ${data.data.comment_times}\n`
                    if (data.data.parent_id != 0) {
                        reply += `🧓 ${data.data.parent_id} (by ${data.data.parent_user_name})\n`
                    }
                    reply += `🔗 ${data.data.share_url ?? data.data.unify_share_url ?? data.data.player_url}\n`
                    reply += "=====作品介绍=====\n"
                    reply += data.data.description
                    reply += "\n=====操作说明=====\n"
                    reply += data.data.operation
                    reply += "\n===============\n"
                    reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    event.reply({
                        msg_type: 0,
                        content: banURL(reply),
                        msg_seq: 2
                    })
                })
                .catch((e) => {
                    if (e.response && (e.response.code == 422 || e.response.code == 404)) {
                        let reply = "找不到这个作品哦~\n"
                        reply += "可能是因为作品还未发布，或是作品ID拼写有误！\n"
                        reply += `具体原因：${e.response.data.error_message}\n`
                        reply += "===============\n"
                        reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    }
                    let time = Date.now()
                    const error = `[私聊插件][${time}][${msg.join(" ")}] ${JSON.stringify(e)}\n`
                    fse.appendFileSync('./error_reporting.txt', error)
                    let reply = "查询失败，请稍后重试~\n"
                    reply += "===============\n"
                    reply += `TraceID: ${time}`
                    reply += fse.readFileSync("./globalnote.txt").toString('utf-8')
                    event.reply(banURL(reply))
                })
        },
        {
            availableScenes: ['c2c']
        }
    )
})

module.exports = plugin
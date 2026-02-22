const { CocotaisBotPlugin } = require('cocotais-bot');
const axios = require('axios').default;
const fs = require('fs-extra')
const plugin = new CocotaisBotPlugin("kn-version","1.0.0");

const KN_GROUP = require('../groups.json').kn
let version = fs.readJsonSync('./kn-version.json')

plugin.onMounted((bot)=>{
    console.log("更新检测·KittenN编辑器 插件上线")
    let update = () => {
        console.log("更新检测·KittenN编辑器 开始检测更新")
        axios.get("https://kn.codemao.cn/editor/")
            .then((x) => {
                if (Math.abs(new Date(x.headers['last-modified']).getTime() - new Date(version.time).getTime()) > 1000 * 60 * 5) {
                    
                    version = {
                        version: x.data.match(/\/web\/(\d+\.\d+\.\d+)\/static\//)[1],
                        time: new Date(x.headers['last-modified'])
                    }
                    fs.writeJsonSync('./kn-version.json', version)
                    console.log(`更新检测·KittenN编辑器 发现新版本${version.version} 更新时间 ${version.time.toLocaleString()}`)
                    bot.groupApi.postMessage(KN_GROUP,{
                        msg_type: 0,
                        content: `当前Kitten·N版本：${version.version}\n更新时间：${version.time.toLocaleString()}`
                    })
                }
                else {
                    console.log(`更新检测·KittenN编辑器 未检测到新版本`)
                }
            })
            .catch((e) => {
                let time = Date.now()
                console.log(e)
                const error = `[KN更新][${time}][检测更新] ${JSON.stringify(e)}\n`
                fs.appendFileSync('./error_reporting.txt', error)
                console.log(`更新检测·KittenN编辑器 检测更新失败 TraceID: ${time}`)
            })
    }
    update()
    setInterval(update, 1000 * 60 * 60)
})

module.exports = plugin;

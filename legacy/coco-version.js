const { CocotaisBotPlugin } = require('cocotais-bot');
const axios = require('axios').default;
const fs = require('fs-extra')
const plugin = new CocotaisBotPlugin("coco-version","1.0.0");

const COCO_GROUP = require('../groups.json').coco
let version = fs.readJsonSync('./coco-version.json')

plugin.onMounted((bot)=>{
    console.log("更新检测·CoCo编辑器 插件上线")
    let update = () => {
        console.log("更新检测·CoCo编辑器 开始检测更新")
        axios.get("https://coco.codemao.cn/editor/")
            .then((x) => {
                if (Math.abs(new Date(x.headers['last-modified']).getTime() - new Date(version.time).getTime()) > 1000 * 60 * 5) {
                    
                    version = {
                        version: x.data.match(/https:\/\/creation\.codemao\.cn\/coconut\/web\/.*\/",/g)[0].split('/')[5],
                        time: new Date(x.headers['last-modified'])
                    }
                    fs.writeJsonSync('./coco-version.json', version)
                    console.log(`更新检测·CoCo编辑器 发现新版本${version.version} 更新时间 ${version.time.toLocaleString()}`)
                    bot.groupApi.postMessage(COCO_GROUP,{
                        msg_type: 0,
                        content: `当前CoCo版本：${version.version}\n更新时间：${version.time.toLocaleString()}`
                    })
                }
                else {
                    console.log(`更新检测·CoCo编辑器 未检测到新版本`)
                }
            })
            .catch((e) => {
                let time = Date.now()
                const error = `[Co更新][${time}][检测更新] ${JSON.stringify(e)}\n`
                fs.appendFileSync('./error_reporting.txt', error)
                console.log(`更新检测·CoCo编辑器 检测更新失败 TraceID: ${time}`)
            })
    }
    update()
    setInterval(update, 1000 * 60 * 60)
})

module.exports = plugin;

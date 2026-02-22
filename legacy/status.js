const { CocotaisBotPlugin } = require("cocotais-bot")
const plugin = new CocotaisBotPlugin("status-check", "1.0.0")

const Koa = require('koa');
const app = new Koa();

let server = null

app.use(ctx => {
    ctx.body = '🍋';
});

plugin.onMounted((bot) => {
    console.log("状态检测 插件上线")
    server = app.listen(19810);
})

plugin.onUnloaded(() => {
    if (server) server.close()
})

module.exports = plugin







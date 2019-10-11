let Koa = require('koa')
let app = new Koa()
const fs = require('fs')
const static = require('koa-static')   //静态资源服务插件
var Router = require('koa-router');
var router = new Router();
const path = require('path')
const staticPath = './src/assets'
// 配置静态web服务的中间件
app.use(static(
    path.join(__dirname, staticPath)
))

router.get('/gateway', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/getcity.json')
})
router.get('/nowPlaying', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/nowPlaying.json')
})
router.get('/comingSoon', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/comingSoon.json')
})

/*启动路由*/
app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000)
console.log('server running at http://localhost:3000')
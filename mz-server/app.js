let Koa = require('koa')
let app = new Koa()
const fs = require('fs')
const static = require('koa-static')   //静态资源服务插件
const Router = require('koa-router');

const router = new Router();
const path = require('path')
// post提交数据源
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

const staticPath = './src/assets'
// 配置静态web服务的中间件
app.use(static(
    path.join(__dirname, staticPath)
))

//引入数据库操作方法
const UserController = require('./src/controller/user');
//checkToken作为中间件存在
const checkToken = require('./src/token/checkToken');

//登录
const loginRouter = new Router();
loginRouter.post('/login', UserController.Login);
//注册
const registerRouter = new Router();
registerRouter.post('/register', UserController.Reg);

//获取所有用户
const userRouter = new Router();
userRouter.get('/user', checkToken, UserController.GetAllUsers);
//删除某个用户
const delUserRouter = new Router();
delUserRouter.post('/delUser', checkToken, UserController.DelUser);

//装载上面四个子路由
router.use('/api', loginRouter.routes(), loginRouter.allowedMethods());
router.use('/api', registerRouter.routes(), registerRouter.allowedMethods());
router.use('/api', userRouter.routes(), userRouter.allowedMethods());
router.use('/api', delUserRouter.routes(), delUserRouter.allowedMethods());

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
router.get('/filmsDetails', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/filmsDetails.json')
})
router.get('/cinemas', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/cinemas.json')
})
router.get('/act', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/act.json')
})
router.get('/banner', async (ctx) => {
    ctx.response.type = 'json'
    ctx.response.body = fs.createReadStream('./src/assets/json/banner.json')
})

/*启动路由*/
app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000)
console.log('server running at http://localhost:3000')
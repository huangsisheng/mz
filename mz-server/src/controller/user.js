//user.js
const User = require('../db.js');
//下面这两个包用来生成时间
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');
//用于密码加密
const sha1 = require('sha1');
//createToken
const createToken = require('../token/createToken.js');

//数据库的操作
//根据用户名查找用户
const findUser = (username) => {
    return new Promise((resolve, reject) => {
        User.findOne({ username }, (err, doc) => {
            if (err) {
                reject(err);
            }
            resolve(doc);
        });
    });
};
//找到所有用户
const findAllUsers = () => {
    return new Promise((resolve, reject) => {
        User.find({}, (err, doc) => {
            if (err) {
                reject(err);
            }
            resolve(doc);
        });
    });
};
//删除某个用户
const delUser = function (id) {
    return new Promise((resolve, reject) => {
        User.findOneAndRemove({ _id: id }, err => {
            if (err) {
                reject(err);
            }
            console.log('删除用户成功');
            resolve();
        });
    });
};
// 修改某个用户
const changeUser = (username, password) => {
    return new Promise((resolve,reject) => {
        User.findOneAndUpdate({ username },{ password },(error,doc) => {
            if(error){
                reject(error)
            }
            resolve(doc)
        })
    })
}
// 某个用户添加意见
const addSuggest = (username, suggest) => {
    return new Promise((resolve,reject) => {
        let arr = [{ suggestion: suggest}]
        User.insertMany(arr)
    })
}


//登录
const Login = async (ctx) => {
    //拿到账号和密码
    let username = ctx.request.body.name;
    let password = sha1(ctx.request.body.pass);//解密
    let doc = await findUser(username);
    if (!doc) {
        console.log('用户名不存在');
        ctx.status = 200;
        ctx.body = {
            code: 1,
            data:{},            
            msg:'用户名不存在',
        }
    } else if (doc.password === password) {
        console.log('密码一致!');

        //生成一个新的token,并存到数据库
        let token = createToken(username);
        console.log(token);
        doc.token = token;
        await new Promise((resolve, reject) => {
            doc.save((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        ctx.status = 200;
        ctx.body = {
            code: 0,
            success: true,
            username,
            token, //登录成功要创建一个新的token,应该存入数据库
            create_time: doc.create_time
        };
    } else {
        console.log('密码错误!');
        ctx.status = 200;
        ctx.body = {
            code: -1,
            success: false,
            msg:'密码错误'
        };
    }
};
//注册
const Reg = async (ctx) => {
    let user = new User({
        username: ctx.request.body.name,
        password: sha1(ctx.request.body.pass), //加密
        token: createToken(this.username), //创建token并存入数据库
    });
    //将objectid转换为用户创建时间(可以不用)
    user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss');

    let doc = await findUser(user.username);
    if (doc) {
        console.log('用户名已经存在');
        ctx.status = 200;
        ctx.body = {
            code: 0,
            data:{},
            msg:'用户名已经存在',
            success: false
        };
    } else {
        await new Promise((resolve, reject) => {
            user.save((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        console.log('注册成功');
        ctx.status = 200;
        ctx.body = {
            code:0,
            success: true,
            msg:'success'
        }
    }
};
// 重置密码
const Reset = async (ctx) => {
    let user = new User({
        username: ctx.request.body.name,
        password: sha1(ctx.request.body.pass), //加密
        token: createToken(this.username), //创建token并存入数据库
    });
    // 修改时间
    user.change_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss');
    let doc = await changeUser(user.username, user.password)
    if (doc){
        await new Promise((resolve, reject) => {
            doc.save((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        console.log('重置成功');
        ctx.status = 200;
        ctx.body = {
            code: 0,
            success: true,
            msg: '重置成功'
        }
    }else{
        ctx.status = 200;
        ctx.body = {
            code:-1,
            succsess:false,
            msg:'未找到该用户'
        }
    }

}
//获得所有用户信息
const GetAllUsers = async (ctx) => {
    //查询所有用户信息
    let doc = await findAllUsers();
    ctx.status = 200;
    ctx.body = {
        succsess: '成功',
        result: doc
    };
};

//删除某个用户
const DelUser = async (ctx) => {
    //拿到要删除的用户id
    let id = ctx.request.body.id;
    await delUser(id);
    ctx.status = 200;
    ctx.body = {
        success: '删除成功'
    };
};

// 用户意见
const Suggest = async (ctx) => {
    const userInfo = ctx.request.body
    let doc = await findUser(userInfo.username)
    ctx.status = 200
    if (doc){
        await new Promise((resolve, reject) => {
            doc.save((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        ctx.body = {
            code: 0,
            success: true,
            msg: '提交成功'
        }
    }else{
        ctx.body = {
            code:-1,
            success:false,
            msg:'提交失败'
        }
    }
}

module.exports = {
    Login,
    Reg,
    Reset,
    GetAllUsers,
    DelUser,
    Suggest
};
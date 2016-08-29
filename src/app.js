import express    from 'express';
import mysql      from 'mysql';
import bcrypt     from 'bcrypt';
import async      from 'async';
import session    from 'express-session';
import bodyParser from 'body-parser';
import "babel-polyfill";

import * as articleModel from './models/article'; 


// create application
const app = express();


// 开发阶段允许跨域访问
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


// using session
app.use(session({
  secret: '52dachu',
  resave: false,
  saveUninitialized: false
}));


// using body-parser
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


// connect mysql
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: '52dachu'
});


// encrypt password
function encryptPassword(password, callback) {
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw(err);
    callback(hash);
  });
}

// compare password
function comparePassword(password, hash, callback) {
  bcrypt.compare(password, hash, (err, res) => {
    if (err) throw(err);
    callback(res);
  });
}


function success(data) {
  return { isOk: true, errmsg: '', data: data };
}


function error(msg) {
  return { isOk: false, errmsg: msg, data: null };
}


// login detection
// app.use(function(req, res, next) {
//   if (req.path === '/admin/login' || req.session.isLogin) {
//     next();
//   } else {
//     res.send('login');
//   }
// });


// select userinfo by username
function queryUser(username, callback) {
  let sql = 'SELECT password FROM dc_user WHERE name = ?';
  pool.query(sql, [ username ], function(err, rows) {
    if (err) throw(err);
    callback(rows);
  });
}


// administrator login 
app.post('/admin/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  queryUser(username, function (users) {
    if (users.length > 0) {
      comparePassword(password, users[0].password, (result) => {
        if (result === true) {
          // to do something...
          res.send('login success');
        } else {
          res.send('login failed');    
        }
      });
    } else {
      res.send('login failed');
    }
  });
});


// article
app.get('/admin/article(/:pathname)?', async (req, res) => {
  let pathname = req.params.pathname;
  
  // 没有 pathname 就获取文章列表
  if (typeof pathname === 'undefined') {
    let page = parseInt(req.query.page) || 1;
    
    try {
      let data = await articleModel.findByPage(page);
      res.send(success(data));
    } catch(err) {
      // todo: 记录错误日志
      res.send(error('服务异常！'));
    }
  } 
  // 有 pathname 就获取对应的文章详情
  else {
    try {
      let data = await articleModel.findByPathname(pathname);
      res.send(success(data));
    } catch(err) {
      // todo: 记录错误日志
      res.send(error('服务异常！'));
    }
  }
});


app.listen(3000, () => {
  console.log('==> app started');
});







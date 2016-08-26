import express    from 'express';
import mysql      from 'mysql';
import bcrypt     from 'bcrypt';
import async      from 'async';
import session    from 'express-session';
import bodyParser from 'body-parser';


// create application
const app = express();


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



function queryArticleDetail(pathname, callback) {
  let sql = 'SELECT id, title, pathname, content, create_time, status FROM dc_post WHERE pathname = ?';
  pool.query(sql, [ pathname ], (err, rows) => {
    if (err) throw(err);
    if (rows.length > 0) {
      callback(rows[0]);
    } else {
      callback(null);
    }
  });
}

function queryActicles(page, callback) {
  let pageSize = 2;
  let limit = '0,10000';
  let sql = `SELECT id, title, pathname, summary, create_time, status FROM dc_post ORDER BY create_time DESC LIMIT ${limit}`;
  pool.query(sql, (err, rows) => {
    if (err) throw(err);
    callback(rows);
  });
}

// article
app.get('/admin/article(/:pathname)?', (req, res) => {
  let page = req.query.page;
  let pathname = req.params.pathname;
  
  if (typeof pathname === 'undefined') {
    queryActicles(page || 1, (data) => {
      res.send(data);
    });
  } else {
    queryArticleDetail(pathname, (data) => {
      res.send(data);
    });
  }
});


app.listen(3000, () => {
  console.log('==> app started');
});







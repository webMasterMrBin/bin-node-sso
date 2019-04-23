const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = app => {  
  app.get('/login', (req, res) => {
    console.log('这是sso_server 的global session', req.session);
    console.log('req.query', req.query);
    const { service_url } = req.query;
    if (_.get(req.session, 'global_session.user')) {
      if (service_url) {
        // 用户已经登录过sso_server
        res.redirect(`${service_url}/sso?sso_token=${_.get(req.session, 'global_session.sso_token')}`);
      } else {
        res.send('无效的service_url');
      }
    } else {
      res.send(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>sso server</title>
          </head>  
          <body>
            <input id="uname" type="text" placeholder="用户名" />
            <input type="password" placeholder="密码" />
            <button id="btn" type="button">登录</button>
          </body>
          <script>
            function fetch1() {
              return fetch('/login', {
                method: 'POST',
                body: JSON.stringify({ uname: document.getElementById('uname').value }),
                headers: {
                  "content-type": 'application/json;charset=UTF-8',
                  "service_url": '${service_url}'
                }
               })
            }
            document.getElementById('btn').addEventListener('click', () => {
              fetch1().then(res => res.json()).then(d => {
                const service_url = window.location.search.split('=')[1];
                const sso_token = d.sso_token;
                // 跳转至sso?sso_token 检验token有效性
                window.location.href = service_url + '/sso?sso_token=' + sso_token
              });
            });
          </script>
        </html>
      `);
    }
  });

  app.post('/login', (req, res) => {
    // 登录一个系统的用户与 sso_server 创建全局回话 同时sso_server 创建一个token
    const { uname } = req.body;
    const { service_url } = req.headers;
    // 拿到授权token
    const sso_token = jwt.sign({
      uname
    }, 'secret', { expiresIn: 60 * 1000 * 60 });
    req.session.global_session = {
      user: uname,
      sso_token, // 暂时把token存在 session里 判断token时效性
    }
    console.log('post sso_server global session', req.session);
    // 返回sso_token
    res.json({ sso_token });
  });

  app.get('*', (req, res) => {
    console.log('sso_server global session', req.session);
    res.redirect('/login');
  })
  
  // app.use((req, res, next) => {
  //   console.log('这是sso_server 的global session', req.session);
  //   next()
  // });
}

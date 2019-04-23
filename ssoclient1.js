const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = app => {
  app.get('/', (req, res) => {
    // 标记来源系统
    console.log('这是系统1的local session', req.session);
    // local_session user
    const user = req.session[req.headers.host];
    // 用户未登录则跳转到 sso_server 去认证并拿token
    if (!user) {
      res.redirect(`http://localhost:6030/login?service_url=${process.env.SSO_CLIENT1}`);
    } else {
      res.send(`欢迎登录 用户${user} sso登录授权成功, 以下是ssoclient1的内容`)
    }
  });
  
  app.get('/sso', (req, res) => {
    const { sso_token } = req.query;
    jwt.verify(sso_token, 'secret', (err, decoded) => {
      if (err) {
        console.log('jwt err', err);
        res.send('无效的token');
      } else {
        // token 有效 创建系统1和用户的局部回话
        req.session[req.headers.host] = decoded.uname;
        res.redirect('/');
      }
    })
  })
  
  app.get('*', (req, res) => {
    res.redirect('/');
  })
}

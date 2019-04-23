const jwt = require('jsonwebtoken');

module.exports = (app, store) => {
  app.get('/', (req, res) => {
    // 标记来源系统
    const user = req.session[req.headers.host];
    console.log('user', user);
    // 用户未登录则跳转到 sso_server 去认证并拿token
    if (!user) {
      res.redirect(`http://localhost:6030/login?service_url=${process.env.SSO_CLIENT2}`);
    } else {
      res.send(`
        欢迎登录 用户${user} sso登录授权成功, 以下是ssoclient2的内容
        <button onclick="window.location.href = '${process.env.SSO_CLIENT2}/logout'">logout</button>`);
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
  
  app.get('/logout', (req, res) => {
    // 因为局部回话存在, 全局回话一定存在, global_session 存在了系统共用的session(待改进)
    const { sso_token } = req.session.global_session;
    // 拿到global_session里的 token 开始注销
    
    jwt.verify(sso_token, 'secret', (err, decoded) => {
      if (err) {
        console.log('jwt err', err);
        res.send('无效的token');
      } else {
        // token有效 既销毁global_session
        store.destroy(req.session.id, () => {
          req.session.destroy(() => {
            res.redirect('/');
          });
        })
      }
    })
  })
  
  app.get('*', (req, res) => {
    console.log('这是系统2的local session', req.session);
    res.redirect('/');
  })
}

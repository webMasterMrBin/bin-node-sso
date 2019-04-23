# node.js 实现sso 原理demo

##  Getting Started
- `npm run start1, npm run start2` 分别启动ssoclient1, ssoclient2
- `npm run starts` 启动认证服务器sso_server

## 运行效果
![demo](/img/demo.gif)

###待优化
- TODO demo中 为了图省事在客户端(ssoclient2中) 一起清除了global_session, local_session. 逻辑待优化
- 3个系统包括sso_server都写在一个app.js中根据不同的环境变量启动, 且共用一个redis-store, 导致ssoclient 可以访问到sso_server的global_session(后续应把local_session, global_session独立存储)

## 登录

![login](/img/login.jpeg)

- 用户访问系统1的受保护资源，系统1发现用户未登录，跳转至sso认证中心，并将自己的地址作为参数
- sso认证中心发现用户未登录，将用户引导至登录页面
- 用户输入用户名密码提交登录申请
- sso认证中心校验用户信息，创建用户与sso认证中心之间的会话，称为全局会话，同时创建授权令牌
- sso认证中心带着令牌跳转会最初的请求地址（系统1）
- 系统1拿到令牌，去sso认证中心校验令牌是否有效
- sso认证中心校验令牌，返回有效，注册系统1
- 系统1使用该令牌创建与用户的会话，称为局部会话，返回受保护资源
- 用户访问系统2的受保护资源
- 系统2发现用户未登录，跳转至sso认证中心，并将自己的地址作为参数
- sso认证中心发现用户已登录，跳转回系统2的地址，并附上令牌
- 系统2拿到令牌，去sso认证中心校验令牌是否有效
- sso认证中心校验令牌，返回有效，注册系统2
- 系统2使用该令牌创建与用户的局部会话，返回受保护资源

用户登录成功之后，会与sso认证中心及各个子系统建立会话，用户与sso认证中心建立的会话称为全局会话，用户与各个子系统建立的会话称为局部会话，局部会话建立之后，用户访问子系统受保护资源将不再通过sso认证中心，全局会话与局部会话有如下约束关系

- 局部会话存在，全局会话一定存在
- 全局会话存在，局部会话不一定存在
- 全局会话销毁，局部会话必须销毁


## 注销

![logout](/img/logout.jpeg)

- 用户向系统1发起注销请求
- 系统1根据用户与系统1建立的会话id拿到令牌，向sso认证中心发起注销请求
- sso认证中心校验令牌有效，销毁全局会话，同时取出所有用此令牌注册的系统地址
- sso认证中心向所有注册系统发起注销请求
- 各注册系统接收sso认证中心的注销请求，销毁局部会话
- sso认证中心引导用户至登录页面

### 参考文章
- [单点登录（SSO），从原理到实现](https://cloud.tencent.com/developer/article/1166255)
- [Building A Simple Single Sign On(SSO) Server And Solution From Scratch In Node.js.](https://codeburst.io/building-a-simple-single-sign-on-sso-server-and-solution-from-scratch-in-node-js-ea6ee5fdf340)
- [理解OAuth 2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)
- [OAuth,Token和JWT](https://www.jianshu.com/p/9f80be6ba2e9)

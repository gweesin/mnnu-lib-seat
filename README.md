
# Occupy MNNU Library Seat

## Record

- Axios 遇到 302 响应时，会自动重发请求，并将重定向的 Location 作为 response 返回（未解决，网上说是浏览器的默认行为，但在 node 环境下也是这样吗？有空的时候记得去钻研一下）
- Axios 遇到 302 响应自动跳转后，如果使用了代理，那么得到的 hostName 和 port 都将是代理的 hostName 和 port，会导致原请求接收不到响应，从而等待直至请求超时报错(未解决)
- 18 点开始抢座时，请求总是无限等待，直到 18 点 05 分时才能进入系统。分析得出：18 点 ~ 18 点 05 分时，无法获取新的 Cookie （服务端不让创建新的会话，只会保存原有会话，等待 18 点 05
  分后再次开放）（因此采用提前获取 Cookie 等待的方式解决）
- Fiddler 的 Statistics 对于分析请求的网络情况有很大的帮助
- 务必保证程序异常情况得到处理，因为设想得过于完美，导致浪费了一天又一天（每天只能在 18 点 ~ 18 点 05 分测）
- 代码规范也非常重要
- Fiddler 拦截请求 `bpu [url]`，拦截响应 `bp [after]`，很方便的用于测试接收到错误响应和非 2XX 状态码时的异常情况
- 使用 .gitignore 删除已提交的文件

```shell
# 删除所有本地缓存
git rm -r --cache .

git add .
git commit -m ".gitignore now work"
```

## Plan

- [x] 使用 Webpack 进行打包
- [x] 使用新的 HMR 方案(Nodemon)
- [x] 引入 Prettier & ESLint & eslint-plugin-prettier
- [ ] 重构代码（感觉设计一团糟 orz）
- [x] 使用 Koa 框架构建 API 接口
- [x] 添加自定义用户爬虫时间配置
- [x] 发送邮件

## Related Link

- [Prettier](https://zhuanlan.zhihu.com/p/81764012?from_voters_page=true)
- [Prettier Configuration](https://zhuanlan.zhihu.com/p/81764012?from_voters_page=true)
- [Using Prettier with ESLint](https://prettier.io/docs/en/webstorm.html)
- [eslint plugin prettier](https://github.com/prettier/eslint-plugin-prettier)
- [nodemailer](https://nodemailer.com)

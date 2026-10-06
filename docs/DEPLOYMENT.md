# 网页版与本地部署

本项目提供 Vercel 前端配置，但 Vercel 版不是完整后端迁移。当前 BFF 依赖常驻 Node.js 服务、后台任务、FFmpeg 和持久化存储；需要部署到可运行完整 BFF 的主机。面向朋友开放时必须有服务端身份验证、访问控制和速率限制。

## Vercel 网页版

按 [Vercel 部署说明](../deploy/vercel/README.md) 导入仓库并设置 `ODDMANCHUANG_BFF_ORIGIN` 指向独立 BFF 服务。长时间生成、媒体上传/下载及依赖本地磁盘的功能受函数时长、请求大小和网络限制影响，需逐项实测。切勿在浏览器代码或公开仓库中放置 API Key。

## Windows 本地网页

安装 Node.js 20.19 或更高版本，双击根目录 `start.bat`，浏览器打开 `http://localhost:8022`。BFF 健康检查地址为 `http://localhost:8030/api/health`。

## Docker 自托管

```powershell
npm ci
npm ci --prefix bff
npm run docker:prepare
docker build -t oddmanchuang .
docker run --rm `
  --env-file .env `
  -p 8080:80 `
  -v oddmanchuang-data:/data `
  oddmanchuang
```

使用公网服务前必须配置 HTTPS、强随机 `AUTH_SECRET` 和 `APP_SETTINGS_SECRET`、受限的 `CORS_ORIGIN`、注册策略、上游域名白名单、代理限流及备份。不要无保护地公开 worker、渲染和媒体代理接口。

## 桌面版

如需桌面端分发，请看 [桌面版打包说明](../deploy/desktop/README.md)。桌面端每位使用者在自己的电脑运行 BFF；分发包不得包含个人 API Key。

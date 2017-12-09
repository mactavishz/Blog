---
title: 升级站点到 HTTPS
date: 2017-12-09 22:42:02
tags: [HTTPS, 运维部署]
---

## 概述

随着人们越来越重视网络的安全以及自身的隐私，各大浏览器厂商都在力推 HTTPS

今天就来说一下我是怎么免费将自己的博客从 HTTP 升级到 HTTPS 的

## HTTP 和 HTTPS

HTTP 协议和 HTTPS 最大的区别就是，HTTPS 使用了传输加密，HTTP 协议没有对传输进行加密

所以使用 HTTP 协议发送的数据都是明文，毫无安全性可言

HTTPS 是 HTTP + SSL/TLS，整个 HTTPS 请求是在 SSL/TLS 加密协议之上进行的

HTTPS 通信在正式的请求前需要经过一系列复杂的加密协议握手的过程：

![](SSL.png)

完成握手之后，接下的请求都是用 HTTP 协议来传输，只不过会用之前加密协议生成的密钥来加密整个请求

所以，即使传输过程被其他人看到了，传输的数据也是加密的，无法获知数据的真正内容

具体 HTTPS 协议是如何运作的，这里不再赘述，感兴趣的话可以读一读 ruanyifeng 的[这篇文章](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)


## 使用免费可信的 HTTPS 证书

要升级到 HTTPS 首先得去申请一张 HTTPS 的证书

这个证书里面包含了网站的信息，比如网站的域名、所有者、组织机构以及网站的公钥等等

一般来说 HTTPS 证书都是由一些大的机构发行，需要花钱去购买

但是可以使用可信度较高的机构发放的免费的 HTTPS 证书，这里我推荐 [LET'S ENCRYPT](https://letsencrypt.org/)

`LET'S ENCRYPT(电子前哨基金会EFF成立的CA)` 旨在提供免费的开放的证书来给整个互联网提供更安全的访问

## 自动安装 HTTPS 证书

`LET'S ENCRYPT` 使用遵循 `ACME(Automatic Certificate Management Environment)` 协议的工具来安装证书

官方推荐的工具是 [certbot](https://certbot.eff.org/)，官方文档里有详细的安装和使用教程

进入服务器的网站目录，利用 `certbot` 命令会帮你生成证书和密钥

然后就可以配置服务器来启动 HTTPS 服务

## 服务器开启 HTTPS

我的博客是直接利用 Node.js 来托管静态文件的，所以我这里就展示一下部分代码：

``` js
// ... other code
const https = require('https')
const http = require('http')
// read key and cert for https server
const key = fs.readFileSync('/etc/letsencrypt/live/macsalvation.net/privkey.pem')
const cert = fs.readFileSync('/etc/letsencrypt/live/macsalvation.net/cert.pem')
// https server options
const options = {
  key,
  cert
}

app.use(function(req, res, next) {
  if (req.secure) {
    next()
  } else {
    // use 301 redirect http to https
    res.status(301).redirect('https://' + req.headers.host + req.url)
  }
})

// ... other code

http.createServer(app).listen(80)
https.createServer(options, app).listen(443)
```

分别监听 HTTP 和  HTTPS 请求，如果访客默认使用 HTTP 协议来访问网站

就重定向为 HTTPS 服务，这样保证访客都是使用 HTTPS 来访问网站

## 总结

利用 HTTPS 能够更加使得网络访问更加地安全可靠，这也是 web 的发展趋势

感谢 `LET'S ENCRYPT` 为我们提供便捷免费的证书，如果感兴趣可以给他们[捐助](https://letsencrypt.org/donate/)

还有这个证书是有一定有效期的，记得在证书过期前利用 `certbot` 来刷新证书过期时间

否则可能会导致网站无法正常访问
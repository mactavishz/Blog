---
title: 利用 Charles 代理开启远程调试
date: 2017-12-06 23:24:27
tags: [前端工具, 工作流, HTTP, HTTPS]
---

## 背景

最近工作的时候遇到一个很蛋疼的需求

需要调试原生 APP 中的 webview 里的页面

由于编译生成的测试 APP 中的 webview 指向的 url 是正式的服务器，比如：`https://abc.com`

为了远程调试这个 webview 中的页面，我们不可能每次都去更改 url 的指向来实现本地测试

再加上现在 Apple 规定 IOS 应用的数据传输都必须使用 HTTPS 协议

所以即使我们将 webview 指向的 url 更改为本地的测试服务器，也无法通过验证

所以我们需要搭建本地的 HTTPS 服务器，然后再利用代理的方式将 webview 的请求代理至我们本地的 HTTPS 测试服务器

那么怎么样使用代理服务器呢？原理又是什么呢？

## Charles 与代理

![](charles.jpeg)

> [Charles](https://www.charlesproxy.com/) 是一款用于网络抓包、监控及代理的工具

### 原理

用 Charles 实现抓包其实就是利用了`中间人`技术，对，就是我们谈论的`中间人攻击`

Charles 会生成自己的 HTTPS 证书，然后和请求方 (比方说 webview) 建立 HTTPS 连接，然后将 webview 的请求，全部转发到本地的服务器

本地的服务器返回结果之后，Charles 再将请求转发回请求方

这个过程中，Charles 可以拦截甚至篡改对本地服务器的请求，而请求方却一无所知

对请求方来说，它只是简单地向 Charles 发起请求，而 Charles 在背后干了什么，请求方则无从得知

`中间人`也就是这个原理，用户请求的是假的服务器，但是自己却不知道自己请求了假的服务器

![](mim.jpeg)

## Charles 的使用

Charles 的安装和配置，这里就不赘述了，可以参考[这篇文章](http://blog.devtang.com/2015/11/14/charles-introduction/)

主要讲一下 Charles 使用的流程：

* 在电脑上安装好 Charles 的根证书并设置为信任
* 在手机 wifi 的设置中设置代理，代理地址为 Charles 映射的代理地址，默认是 **8888** 端口
* 给手机安装 Charles 提供的证书 (需要手机连接上同一网段的 wifi，最好是电脑自己发射的热点)
* 在 Charles 客户端开启对电脑网络的代理，这样通过电脑的所有网络请求都能被 Charles 抓到
* 在 Charles 客户端开启对 SSL 的代理，可以只代理特定请求，也可以代理全部请求，这样就可以抓到 HTTPS 的包

手机连接 wifi 并配置了代理服务器之后，手机上所有的请求会经过 Charles 的代理服务器

这样我们就可以利用 Charles 来对请求转发、调试、甚至篡改请求数据

## 搭建本地 HTTPS 服务器

为什么还要搭建一个 HTTPS 服务器呢？

因为一般来说本地的测试服务器都是 HTTP 协议的，但是 IOS webview 必须要求访问 https 协议的服务

通常本地的测试服务器是很难去专门打造成 HTTPS 协议的

所以我们只能再搭建一个本地的 HTTPS 服务器，然后用这个服务器来转发来自 webview 的请求到本地测试服务器

相当于又做了一次代理，虽然有点绕，但是能够解决必须使用 HTTPS 的问题

当然如果你不需要走 HTTPS 的路线，那么久简单多了，直接通过 Charles 的端口转发即可

### 端口转发

首先，先来说说直接用 Charles 转发 HTTP 请求

正如最开头所说，假如你的 webview 指向的 url 已经固定了，假设这个 url 为 `abc.com`

在手机连接了 wifi 并设置了代理，Charles 客户端也已经运行并且能够抓到请求了之后

你需要做两件事情：

* 更改本地 hosts 文件
* 设置端口转发

更改本地 hosts 文件是为了让 `abc.com` 映射到我们的本地的地址，比如：

```
# hosts
127.0.0.1 abc.com
```

这样手机在访问 `abc.com` 及其子域名的时候，就会自动访问我们本机的地址

一般来说，线上的 url 也是不会带端口号的，所以我们必须要将端口进行映射

假如你的本地测试服务器就运行在 80 端口，那就没必要做映射了，HTTP 协议默认访问的就是 80 端口

但是，我们经常面对的情况就是，80 端口已经被占用了

所以我们需要把 80 端口的请求全部转发到别的端口，比如：本地测试服务器的运行端口就是 8080，那就转发到 8080

这样，webview 经过 Charles 代理之后，访问 `abc.com` 就会映射为 `127.0.0.1:8080`

端口转发的方法有很多，可以直接利用 Charles 的端口转发，也可以使用命令行工具：

* Mac/Linux 请按照[这篇文章](https://my.oschina.net/91jason/blog/546711)设置
* Windows 请按照[这篇文章](http://woshub.com/port-forwarding-in-windows/)设置  
* Charles 直接端口转发，请打开 Proxy 菜单下的 Port-forwarding 进行设置

HTTPS 请求的默认 443 端口也可能被占用，使用同样的端口转发即可解决

### 利用 Node.js 快速搭建 HTTPS 代理服务器

前面说完了 HTTP 请求的代理，那么我们现在来谈谈棘手的 HTTPS 代理

比单纯的 HTTP 请求要再多一层代理的步骤

之前说到要搭建本地 HTTPS 代理服务器，可以使用 Nginx 也可以使用 Node.js

对于前端开发人员来说，Node.js 更熟悉也更简单，根本不需要多余的配置

``` js
const  httpProxy = require('http-proxy')
const fs = require('fs')

// 配置好证书和密钥
const options = {
  key: fs.readFileSync('./cert/hiido.key'),
  cert: fs.readFileSync('./cert/hiido.crt')
}

httpProxy.createProxyServer({
  target: {
    host: '127.0.0.1',
    port: 8080
  },
  ssl: options
}).listen(8443)
```

利用 `http-proxy` 这个第三方模块，我们就可以通过短短几行代码就实现一个简单的 HTTPS 代理服务器

**重点注意的是：**一定要配置好 HTTPS 所使用的证书和密钥，并且一定是要通过 CA 认证的证书才行

绝对不能使用自签名的证书，不然请求会被浏览器 (webview) 拦截

> 比如你访问的 url 为 `https://abc.com`，你的本地 HTTPS 服务器配置的证书也必须是对应 `abc.com` 的认证证书

这样我们就可以将 `https://abc.com` 的请求转发到本地 `127.0.0.1:8080` 的测试服务器了

我们在 8443 监听这个 HTTPS 服务器是因为 443 端口被占用了，并且已经向之前提到的那样做了端口转发

那么所有访问本地 443 端口的请求都会被成功转发到 8443 端口，然后再转发至 8080 端口

但是对于请求方 (webview) 来说，它只知道通过 HTTPS 访问到了正确的服务，而并不了解背后复杂的转发机制

## 注意事项及要点

1. charles 必须在本地安装好证书并且信任证书，以及在手机上安装证书并且信任
2. 本地的代理服务器必须走 HTTPS 协议，否则无法在 IOS 上访问
3. 本地的代理服务器的证书必须要是经过 CA 认证的，不能使用自签名的证书
4. **本地测试服务器中页面的静态资源及请求的路径，不能为绝对路径**，比如 `http://js/v/jquery.min.js`，这样会导致代理服务器请求失败，因为 HTTPS 服务无法混入 HTTP 服务，浏览器将抛出 `(MIX CONTENTS)[https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content]` 错误。推荐使用相对路径的方式来请求资源，如果非要使用绝对路径，那么请使用相对协议 `//domain/path/to/...`，比如 `//localhost/js/jquery.min.js`，这样请求会自动根据当前网站的协议来访问，这样代理服务器的 HTTPS 请求就可以全部覆盖了。

## 总结

为了更好的说明整个应用的流程，我画了一张图来说明：

![](flow.png)

通过这个方式，我们就可以轻松地远程调试 webview 页面了

---
title: 深入理解 express-session 中间件
date: 2017-11-29 17:55:09
tags: [Backend, Node.js, HTTP]
---

世界上几乎每一个需要保持用户数据的 Web 应用几乎都需要处理 Session

在这篇文章里，我主要想分享：

1. 什么是 Session
2. Session 是如何保存数据的
3. **express-session 中间件的实现**
4. 如何选择 session 持久化的方案

## 什么是 Session

我们都知道 HTTP 是无状态的协议，它只负责传输报文，并不处理报文发送者的信息

那么 Server 要如何才能知道某个请求是属于哪位用户的呢？

这时候就需要利用到 Session，简而言之，Session 就是用来保存用户身份信息的

一般来说，用户的真正信息是存储在 Server 上的

为了验证自己的身份，客户端一般会将用户的对应信息标识符存储在 cookie 当中

这样每次客户端发起请求的时候，Server 都能够接收到客户端的 cookie 并解析然后验证其身份信息

这样 Server 就知道了具体的请求到底属于哪一位用户了

当用户信息发生改变的时候, Server 也可以主动给客户端设置 cookie，这样下次请求的时候就能够获取改变的信息了

![](cookie.png)

## Session 是如何保存数据的

Session 可以以不同的方式来存储，主要有以下几种方式：

1. Application memory（应用内存）
2. Cookie
3. Memory cache（缓存）
4. Database（数据库）


### Application memory

一般来说，后端的开发框架默认的方式都是将 Session 存储到应用内存当中，这是最简单直接的，但是不能用于生产环境

这意味着 Session 的生命周期就是 Server 应用保持运行的时间，一旦你的 Server 应用崩溃了或者停止运行了，那么 Session 数据就会丢失

这种方式也很容易导致内存泄露，你的应用一直运行，用于保存 Session 的内存也约占越多，直到内存被耗尽

一般来说，我们只会在**开发**的时候用这种方式来便捷地测试

### Cookie

Cookie 一般用于记录用户的相关信息，而且 Cookie 保存在客户端，不需要占用服务器的空间

Cookie 也常用与保存 Session 数据

Cookie 和服务器交互的过程可以简述为一下三点：

1. 服务器首先产生 cookie 的相关信息然后符带在 HTTP 响应头中，并设置过期时间，客户端收到响应之后便会按照响应头来设置 cookie
2. 只要 cookie 没有过期，随后的请求都会被一并符带在 HTTP 请求头并发送到服务器，这样服务器就可以读取 cookie 中的信息
3. 服务器可以随时重新修改 cookie 内容并返回给客户端

一般来说，像 express-session 这样的模块可以帮助我们简易地设置 session，但在深层机制，它仍是使用 cookie 来获取 session 数据

express-session 也允许对 cookie 进行加密以确保 cookie 中的信息不被轻易地窃取

![](session_cookie.png)

但是 cookie 本身是有一些问题的，比如：

* cookie 的容量有限，不同浏览器的限制不同，一般来说上限大约在 4KB 左右
* 大量的 cookie 在请求的来回中，需要消耗额外的网络资源，会影响网站的性能
* 如果恶意攻击者发现了你 cookie 的加密方式，那么 cookie 中的信息很可能被窃取

### Memory cache

缓存读写的速度非常的快，所以非常适合用与存储 session

比较流行的用于储存 session 的技术有 Redis 和 Memcached

当 session 被存储在缓存中时，sever 依然会使用 cookie 来与客户端通讯，但是一般 cookie 只保留一个唯一的标识符：`sessionId`

这个标识符用于在缓存中查找对应的 key-value 数据，并且也避免将用户的敏感信息存放在 cookie

![](memory.png)

使用缓存有这些好处：

* 基于 key-value 的数据结构利于快速的查找
* 它们通常与应用服务器分离开来，这种解耦减少了依赖性
* 同一份缓存内容可以供给不同的应用来使用
* 它们通常会自己移除过期的 session 数据来高效利用存储空间

但是缓存也存在一些不足：

* 需要单独设置一个管理缓存的服务，引入了新的复杂度
* 对于一些小型应用可能有些 “小题大做”
* 重置缓存的话就必须清除所有存储在里面的 session

### DataBase

和缓存类似，只不过换了个存储介质而已

通常，不推荐将 session 存在数据库里，因为从数据库中取回数据要比使用缓存要慢很多

并且，需要经常去访问数据库来获取 session，session 的去除也需要手动管理

一般来说连接数据库所花费的开销通常是比较大的

## Express-session 中间件剖析

前面谈论了这么多的 cookie 和 session，现在就让我们进入一个具体的例子

我们来剖析下基于 Node.js 的热门服务端框架 Express 的官方中间件 —— express-session

express-session 的使用非常的简单：

``` js
const express = require('express')
const session = require('express-session')

let app = express()
app.use(session({
  // session configuration
}))

// rest of the code ...
```

通过向 express-session 中间件传递配置参数，我们可以控制 session 的各种行为：

``` js
{
  cookie: {
    path: String, // 将会影响响应头 Set-Cookie 中的 Path 字段
    domain: String, // 将会影响响应头 Set-Cookie 中的 Domain字段
    httpOnly: Boolean, // 设置为 true 使得客户端没法用 js 来操作该 cookie
    expires: Date, // Date object 将会影响响应头 Set-cookie 中的 Expries 字段, 不推荐直接设置，一般设置 maxAge
    maxAge: Number // 毫秒，将会影响响应头 Set-cookie 中的 Expries 字段，通过计算 server 当前时间和 maxAge 的和来计算 expires，
    secure: Boolean // 将会影响响应头 Set-cookie 中的 Secure 字段，表示只有在请求使用SSL和HTTPS协议的时候才会被发送到服务器,
    sameSite: Boolean || String, // 将会影响响应头 Set-cookie 中的 SameSite 字段，会影响跨域请求是否附带 Cookie 的行为
  },
  name: String, // 默认是 'connect-sid'，用于设置 cookie 的 key,
  resave: Boolean, // 强制 session 每次都重新存储到 store 当中,
  rolling: Boolean, // 每次请求都重新设置 cookie，并重置 max-age，也就意味着重置过期时间
  saveUninitialized: Boolean, // 强制未初始化的 session 存储到 store 当中
  secret: String, // 用于对 cookie 进行签名加密,
  store: Object// 用来存储 session 的 store 实例，默认为 MemoryStore
}
```

### 接口及结构

![](interface.png)

session 初始化的时候，express-session 中间件会给传入的 request 对象设置几个属性：

* sessionID
* session（Session 对象实例）
* sessionStore(Store 对象实例)

其中 session 属性还包含了 cookie 属性，是对 Cookie 对象实例的一个引用

这些不同的接口负责不同的职能，之间互不干扰

届时，暴露给用户的只有 Session 对象的接口，这样屏蔽了底层 Store 的细节，用户并不需要关心 Session 的存储过程

但是 Session 对象最终仍然操作的是 Store 对象提供的接口

而对于 Cookie 对象而言，用户只需要关心 maxAge 和 expires 属性


### 接入其他类型的 Store

express-session 中间件默认使用自带的 MemoryStore 对象来存储 session 中的数据

官方是不推荐使用这个来作为 Store 的，MemoryStore 本质上属于 Application Memory

只能用于开发调试，不能用于生产环境，因为它很容易产生内存泄露，增加服务端应用的开销

如果想用缓存或者数据库来存储 session 数据的话，需要使用自定义的 Store 对象

让我们来看下 Store 对象的具体实现：

![](Store.png)

Store 对象本质上继承了 EventEmitter，然后 MemoryStore 又继承了 Store

所以自定义的 CustomStore 也可以继承自 Store 并拥有了注册和监听事件的能力

在源码中有这样一段：

``` js
// register event listeners for the store to track readiness
var storeReady = true
store.on('disconnect', function ondisconnect() {
  storeReady = false
})
store.on('connect', function onconnect() {
  storeReady = true
})
```

那么假如说你的自定义 Store 需要连接一些其他的服务或者是数据库

那么你可以在无法连接成功的时候，去触发 `disconnet` 事件，那么这时候 express-session 中间件就不会去访问并存储数据到 Store 当中

自定义 Store 需要实现 get，set 等接口，有些是必需的，有些是可选的

### 逻辑实现

通过阅读源码，express-session 的底层实现主要为：

1. 初始化 session 对象，生成唯一的 sessionId (uuid)，初始化 cookie 对象
2. 序列化并计算当前 session 对象的原始 hash 值
3. proxy（代理）res.end 方法，在真正的 res.end 方法执行一系列的检测，并根据一开始的配置以及重新计算 session 对象的 hash 来决定是否存储 session 到 store
4. 监听设置响应头的事件（setHeader），触发的时候决定是否给响应头添加 `Set-Cookie` 字段

对应源码部分:

#### 初始化 session 和 cookie 对象

``` js
store.generate = function(req){
  req.sessionID = generateId(req);
  req.session = new Session(req);
  req.session.cookie = new Cookie(cookieOptions);

  if (cookieOptions.secure === 'auto') {
    req.session.cookie.secure = issecure(req, trustProxy);
  }
};
```
#### 生成 hash 值

``` js
// 生成 hash 值
function generate() {
  store.generate(req);
  originalId = req.sessionID;
  originalHash = hash(req.session);
  wrapmethods(req.session);
}
```

#### 代理 res.end

``` js
var _end = res.end;
//...
res.end = function end(chunk, encoding) {
  // ...

  if (shouldDestroy(req)) {
    // ...
    // destroy session
  }

  // no session to save
  if (!req.session) {
    return _end.call(res, chunk, encoding);
  }

  if (!touched) {
    // ...
    // touch session
  }

  if (shouldSave(req)) {
    //...
    // save session
  } else if (storeImplementsTouch && shouldTouch(req)) {
    // store implements touch method
    // ...
  });

  return _end.call(res, chunk, encoding);
  };
```

### 关键要点

* session 在 store 中的存储形式

express-session 中间件在代理了 res.end 方法之后，最后都是将 req.session 序列化之后存到 store 中

因此 store 中存放的是 JSON 字符串

``` js
// store 中的 set 方法
this.sessions[sessionId] = JSON.stringify(session)
```

* hash 的计算

不管是从请求开始计算原始的 hash 值，还是在请求结束前重新计算 hash 值并进行对比来决定是否要重新存储 session 到 store

都是利用 crc 进行计算，并且会忽略 session 中的 cookie 信息，因为我们关注的是 session 本身，而不是附带的 cookie

``` js
// 计算 hash 的方法
function hash(sess) {
  return crc(JSON.stringify(sess, function (key, val) {
    // ignore sess.cookie property
    if (this === sess && key === 'cookie') {
      return
    }

    return val
  }))
}
```

* store 的所有方法都是异步的，并且可以捕获异常

在生产环境中使用自定的 Store 的时候，无论是利用缓存还是 database，I/O 的读取都是需要花费时间的

秉承 node.js 的 none block I/O，我们应该异步地去进行读写的操作

这样不会阻塞主线程上代码的执行

``` js
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

MemoryStore.prototype.all = function all(callback) {
  // ...
  // callback should be called as `callback(error, sessions)`
  callback && defer(callback, null, sessions)
}

MemoryStore.prototype.get = function get(sessionId, callback) {
  defer(callback, null, getSession.call(this, sessionId))
}
```

express-session 中自带的 MemoryStore 都是没有做任何异常处理的，所以所有的异常都直接抛出 null

那么如果我我们使用 CustomStore 的时候，就需要显式的去处理异常：

``` js
// 伪代码
myStore.prototype.get = (id, callback) {
  try {
    db.find({id},(err, data) => {
      defer(callback, err, data)
    })
  } catch(err) {
    defer(callback, err, null)
  }
}

// 那么用户就可以直接去使用这个接口
store.get(req.sessionID, (err, sess) => {
  if (err) console.error(err.message)
  //... do something with sess
})
```

### express-session 中间件的处理流程

![](flow.png)

### 利用 express-session 的完整请求过程

![](request-flow.png)

## 总结

通过仔细地阅读 expresss-session 的源码，了解了一个中间件的完整的实现原理

以及如何通过 proxy 这样的思路来灵活地控制响应的生命周期

同时也了解了如何设计一个模块的 API 以及对外暴露的接口的选择

收益良多，果然像 tj 大神说的那样，多读优秀的源码确实是提升技术水平的好方法




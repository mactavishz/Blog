---
title: Script 文件的同步和异步加载
date: 2018-04-11 22:59:11
tags: [JavaScript, HTML, DOM]
---

## 概述

这篇文章将会针对一个具体的例子来讨论 JavaScript 脚本文件在 HTML 中同步和异步加载的情况

如果你想要了解这两者的区别以及实际的运用，那么这篇文章非常将非常适合你

## 脚本文件的加载

在大多数情况下，我们页面上的脚本都是同步加载的

多数 JS 的初学者一般不会注意到同步加载和异步加载的区别

许多人都会用(包括我一开始学习的时候)，都会 '猜测'，JS 的脚本是按顺序加载的

那么实际情况是怎么样的呢

## 脚本的同步加载

通常情况下，我们会在页面上这样去引入一个脚本，这里使用 jQuery 来举例:

``` html
<script type="text/javascript" src="jquery.js"></script>

<script type="text/javascript">
  $('selector') //... 做点什么
</script>
```

这段代码的使用场景是没有问题的，页面会先加载完 jQuery, 然后执行我们的代码

所以正常情况下，我们使用 `script` 标签来引入脚本文件，是同步加载的，会按照从上到下的顺序加载

第一个脚本加载并执行完毕之后，才会加载和执行第二个脚本，以此类推...

但是，我们都只 JS 脚本的加加载会阻塞 DOM 的解析

所以如果你在页面头部引入了一个非常庞大的脚本文件，当用户网络条件不好的时候，将会长时间看到一片空白

``` html
<head>
  <!-- some other file included -->
  <script type="text/javascript" src="bigfile.js"></script>
</head>
<body>
  <!--  your html structure -->
</body>
```

这也是为什么我们说将脚本放在 body 底部加载是所谓的 `best practice`

因为我们不希望脚本阻塞页面的渲染，我们希望用户能够更快地看到页面上的内容

``` html
<head>
  <!-- some other file included -->
  <!-- <script type="text/javascript" src="bigfile.js"></script> -->
</head>
<body>
  <!--  non blocking -->
  <script type="text/javascript" src="bigfile.js"></script>  
</body>
```

## 脚本的异步加载

有时候我们希望我们的脚本是异步加载的，比如一些不是那么重要的脚本：统计脚本，动态评论框之类的

这时候 `async` 和 `defer` 两个属性会帮助我们实现这个目的

不过这两个属性还是有一些细微的差异

但是这不是这篇文章的重点，我也不会详细地讲解这两者的区别

这里首先要引出另外一种异步加载的方式，也就是我们常说的 `动态加载`:

``` js
<script type="text/javascript">
function loadJS(filePath) {
  var newScriptElement = document.createElement("script")
  newScriptElement.type = "text/javascript"
  newScriptElement.src = filePath
  document.body.appendChild(newScriptElement)
}

loadJS("somefile.js")
alert("Time's up")
</script>
```
我们通过动态插入 `script` 标签的方式也可以达到异步加载的效果

这是因为在浏览器发起 `HTTP` 请求的时候，我们的主线程上的代码或许已经执行完毕了(也有可能还没有执行完毕)

所以新插入的脚本必须要等到**主线程上空闲**的时候才可以继续执行，我们可以看看这个例子

打开控制台，注意 `console` 中的输出，来回点击 `HTML` 和 `Result` 可反复查看结果

<script async src="//jsfiddle.net/macsalvation/7we7sg10/6/embed/html,result/"></script>

在这个例子中，我们使用之前的方法动态地加载了 `jQuery` 的脚本，并检查 `jQuery` 的全局对象

但是接下来马上就是两个同步的脚本，其中第一个脚本将会阻塞 2s，第二个脚本会很快执行

无论他们顺序如何，我们异步加载的脚本永远都在这些脚本执行完毕之后才执行

这也是我们为什么需要异步脚本的原因了

## 强制同步加载

接下来就要说到一个具体的例子

有时候我们需要对加载的脚本做一些 fallback 处理，比如我们前面引用的 jQuery 的 CDN 挂掉了

那么我们希望在使用 jQuery 的业务代码之前去检测，并同步地重新加载一个 jQuery

所以向上面这种动态插入脚本的方式是行不通的，因此我们只能另辟蹊径

目前我发现的有两种方式可以实现脚本的强制同步加载：

### Ajax 同步请求

利用原生的 `XMLHttpRequest` 对象，我们可以发起一个 `Ajax` 请求

这个对象的 `open` 方法的第三个参数可以决定我们的请求是同步的还是异步的，我们可以利用这个特性来实现

<script async src="//jsfiddle.net/macsalvation/nkccwd6u/5/embed/html,result/"></script>

我们可以发现这种方式是可以立即将脚本同步加载的，这样就不会影响到接下来的脚本的执行

但是这种方式有一些缺点：

1. 不支持低版本的 IE 浏览器 (无 XMLHttpRequest 对象)
2. 可能会存在跨域问题

### 神奇的 Document.write

处理利用 Ajax 同步请求，我们还可以使用 `document.write` 来实现同步加载

这里我就长话短说了，虽然我们的脚本处于 `body` 标签的底部，但是对于浏览器来说，`script` 标签也是 `DOM` 的一部分

所以其实在这个位置，DOM 是没有完全解析完的，众所周知 `document.write` 方法是可以直接写入文档流的

那么我们写入文档流的内容会自动加载文档的最底部，并被马上解析，实际的效果则和同步加载是一致的

``` js
document.write(<script src="https://cdn.bootcss.com/jquery/3.3.0/jquery.min.js"></script>)
```

这样我们写入文档流这个这个脚本会立即请求并加载，从而实现同步加载

## 总结

了解脚本的加载机制，有利于我们对网络请求和页面性能进行优化，使得页面的加载速度更快

同时也可以利用同步的特性来处理一些脚本非正常加载的情况

> 参考
> * https://trevweb.me.uk/javascripthtml-synchronous-and-asynchronous-loading/
> * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async
> * https://www.cnblogs.com/jiasm/p/7683930.html
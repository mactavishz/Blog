---
title: 谈谈 Throttle 和 Debounce
date: 2017-12-11 23:06:42
tags: [JavaScript, 性能优化]
---

## 概述

Throttle 和 Debounce 是前端的一个老生常谈的话题了

这两个技术非常相似，它们都是控制一定时间内函数执行的次数，但是却又有所不同

在一些触发非常频繁的 DOM 事件里使用这两种技术效果非常好，它能够减轻脚本执行的压力

因为我们无法控制用户触发这些 DOM 事件的频次，但是我们可以人为地控制 DOM 事件处理器的执行频次

考虑如下代码：

HTML

``` html
<body>
  <div id="counter"></div>
  <script src="counter.js"></script>
</body>
```

CSS

``` css
body {
  min-height: 1000vh;
}

#counter {
  position: fixed;
  top: 50px;
  left: 50px;
  color: red;
}
```

JS

``` js
// counter.js
let counter = 0
let counterDOM = document.querySelector('#counter')

document.addEventListener('scroll', function() {
  counterDOM.innerText = counter
  counter++
})
```

如果你运行上面这个例子，你会发现滚动事件的触发可以高达每秒几十次，如果你使用手机来滑动屏幕，那么可能可以达到每秒上百次

这个执行次数是十分恐怖的，如果你的 scroll 事件处理器里面写了很复杂的业务逻辑代码

那么导致 JS 的执行阻塞页面的渲染，造成页面的卡顿

## 回顾历史

早在 2011 年，这个问题在 twitter 上被发现（估计那时候还没有 App）

当你滑动你的 twitter feed 页面的时候，页面会变得非常的卡顿，甚至没有响应

`John Resig` (jQuery 的作者)，发表了[一篇文章](http://ejohn.org/blog/learning-from-twitter)，阐述了这个问题

他指明了直接将开销非常大的 JS 函数直接添加到 scroll 事件的处理函数是非常糟糕的

`John Resig` 给出的解决方法是，在事件处理器外面写一个循环来判断是否要执行具体的业务逻辑

``` js
var outerPane = $details.find(".details-pane-outer"),
    didScroll = false;
 
$(window).scroll(function() {
    didScroll = true;
});
 
setInterval(function() {
    if ( didScroll ) {
        didScroll = false;
        // Check your page position and then
        // Load in more results
    }
}, 250);
```

这样，事件处理器和事件本身是解耦的，在外层我们能够直接控制事件处理器的触发时机

但是这样的话，我们就没法很好地分离代码了

后来就慢慢衍生除了 Throttle 和 Debounce 这样稍微复杂但是却很实用的方法

# Debounce

Debounce 简单地来说就是将一组连续的函数调用整合成一个函数调用

想象一下你搭电梯的场景，当电梯门关闭的时候，外面突然闯出一个人

他疯狂的按着电梯的按钮，这时候电梯并不会启动，而是再次将门打开

我们可以把电梯看作函数，函数为了最大化地使用资源，会延迟调用

我在 code pen 上写了一个 debounce 的可视化的例子

可以用来体会没有使用 debounce 的事件和使用了 debounce 的事件的差异（点击开始加载）：

点击 `start` 按钮然后狂戳 `Trigger` 按钮，你就能看到效果了

<iframe height='389' scrolling='no' title='Debounce' src='//codepen.io/Mactavish/embed/preview/JMjKPe/?height=389&theme-id=light&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/Mactavish/pen/JMjKPe/'>Debounce</a> by Mac for Real (<a href='https://codepen.io/Mactavish'>@Mactavish</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

我们可以发现，快速连续的事件触发是如何被一个单独的 debounce 事件取代的，但如果超过一定的间隙去触发事件的话，debounce 就和普通的事件没有什么差别

[未完待续]


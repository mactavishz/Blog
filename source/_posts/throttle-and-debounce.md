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

## Debounce

Debounce 简单地来说就是将一组连续的函数调用整合成一个函数调用

想象一下你搭电梯的场景，当电梯门关闭的时候，外面突然闯出一个人

他疯狂的按着电梯的按钮，这时候电梯并不会启动，而是再次将门打开

我们可以把电梯看作函数，函数为了最大化地使用资源，会延迟调用

我在 code pen 上写了一个 debounce 的可视化的例子

可以用来体会没有使用 debounce 的事件和使用了 debounce 的事件的差异（点击开始加载）：

点击 `start` 按钮然后狂戳 `Trigger` 按钮，你就能看到效果了

<p data-height="378" data-theme-id="light" data-slug-hash="JMjKPe" data-default-tab="result" data-user="Mactavish" data-embed-version="2" data-pen-title="Debounce" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/Mactavish/pen/JMjKPe/">Debounce</a> by Mac for Real (<a href="https://codepen.io/Mactavish">@Mactavish</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

我们可以发现，快速连续的事件触发是如何被一个单独的 debounce 事件取代的，但如果超过一定的间隙去触发事件的话，debounce 就和普通的事件没有什么差别

上述的代码我们使用的是 `Lodash` 的 debounce

比较关键的一点是，我们设定了触发的时机是 `leading edge` 也叫 `immediate`

这样我们不需每次触发都需要等上一段时机才能看到效果，同时也保证了频繁大量的调用在短时间不会触发，而必须超过等待的间隙

因此我们就得到了一个能够立即触发但是又拥有 `debounce` 行为的函数了

> 在 lodash 中，这个参数为 `leading` 而在 underscore 中，这个参数为 `immediate`

### Debounce 的用途

最常见的都就是 window 对象的 `resize` 和上面提到过的 `scroll` 事件

这两个都是用户可能会高频触发的事件，所以用 debounce 就再合适不过了

再有就是我们常见的用户输入自动补全提示

通常我们要使用 Ajax 请求去后端获取补全的数据

那么当用户在还在输入的时候，我们为什么还要去不断地请求数据呢

debounce 可以很好地帮助我们判断用户停止输入的时机，并且在用户停止输入的时候去请求数据

如果你使用的是 `lodash` 那只需要将 `leading` 设为 `false` 即可

具体的 demo 我在这里就不呈现了

## Debounce 的实现

最早提出 debounce 并实现的人是 [John Hann](http://unscriptable.com/2009/03/20/debouncing-javascript-methods/), 他 2009 年的一篇博客里阐述了 debounce 的简单实现

之后 `underscore.js` 和 `lodash.js` 也分别实现了 debounce 的功能

`lodash` 的版本添加了更多的功能，参数也比 `underscore` 要多

上面提到的 `immediate` 和 `leading` 就是其中参数的不同

我们主要来看看 `lodash` 的 debounce 的实现

``` js
// since 0.1.0
function debounce(func, wait, options) {
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    // 上次用户触发调用的时间
    lastCallTime

  // 上次函数真正被调用的时间
  let lastInvokeTime = 0
  // leading 用来控制一系列调用的前沿调用
  let leading = false
  let maxing = false
  // trailing 用来控制一些列的调用的末尾调用
  let trailing = true

  // 首先判断第一个参数是否是一个 function
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }

  // 对 wait 做类型转换，如果传的是字符串形式的数字可以转化为数值
  wait = +wait || 0
  // 参数注入
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    // 最大等待时长
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  //  func 参数对应函数的实际调用
  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  // 处于 leading edge 时
  function leadingEdge(time) {
    // 重置新的一轮 'maxWait'
    lastInvokeTime = time
    // 开启 trailing edge 的 timer
    timerId = setTimeout(timerExpired, wait)
    // 如果有设置 leading 为 true 则立即执行
    return leading ? invokeFunc(time) : result
  }

  // 计算剩余等待时间
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // 当处于以下几种状态时才允许调用 func
    // 1. 首次调用
    // 2. 用户活动停止了并且我们处于 'leading edge'
    // 3. 系统时间倒退了...我们把这个情况看作处于 `trailing edge`
    // 4. 或者我们已经到达了 `maxWait` 时间点
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }
  
  // 计时器
  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }

    // 开启到剩余时间结束的 timer
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  // 处于 trailing edge 时
  function trailingEdge(time) {
    timerId = undefined

    // 只会在 func 至少被 debounce 一次的时候调用
    // 这意味着假如 leading edge 为 false
    // 用户也至少主动触发过一次，并且 trailing 为 true 时才会调用
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }


  // 实际的 debounce 函数体
  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    // 如果可以执行函数
    if (isInvoking) {
      // 到达 leading Edge
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }

      if (maxing) {
        // 处理紧密的循环调用
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }

    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait)
    }
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}
```

## Throttle

理解了 debounce 之后，throttle 就很好理解了，throttle 其实就有带有 `maxWait` 的 debounce

这里要引入一个概念，就是 `leading edge` 对立面： `trailing edge`

`trailing edge` 是我们调用队列中最后一次的调用，所以也可以称之为调用尾部

也就是说，除了在 `leading edge` 会调用之外，即使用户非常频繁地触发

至少也会在一定时间内调用一次，而不会等待一定的间隔才能触发

throttle 保证了函数执行的规律性，至少每 x 毫秒执行一次

我们来看看之前那个例子的 throttle 版本，感受下 throttle 和 debounce 之间的区别

<p data-height="372" data-theme-id="light" data-slug-hash="zpoEjj" data-default-tab="result" data-user="Mactavish" data-embed-version="2" data-pen-title="Throttle" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/Mactavish/pen/zpoEjj/">Throttle</a> by Mac for Real (<a href="https://codepen.io/Mactavish">@Mactavish</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Throttle 的例子

Throttle 最常见的例子就是无限滚动(infinite scrolling)

当用户不停的滚动的时候，我们要不停地监测距离页面底部的距离

然后提前加载更多的内容

这时候如果使用 debounce 就没有效果了，因为我们不可能指望用户会主动地停下来

而使用 Throttle 我们就能在减少开销的情况下，又保证一定时间内会主动触发

## Throttle 的实现

还是以 `lodash` 为例，有了 debounce 的实现之后

其实我们只需要使用不同的参数来调用 debounce 即可

``` js
function throttle(func, wait, options) {
  let leading = true
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }

  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  })
}
```

## 总结

使用 Throttle 和 Debounce 都可以来优化高频事件触发，他们之间虽有不同，但是基本原理上是一致的

注意下使用场景的不同即可

## 参考

> https://github.com/lodash/lodash/blob/master/debounce.js
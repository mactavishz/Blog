---
title: Box Sizing 最佳实践
date: 2017-12-20 23:27:09
tags: [CSS]
---

## 前言

这篇文章的前提是要充分了解 CSS 盒模型相关的知识，这里不做探讨

感兴趣的可以看看 MDN 上关于 [盒模型](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model) 的文档，讲得还是蛮详细的

## 最佳实践 

一直来，`box-sizing` 都是我们页面布局的利器，因为它一定程度上省去了我们人为去计算宽度和高度麻烦

通常，我们可能想要页面上的元素都基于 `border-box` 去进行计算

这时候我们可能会利用 `css reset`，来对页面上所以的元素进行样式重置

那么我们要怎么样去写 CSS 选择器呢？

假如我们直接使用通用选择器来设置：

``` css
* {
  box-sizing: border-box;
}
```

这样写固然方便，但是会有一些潜在的问题

比如，当我们有一个特殊的组件，它设计出来就是需要使用 `content-box` 或者是 `padding-box`，那么上面这种写法实际上是会产生一些问题的

``` css
.component {
  /* 某个组件的特殊行为 */
  box-sizing: content-box;
}
```

这种写法乍一看没什么问题，但是，`component` 的子元素却仍然是 `border-box`:

``` html
<div class="component"> <!-- 这里是 content-box -->
  <header> <!-- 仍然是 border-box -->
  </header>
</div>
```

为了，让我们的 `box-sizing resets` 更加地直观且符合常理，我们可以使用样式继承来实现，这样后代的变异行为会得到保留：

``` css
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
```

虽然只是短短的一小行代码，但是却省了很多不必要的麻烦

## 扩展

当然我们还可以考虑更多的情况，比如一般情况下，我们可能想要 `img` 元素表现为 `content-box`，因为我们可能不希望将 `padding` 和 `border` 计算到宽度当中，这时候我们我们可以改写为：

``` css
html {
  box-sizing: border-box;
}
*:not(img), *:before, *:after {
  box-sizing: inherit;
}
```

使用 `:not` 伪类，我们可能排除掉所有的 `img` 元素

但是这种写法可能会导致额外的匹配开销，使 CSS 查找效率变低，因为它需要去对每个元素进行比对，决定其是否是 `img`

所以我们不如改写为:

``` css
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}

img {
  box-sizing: content-box;
}
```

简单的写法不一定是最好的写法，实践才能得真知。

## 参考

> * https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/

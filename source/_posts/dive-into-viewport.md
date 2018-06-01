---
title: 走进 Viewport 的世界
date: 2018-05-23 21:45:50
tags: [HTML, 浏览器]
---

## 概述

基本上我们都知道，在做移动端 Web 开发的时候，我们为了让浏览器能够在小屏幕上（通常是手机）给用户呈现一个良好的视觉效果，我们往往需要在 HTML 中加上这样一段代码：

``` html
<meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
```

然后，我们的页面就神奇地适应了屏幕的大小，那么这段几乎被封为响应式页面的 “实施标准” 代码的含义是什么呢？

在这篇文章中，我将详细地阐述有关 `viewport` 的内容，相信读完之后一定会有一个全面的了解。

## 屏幕与像素

在我们进入 `viewport` 相关内容之前，我们最好先了解一下和屏幕以及像素有关的知识。

### Pixel 像素

像素的德语 “Bildpunkt” 是图像点的意思，我们用像素来代表图像的一个最小的可控元素。

我们之所以能在各种各样的显示设备上看到色彩丰富、形状鲜明的图像，是因为有无数个很小很小显示单元，一般我们称之为物理光栅点，你可以理解为一个很小的发光元器件。成千上万的光栅点根据不同的排列组合，就能形成不同的图像。

但是要注意，在不同的背景下，1 像素可能有着不同的大小，这取决于设备如何形成数字图像。

不过，我们仍然可以粗略地理解为 —— 一张同样大小的图片，它所包含的像素点越多，它就越清晰，细节内容就越多。

### Physical Pixel 物理像素

物理像素也称作**设备像素**，它代表了显示设备的最小的一个显示元器件。比如 iPhone 4 的屏幕分辨率是 960x640，这意味该设备纵向有 960 个物理像素，横向有 640 个物理像素。

在之后我们也会谈论到物理像素，它可以称作我们直觉上最觉得 “正确” 的像素单位，因为它和实际的设备紧密联系。

因此我们也用设备像素的长宽乘积形式来表示某个显示设备的**屏幕分辨率**。

![](./device.png)

### PPI（Pixel Per Inch）每英寸像素数

PPI 是我们最常见，也最容易听到的一个单位，请看下面的例子：

> 今天我们的新手机发布啦，我们新手机屏幕的 PPI 轻松地突破了 300 PPI

相信自从 iPhone 开始席卷中国大陆的手机市场的时候，我们经常能够听到对于手机屏幕的这样的一个形容，尤其是在手机发布会上，参数里必定有这么一项。

首先，我们要了解一个重要的事实依据：当手机开发商声明某某手机的屏幕尺寸是多少寸或者多少英寸，实际上指的是屏幕的**对角线的长度**。

那么 PPI 实际上就是设备屏幕分辨率宽高各自开平方之和再开平方并除以对角线长度（单位英寸），其实就是简单的勾股定理。

比如，iPhone 4 的分辨率是 960x640，它的尺寸是 3.54 英寸（对角线长度），那么 iPhone 4 的 PPI 就是:

```
  √(960^2 + 640^2) / 3.54 ~= 326 PPI
```

由此可见，我们也可以说 PPI 是**屏幕像素密度**，因为它所反映的是一个单位范围 (英寸) 内所容纳的像素的数量。

根据苹果产品发布会上的定义，PPI 高于 210（笔记本电脑）、260（平板电脑）、300（手机）的屏幕都可以称之为 Retina 屏。

这里顺便提一下苹果所发明的 “Retina” 屏幕也称作视网膜屏幕的说法，它指显示屏的分辨率极高，也就是 PPI 极高，使得肉眼无法分辨单个像素。

![](./PPI.png)

### DPI (Dot Per Inch) 每英寸点数

DPI 指的是每英寸 “点数”，那么这个 “点数” 和像素又有什么不同呢？我们已经知道了像素本身是一个度量单位，其实 “点” 也是一个基本的度量单位，因为 DIP 常用于形容打印机的输出分辨率，打印机不像屏幕那样精确，它的墨水喷头大小有限，所以用 “点” 来形容更加合适。

同理，DIP 越高，打印机打印出来的图像越清晰。

一般来说 DPI 和 PPI 是可以互相指代的，不同的语境使得他们产生了不同的含义，大体上他们所表达的意思是相同的。

![](./DPI_and_PPI.png)

这里之所以要提一下 DPI 是因为，在 Android 设备上，DPI 取代了 PPI 成为了像素密度的衡量单位，计算的方式和 PPI 也是一样的。

### DP/DIP (Density-independent Pixels) 独立密度像素

鉴于 DP 和 DIP 其实是一回事儿，所以我接下来就全部用 DP 来替代，以免产生混淆。 DP 也被称为设备无关像素，因为 DP 是一个抽象的单位，它填平了不同设备之间的 DPI 的差异。

同时在 Android 开发中，dp 也是用于布局的一个基本长度单位。

在 Android 上，`1px(这里的 px 指的是物理像素) = dp * (dpi / 160)`，例如在 240 dpi 屏幕上，1 dp 等于 1.5 物理像素。

这个等式里面的 160 是怎么来的呢？

> 答：这个在Google的官方文档中有给出了解释，因为第一款Android设备（HTC的T-Mobile G1）是属于160 dpi 的。但是按照之前我们所说的 dpi/ppi 的计算方式，T-Mobile G1 的 dpi 是 180。
> 这个问题没有一个明确的解答，大部分人所认同的说法是 180 不好做适配，但是 160 无论是乘以 0.5/2/1.5 都很好适配。 —— 来自知乎

### CSS 像素

不要被我们平时在开发中所手写的 CSS 像素所迷惑了，CSS 像素不过和 DP 一样，是抽象的单位。同 1px 的 CSS 像素在不同的显示设备上可能会产生不同的效果。

举个栗子，假如我们现在的设备是 1 CSS 像素对应 1 物理像素，那么我们用 CSS 画一个 2x2 的正方形，这时候四个像素处于 100% 的缩放级别

![](./cssp1.gif)

那么假如我们对屏幕缩放（缩小），那么 CSS 像素就会开始收缩，现在 1 物理像素会覆盖好几个 CSS 像素

![](./cssp2.gif)

反之，如果我们放大屏幕，那么 CSS 像素就会开始增大，然后 1 CSS 像素就会覆盖好几个物理像素

![](./cssp3.gif)

举这个例子的目的是为了说明 CSS 像素的独立性，我们在开发的时候应该专注于 CSS 像素，这些像素的值决定了我们的样式的渲染情况

而用户对页面的缩放，会导致 CSS 像素在屏幕上自动调整渲染效果，所以我们不用太担心。

那么问题来了，1 CSS 像素真的严格等于 1 物理像素吗？

### 高 DPI 下的 CSS 渲染

还记得之前我们提到的 “Retina” 屏幕吗，仔细想想，如果我们在一个低 dpi 的设备和一个高 dpi 的设备（如 Retina 屏幕）上同时渲染一个 200px 的 div，那么会是什么情况呢？

假如屏幕的尺寸是相同的，那么，高 dpi 的设备会使用更多的**物理像素**来渲染。

如何知道一个 CSS 像素应该由几个设备像素来渲染呢？我们先带着这个问题来了解一下什么是 viewport，稍后再做解答。

## Viewport

viewport 的意义在于控制我们网站的最顶级元素 —— `html` 元素。

举个例子：当我们在 `body` 中定义了一个侧边栏，侧边栏的宽度是 10%，当你改变浏览器的窗口大小的时候，这个侧边栏会自动的放大和收缩。

我们忽略一些特殊情况，从技术上来说侧边栏的宽度是它父元素宽度的 10%，而 `body` 是一个块状元素，一个块状元素占其父元素的 100% 的宽度，所以 `body` 元素的宽度就等同于 `html` 元素的宽度。

那么 `html` 元素到底有多宽？在原理上，`html` 元素的宽度受 viewport 所限制，`html` 元素为 viewport 宽度的 100%。

那么反过来，我们知道 `html` 的宽度就是浏览器窗口的宽度，所以我们也可以说 viewport 是严格等于浏览区窗口的。

要注意的是，`viewport` 不是 HTML 的概念，所以我们不能通过 CSS 来修改它。

### 三种 Viewport

我们在对移动端布局的时候会遇到三种 viewport:

* `visual viewport` 视觉视口
* `layout viewport` 布局视口
* `ideal viewport` 理想视口

这三种视口的概念是由业界大神 [PPK](https://www.quirksmode.org/about/) 提出的，也是业内最为推崇的关于 viewport 的理解。

#### Viusal Viewport

顾名思义，视觉视口就是屏幕上浏览器可视的可视区域，这一点没有争议。

用户可以通过滚动、缩放来改变 visual viewort 的尺寸。

然而，我们在利用 CSS 布局的时候，尤其是百分比的宽度，通常是按照另外一种 viewport 来定义的，那就是 layout viewport。

#### Layout Viewport

顾名思义，布局视口是用于我们对页面进行布局的一个参考系。

George Cummins 在 [Stack Overflow](https://stackoverflow.com/questions/6333927/difference-between-visual-viewport-and-layout-viewport) 上对于 layout viewport 和 visual viewport 作出过一个很好的比喻：

> 想象一下，layout viewport 是一张固定的不能改变大小的图片。现在我们需要通过一个更小的框来观察这张图片的细节，我们只能通过个框来观察，超出这个框之外的范围我们都看不到。我们通过这个框所看到的部分，称之为 visual viewport。你可以拿着这个框离图片远一点（用户缩小），或者离的近一点（用户放大）来选择你想要看到的图片的某个部分。但是无论你怎么做，这张图片的大小和形状是不会发生改变的。

我们来看一下 PPK 给出的一个[例子](https://www.quirksmode.org/mobile/viewports/)以便更好地理解 layout viewport 和 visual viewport 的关系。

注意：但是在移动设备上，从竖屏模式切换到横屏模式，layout viewport 会发生改变，以适应屏幕。

>  users can change the scale of the viewport but not the size. The only exception is when the user changes from portrait to landscape orientation—under certain circumstances, Safari on iOS may **adjust the viewport width and height**, and consequently, change the webpage layout. 
 —— Apple Developer Reference

##### Layout Viewport 的宽高

那么 layout viewport 的宽度是多少呢？

每个浏览器都不同，默认情况下，iPhone 的 Safari 使用 980 px，Opera 使用 850 px，安卓 Webkit 内核的浏览器使用 800px...

我们可以用 `document.documentElement.clientWidth/Height` 来获取 layout viewport 的宽高。

> If the elemen t is the **root element** and the element’s node document is not in quirks mode, or if the element is the HTML body element and the element’s node document is in quirks mode, return the **viewport width** excluding the size of a rendered scroll bar (if any).
—— https://drafts.csswg.org/cssom-view/#dom-element-clientwidth

即使你给 `html` 元素设置了诸如 `width: 25%` 的 CSS 属性，仍然不会影响 `document.documentElement.clientWidth/Height` 的返回值，这对属性虽然貌似从 `html` 元素取值，但是实际描述的是 layout viewport 的尺寸。

但是，`window.innerWidth/Height` 不是也可以获取 viewport 的尺寸吗？

> The innerWidth attribute must return the viewport width including the size of a rendered scroll bar (if any), or zero if there is no viewport.
—— https://drafts.csswg.org/cssom-view/#dom-window-innerwidth

是也不是，因为讨论这个问题有点吹毛求疵了。

首先，`window.innerWidth/Height` 包含了滚动条的宽高，而 `document.docuemntElement.clientWidth/Height` 则不包含滚动条的宽高。

其次，我们现在能同时获取这两个特性对是因为他们是浏览器大战时期的产物。

过去 Netscape 只支持 `window.innerWidth/Height`，IE 只支持 `document.documentElement.clientWidth/Height`。

从那时候开始所有其余浏览器同时支持这两个特性，但 IE 一直不支持 `window.innerWidth/Height`。

![](./layout-viewport.jpg)

建议你可以在浏览器里面打开 devtool 来试一下。

如果我们要获取 `html` 元素的宽高的话，那么需要使用 `document.documentElement.offsetWidth/Height`

![](./html-size.jpg)

可以在手机上打开这个[页面](https://www.quirksmode.org/m/tests/widthtest.html)来测试。

##### 设置 Layout Viewport

我们可以通过 `meta viewport` 来设置 layout viewport 的宽度, 形式如下：

`<meta name="viewport" content="name=value,name=value">`

这个 meta 标签是由 Safari 所实现的，后来被其他浏览器也采用。

`content` 内的键值对书写规则如下：

* 不允许使用分号作为分隔符
* 可以使用空格作为分隔符，但是最好使用逗号来分隔
* 对于数字属性，如果 `name` 后面的值是个非数值，但是以数值开头，比如 `1.0x` 或者 `123x456`，那么则截取前面数值的部分，如果是非数值开头，则直接取 0

一共有以下这些键可以供选择：

* width 设置 layout viewport 的宽度，默认值是 980 (大多数浏览器)，范围 200 - 10000
* height 设置 layout viewport 的高度，默认值基于设备的宽高比计算，范围 223 - 10000
* initial-scale 设置页面的初始缩放等级以及 layout viewport 的宽度
* minimum-scale 设置最小允许的缩放等级（用户可以缩小多少），默认值 0.25，范围 > 0 到 10.0
* maximum-scale 设置最大允许的缩放等级 (用户可以放大多少)，默认值 5.0， 范围 > 0 到 10.0
* user-scalable 当设置它的值为 `no` 的时候将禁用用户缩放，默认值 yes，可选值是 yes 和 no

我在 Safari HTML Ref 中发现了一个有趣的细节，如果设置了 `user-scalable` 为 `no` 的情况下，除了禁止用户的缩放行为，同时还会在进入 input 文本域的时候禁止页面的自动滚动，这或许就是移动端解决小键盘遮挡输入框的关键？

对于 `width` 和 `height` 有两个特殊的值可供选择，那就是 `device-width` 和 `device-height`。

这两个值会将 layout viewport 设置成 ideal viewport (我们待会儿再谈)的宽高。

它们会将 layout viewport 的宽高设置为 ideal viewport 的宽高，但是 `device-height` 的实现会产生一些奇怪的行为，所以最好是不要用这个属性，并且对于开发者来说，我们更关心的是设备的宽度而不是高度。

而对于 `initial-scale` 来说，当你设置它的值为 1 的时候，浏览器会对 `width` 进行推断(推测你想要的宽度和可视区域一样)，浏览器会在竖屏模式下采用 `device-width` 在横盘模式下采用 `device-height`。

![](./initial-scale.jpg)

因此，如果你想要 layout viewport 的宽度是一个固定值，并且初始缩放是 1 的情况，那么两个值都要去主动设置：

`<meta name = "viewport" content = "width = 500, initial-scale = 1.0">`

同理，当你只设置 `width` 属性的时候， `height` 和 `initial` 将会自动调整，横盘和竖屏模式视口宽度都是一样的，但是 initial-scale 会发生改变，并且在用户从竖屏切换到横盘的情况下，会发生类似于放大的效果。

![](./device-width.jpg)

#### Ideal Viewport 理想视口

关于 ideal viewport 这个概念，我觉得只是 ppk 提出来的一个理论，并没有绝对确凿的证据来支持，至少我不管我费尽了多少心思来查找关于 ideal viewport 的内容，最终都会回到 ppk 的博文...

![](./wtf.jpg)

ppk 表示：理想视口提供了网页在设备上的渲染的理想尺寸，因此 ideal viewport 的维度因设备而异。

在旧的那些非 retina 屏幕的显示设备上，理想视口的大小就等于设备屏幕的物理像素，但具有较高像素密度的新设备可能会保持原有的 ideal viewport 的尺寸，因为这个尺寸非常适合这些设备。

比如，直至并包括 iPhone 4S, iPhone 的 ideal viewport 是 320x480, 无论这个 iPhone 是否是 retina 屏幕，因为 320x480 是这些 iPhone 渲染网页时的理想尺寸。

值得注意的是：

1. layout viewport 可以被设置为 ideal viewport 的值，通过 `width=device-width` 以及 `initial-scale=1` 来实现
2. 所有 `scale` 相关的的指令都是相对于 **ideal viewport** 的，而不论 layout viewport 的值最终是什么

关于获取 ideal viewport 维度的方法，之前其实我们已经提到过了，使用 `document.documentElement.clientWidth/Height` 就可以获取

让我们思考一个问题 `screen.width/height` 是否能让我们获取 ideal viewport 的信息呢？

在规范里，关于 screen 对象底下的 `width/height` 属性是这样描述的：

> * The width attribute must return the width of the **Web-exposed screen area**
> * The height attribute must return the height of the **Web-exposed screen area**

关于 `Web-exposed screen area`, 规范里又是这么描述：

> The Web-exposed screen area is one of the following:
* The area of the output device, in CSS pixels
* The area of the **viewport**, in CSS pixels

然而这个属性在不同设备上获取的值的情况不大一样，所以不太准确，无法作为参考依据，我们可以打开这个[链接](https://www.quirksmode.org/m/tests/widthtest.html)来做测试

至少在我的小米 MIX2 的浏览器里，即使我将 `width` 设置为固定值 380, `screen.width/height` 依旧得到的是 ideal viewport 的尺寸。

通过上面的阐述，我们大概已经明确了 viewport 的概念，现在回到我们之前提出的那个问题，1 CSS 像素到底需要由几个设备像素来渲染？

要回答这个问题，我们就需要引出 `devicePixelRatio` 这个概念。

## devicePixelRatio 设备像素比

`window.devicePixelRatio` 的值指的是物理像素与设备独立像素(device-independent pixels/dips，注：和我们之前说到的 dip/dp 不一样)

记住一个重要的等式： `window.devicePixelRatio = 物理像素 / 设备独立像素`

Dips 是抽象的像素，用于给 `media query` 的 `width/height` 以及 `meta viewport` 的 `device-width` 提供信息

因此我们可以得出，dips 就是 **ideal viewport** 的像素，它的值因设备而异。

在非 retina 屏幕的 iPhone 上，当我们使用 `<meta name="viewport" content="width=device-width">`，我们设置 layout viewport 的宽度为 320px，而此 iPhone 的物理像素就是 320px（宽度）。

因此，非 retina 屏幕的 iPhone 同时具有 320px 的物理像素和 dips。所以，`window.devicePixelRatio` 的值是 1。

而 retina 屏幕的 iPhone 具有 640px 的物理像素，使用 `<meta name="viewport" content="width=device-width">`之后的 layout viewport 仍然是 320。

所以 dips 依旧是 320，即使它的物理像素是 640，因此，`window.devicePixelRatio` 的值是 2。

而鉴于我们的 CSS 布局是基于 layout viewport 的，那么我们可以回答之前的那个问题了，1 CSS 像素对应着 `window.devicePixelRatio` 个物理像素

注意我们所说的是一维的概念，如果我们要扩展到二维的概念，就需要相乘一下，比如在 `window.devicePixelRatio = 2` 的情况下，1 CSS 像素等同于 2 物理像素，那么我们若要画出一个 2x2 的正方形，就需要用到 `(2x2) x (2x2)` 个物理像素，也就是 16，这只是很简单的乘法运算而已。

![](./dpr.gif)

## Dpr 的实际运用

Dpr 的一个实际运用就体现在多设备布局一致性的解决上，当我们需要适配的机型越来越多，但是又希望在不同机型上显示的效果完全一样，也就是达到 “等比缩放” 的效果。

![](./iphone.png)

关于 Dpr 的实际运用，最经典的应该就是手淘的 [flexible](https://www.w3cplus.com/mobile/lib-flexible-for-html5-layout.html) 方案

其实，理解了 viewport 之后，再来看 Flexible 方案就非常容易理解了, 其主要分为三部：

**计算设备 dpr**

``` js
if (!dpr && !scale) {
    var isAndroid = win.navigator.appVersion.match(/android/gi);
    var isIPhone = win.navigator.appVersion.match(/iphone/gi);
    var devicePixelRatio = win.devicePixelRatio;
    if (isIPhone) {
        if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
            dpr = 3;
        } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
            dpr = 2;
        } else {
            dpr = 1;
        }
    } else {
        // 其他设备下，仍旧使用1倍的方案
        dpr = 1;
    }
    scale = 1 / dpr;
}
```

**动态设置 meta viewport**

``` js
docEl.setAttribute('data-dpr', dpr);
if (!metaEl) {
    metaEl = doc.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(metaEl);
    } else {
        var wrap = doc.createElement('div');
        wrap.appendChild(metaEl);
        doc.write(wrap.innerHTML);
    }
}
```

**根据设计稿计算根元素 font-size 的值**

比如，设计稿宽度是 750px，那么我们可以将设计稿平分为 100 份，这里一份称作 `1a`

同时 `1rem` 认定为 `10a`

```
1a = 7.5px
1rem = 75px
```

那么此时整个设计稿被均分为 10 份，每份为 `10a`，整个宽度为 `10rem`

然后在布局的时候，值需要将原始的 `px值` 除以 `rem 基准值` 即可, 就可以得到实际的布局用的 `rem`

同时我们也需要将自己的页面的宽度划分为 10 份，并计算出 `1rem` 所对应的 `px值`，然后给根元素设置 `font-size`

其实我们也可以看到，`flexible` 方案其实是通过 JS 来模拟 `vw` 的特性，那么其实到现在为止， `vw` 的兼容性已经非常好了，所以我们也可以考虑直接使用 `vw` 来进行布局，关于这个方案的讨论可以参考手淘最新的 [vw 布局方案](https://www.w3cplus.com/css/vw-for-layout.html)

而 flexible 布局上解决了**部分** `retina` 屏幕上 `1px` 边框的问题，但是实际我们还是要去做一些兼容的方案，不过这又是另外一个话题了，感兴趣的朋友可以阅读[这篇文章](https://www.w3cplus.com/css/fix-1px-for-retina.html)

## 参考资料

> * https://en.wikipedia.org/wiki/Pixel
> * https://en.wikipedia.org/wiki/Dots_per_inch
> * https://medium.com/@onlinelogomaker/what-is-the-difference-between-dpi-ppi-resolution-and-image-size-b42328e7ed22
> * https://developer.android.com/guide/practices/screens_support#terms
> * https://apple.co/2kwZFYP (链接太长了，压缩成短链)
> * https://www.quirksmode.org/mobile/viewports.html
> * https://www.quirksmode.org/mobile/viewports2.html
> * https://www.quirksmode.org/mobile/metaviewport/
> * https://www.quirksmode.org/blog/archives/2012/06/devicepixelrati.html
> * https://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
> * https://www.w3cplus.com/mobile/lib-flexible-for-html5-layout.html
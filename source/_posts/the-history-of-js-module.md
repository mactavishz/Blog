---
title: JavaScript 模块的前世今生
date: 2018-04-20 17:42:02
tags: [JavaScript]
---

## 令人费解的术语

AMD, CommonJS, UMD, Import, Export，相信大多数前端开发者都或多或少地看见过这些模块相关的术语

对于新入坑的开发者，哪怕是已经有了一段时间开发经验的开发者，都不一定能全部了解这些术语背后的含义

然而它们早已渗透到我们日常的开发中，今天我们就来回顾一下 Javascript 模块系统的前世今生

## 我们为什么需要模块

* Web sites 正在不断地向 Web Apps 转变
* 随着站点功能的增加，站点的代码的复杂度也在不断地增长
* 组合不同的功能代码变得越来越困难
* 开发者们需要使用分散的 JS 文件/模块
* 部署的时候需要拆分文件来优化 HTTP 请求

**模块可以让我们实现：**

* 代码抽象
* 代码封装
* 代码复用
* 依赖管理

## 前端开发者们所需要的解决方案

* 类似于 `#include`, `import`, `require` 的解决方案
* 能够处理模块间互相嵌套的依赖关系
* 提供统一的约定来编写模块
* 便于开发者使用，并能够提供一些优化和开发调试相关的工具

## 回顾不同的模块模式

### 全局变量

``` js
var Module = function() {}
var myModule = Module()

window.Module === Module // true
```

### 命名空间

``` js
window.NS = {} || window.NS
NS.someModule = function() {}
myModule = NS.someModule()
```

### IIFE (立即执行函数表达式)

``` js
(function() {
  var someModule = function() {}
  // do something
})()
```

### Revealing Module Pattern (暴露模块模式)

``` js
// Expose module as global variable
var Module = function(){

  // Inner logic
  function helloWorld(){
    console.log('Hello World');
  }

  // Expose API
  return {
    sayHello: sayHello
  }
}()
Module.helloWorld()
```

或者

``` js
var Module = function(){

  // Inner logic
  function helloWorld(){
    console.log('Hello World');
  }

  // Expose API
  return {
    sayHello: sayHello
  }
}

var myModule = new Module()
myModule.helloWorld()
```

然而以上的这些方法都不能称之为真正意义上的 "模块"，因为它们都没有一个健全的依赖管理的机制和严格的模块规范

## CommonJS —— 规范 Or 组织？

什么是 CommonJS，多数人一听到这个词的第一反应就是模块规范，然而事实并不是这样

我们来看看 CommonJS [官方 wiki](http://wiki.commonjs.org/wiki/CommonJS) 的定义：

> a group with a goal of building up the JavaScript ecosystem for web servers, desktop and command line apps and in the browser

CommonJS 是一个致力于定义一些系列规范来帮助 Javascript 建立在 web 服务端，桌面端和命令行应用以及浏览器的**生态系统**的一个组织

CommonJS 的模块规范只是它规范当中的一部分而已，然而这个规范又比较出名，所以久而久之，大多数人就把 CommonJS 直接联系为模块规范

其实最早的时候，它们还不叫 CommonJS，叫 ServerJS，那个时候 Node 也才刚刚诞生，同领域中还存在着很多竞争者

### CommonJS Module !== Node.js Module

严格意义上来说，Node 的模块系统只是参考了 CommonJS 的模块规范，并不是严格地遵守了 CommonJS 的模块规范

其实 Node 在开发的过程中已经逐渐形成了和 CommonJS 类似的模块规范，具体可以参考这个 [Github issue](https://github.com/nodejs/node-v0.x-archive/issues/5132#issuecomment-15432598) 下的讨论

> Ryan basically always gave zero fucks about CommonJS anyway
> he said to me, "Forget CommonJS. It's dead.  
------ 节选自 NPM 的作者 Isaac Z. Schlueter

不过这不是重点，重点在于 CommonJS 和 Node.js 的模块规范是相似的，仅有着细微的差别:

> A few good things came out of CommonJS. The module system we have now is basically indistinguishable from the original "securable modules" proposal that Kris Kowal originally came up with.

考虑到 Node.js 的流行，Node.js 的模块的接受程度更高

在 Node.js 模块和 CommonJS 模块 中，存在两个必需的元素 `require` 和 `exports` 来和整个模块系统交互

`require` 是一个全局方法，可在当前作用域来导入其他的模块，它的参数便是模块的 `标识符（id）`

`exports` 是一个特殊的对象，任何添加到这个对象上的属性都会被暴露出去作为公共的接口

而 CommonJS 和 Node.js 的一个重大区别体现在 `module.exports` 对象上

在 Node.js 当中，`module.exports` 对象是真正暴露出去的对象，而 `exports` 只是默认绑定到 `module.exports` 对象的一个全局变量，而在 CommonJS 当中，则完全没有 `module.exports` 这个属性

如果我们用一段简单的代码来表述则是:

```js 
let module = {
  exports: {}
}

(function(module, exports) {
  exports.multiply = function (a, b) { return a * b }
}(module, module.exports))

let f = module.exports.multiply
f(5, 10) // 50
```

这段代码很好的阐述了 `exports` 和 `module.exports` 之间的关系

### CommonJS 模块

如之前提到的，CommonJS 模块规范提出的初衷就是为了解决在服务端加载模块的问题

而在服务端，同步加载是一件很正常的事情，同时也保证了模块加载的有序性

这也是我们常说的，在 node 环境中，只有当 require 执行的时候，才知道它到底引用了什么

所以，虽然 CommonJS 模块解决了我们操作和组织模块的问题

但是并不适用于浏览器环境，因为不支持模块的异步加载

而我们都知道，对于浏览器来说，任何长时间同步的行为都会阻塞浏览器的渲染，所以我们都尽量希望脚本是异步加载的

那么 CommonJS 模块能不能在浏览器里面用呢？答案是可以的

### CommonJS in Browsers

之前说过直接同步的加载是不可取的，那么想在浏览器使用 CommonJS 的模块的话，就需要使用到一些编译工具：

#### Browserify

比如 Browserify，它的 README.md 是这样描述的：

> browserify will recursively analyze all the `require()` calls in your app in order to build a bundle you can serve up to the browser in a single `<script>` tag.

通过 Browserify，我们可以编写 nodejs 模块风格的代码，然后用它编译，browserify 会递归解析依赖关系，然后将其 build 成一个 bundle 文件，然后我们只需要在页面上用 script 标签引入即可, 所有的依赖的模块都会被打包进这个文件中

#### Webpack

Webpack 也支持在客户端的 CommonJS 模块

我们也需要使用 Webpack 去编译 nodejs 模块风格代码，然后生成具体的 bundle 文件...

这些浏览器上的 CommonJS 的解决方案都无法避免一个 `编译` 的过程，并且调试代码也对开发者不友好，并且编译一旦报错，还需要去控制台里寻找报错信息，并分析报错原因

## AMD: Asynchronous Module Definition

AMD 全称是 `Asynchronous Module Definition`，顾名思义，它是用来定义异步加载的模块的一个 API

最早是 `requireJS` 的作者 `James bruke` 在 CommonJS 社区发起的一个提案[CommonJS Transport/C proposal](http://wiki.commonjs.org/wiki/Modules/Transport/C),这个提案所提出的 `Transport format（格式转换）` 能够将传统的 CommonJS 模块通过转换映射成能够在浏览器内良好运作的格式

而在实现这个 `Transport format` 的过程中，他发现，CommonJS 的 `require` 是命令式的(imperative)，而这一点在 web 环境中是非常尴尬的

所以一个更好的方案是 `callback-based` 的 `require` 方案

在这个过程中，一个叫做 `Kris Zyp` 的大佬想出了如何让匿名模块在这种格式下工作。此时，Kris 觉得它可以作为模块 API 提案，而不仅仅是传输格式，于是他在它在 CommonJS 的 wiki 中创建一个 AMD API 的提案

然而这个观点在 CommonJS 社区中产生了分歧，社区很难就这个问题达成一致

但是仍然有许多开发者认为这提案非常有价值，并开始为这个提案实现具体的功能, 于是 AMD 逐渐转变并形成了具体的模块定义的 API

API 定义也转移到了 AMD 独立的 wiki 和独立的讨论组中

像 `requireJS` 以及 `Dojo` 这样的 AMD loader 就这样发展了出来

符合 AMD 模块定义的代码大概是这样:

``` js
//Calling define with a dependency array and a factory function
define('moduleId', ['dep1', 'dep2'], function (dep1, dep2) {

    //Define the module value by returning a value.
    return function () {}
});

// Or:
define(function (require) {
    var dep1 = require('dep1'),
        dep2 = require('dep2')

    return function () {}
});
```

具体的 API 定义可以查看 [Github repo](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)

就 `requireJS` 本身来说，虽然他很好地支持了模块的加载，并且能很好地支持浏览器环境，开发过程所见即所得，利于调试

但是需要一些额外的繁琐的配置过程，尤其是对于不使用 AMD 模块规范的模块的加载，比如 `Backbone`

这要求开发者对 AMD loader 要比较熟悉

关于 `requireJS` 的用法不是本篇文章的重点，感兴趣的同学可以去官网仔细地阅读文档 [How to get started with RequireJS](http://requirejs.org/docs/start.html)

## UMD: Universal Module Definition
CommonJS 和 AMD 之间的争论，并不是一个孰好孰坏的绝对定性的问题
因为谁都没法更好地取代谁的位置，并且也很难达成一个统一的共识

因此一种兼容性的方案出现了，它就是 `UMD`，我认为严格意义上来说 `UMD` 只是一种兼容性的处理而已，它的实现是非常丑陋的…

``` js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
      define(['b'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('b'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.b);
  }
}(this, function (b) {
  //use b in some fashion.

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return {};
}));
```

UMD 模式还有很多种不同的变形，具体可以查看这个[Github 仓库](https://github.com/umdjs/umd/blob/master/README.md)

我们发现，UMD 所做的基本上就是用一个 IIFE 来包裹住我们的模块，然后在代码中做了针对不同模块规范的判断，来决定最终模块暴露的方式

当然这种模式也是非常普遍的，我们经常会利用 Webpack 这样的工具来输出 UMD 格式模块，使得模块不管在什么样的环境下都能够正常的运行

## ES Module

时隔多年之后，JavaScript 终于有了自己的模块系统，我之所以在小标题上引用 `ES Module` 是因为，JavaScript 的规范是 `ECMAScript`，而我们也习惯了使用 `ES5`, `ES6` 这样的字眼

> 注：ES Module 是一个新的规范，而不是 ES2015 里面所定义的 `Module` 文件类型

![](./ecma.jpg)

我们来看一下 ES Module 的语法：

```js
// lib.js

// Export the function
export function sayHello(){  
  console.log('Hello');
}

// Do not export the function
function somePrivateFunction(){  
  // ...
}
```

```js
// main.js

import { sayHello } from './lib';

sayHello();  
// => Hello
```

每一个 ES Module 对应一个 JS 文件，它没有特殊的 `module` 关键字，基本上它就像一个普通的脚本文件一样，只不过它和普通的脚本文件有一点区别:

* 即使你没有写入 `"use strict"`, ES6 模块也会自动启用严格模式
* 你可以使用 `export` 和 `import` 来暴露或引入模块

### 模块解析的问题

首先 `import` 和 `export` 是可选的，模块可以导出也可以不导出任何东西

其次，解析器没法在知道 `export` 是否存在的前提下去验证代码中是否有 `严格模式`所包含的语法错误

所以 JavaScript 文件类型判断的任务基本上没办法交给模块解析器去做，我们需要在文件解析之前就知道它的类型

#### 在浏览器中

``` html
<script type=“module” src=“module.js”></script>
```

当 scirpt 标签指定了 type 为 `module` 的时候，就意味着当前的脚本是一个 ES Module，然后会按照 ES Module 的规范来解析并加载模块中的内容

#### 在 Node 环境中

众所周知，在 Node 环境中所使用的模块都是遵守 CommonJS 规范的，ES Module 需要和 CommonJS 模块共存

为了使用特定的语法去引入特定的模块，Node 社区产生了以下这些方案:

* **解析器自动检测**，如之前所说，被否
* **使用 “use module” 标注** ，由于已经有了严格模式，这个东西接受度也很低，被否
* **使用 package.json** ，这个方案下提议很多，诸如添加 `module` 字段，缺点也很多，比如处理依赖关系，难以维护等等
* **使用 .mjs 文件类型**，比较简洁的解决方案，目前已经在推进（之前还有社区成员发起过 [defense-of-dot-js](https://github.com/dherman/defense-of-dot-js/issues) 提案）

目前 Node.js 已经初步实现了对 `.mjs` 后缀的支持，目前可以使用 `flag` 的方式来启用

值得注意的是，ES 规范要求模块的解析过程是静态的，所以我们没法像 `CommonJS` 模块那样使用条件式的动态引入

但是这样便可以对使用 ES Module 的代码进行更好的静态分析，语法检查，代码转换等等…

虽然说 ES Module 的语法设计是静态的，但是代码怎么加载，并不是属于规范的一部分，因此像 Webpack 就提供了动态导入模块的语法 `import()`

> This proposal adds an import(specifier) syntactic form, which acts in many ways like a function (but see below). It returns a promise for the module namespace object of the requested module, which is **created after fetching, instantiating, and evaluating all of the module's dependencies, as well as the module itself.**

目前 `import()` 语法已经进入 ECMAScript 提案，目前处于 [stage-3](https://github.com/tc39/proposal-dynamic-import)

### Best Practice

* 引入 ES Module 的时候加入文件后缀名，这样可以同时兼容浏览器和 Node.js
	* 浏览器并不关心文件扩展名，只关心 `MIME`类型 
* 使用标准的 ES Module 的模块标识符语法
	* 以 `/` 或者 `./` 开头

## 参考
> * https://www.jvandemo.com/a-10-minute-primer-to-javascript-modules-module-formats-module-loaders-and-module-bundlers/
> * https://github.com/umdjs/umd/blob/master/README.md
> * http://requirejs.org/docs/requirements.html
> * https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
> * http://wiki.commonjs.org/wiki/CommonJS
> * https://github.com/nodejs/node-v0.x-archive/issues/5132#issuecomment-15432598
> * https://medium.com/webpack/the-state-of-javascript-modules-4636d1774358
> * https://segmentfault.com/a/
> * https://zhuanlan.zhihu.com/p/25201979

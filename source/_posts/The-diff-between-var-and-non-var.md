---
title: 使用关键字 var 与不用的区别
date: 2017-10-18 16:42:38
tags: [JavaScript]
---

凡是经常写 JS 的 Coder 都知道这么一个道理，无论是在浏览器环境下还是在其他 JS 宿主环境下声明的变量都会自动变为全局对象的一个同名属性

> 在浏览器环境下是 window 对象，在 node 环境下是 global 对象

不同于其他语言，JS 在非严格模式下，不使用 **var** 关键字声明变量并进行赋值操作，并不会抛出异常，而是自动地为我们创建了一个`全局变量`。

``` javascript
num = 1
window.num === num // true
```

然而事实上，不使用 **var** 关键字并非创建了一个全局变量，而是对全局对象（也可以称作顶级对象）进行一次属性赋值操作。

首先，JS 引擎会试图在当前作用域内去寻找这个变量, 如果找不到这个变量则沿着作用域链一直向上寻找，最后到达作用域的顶端。如果依旧无法找到，便会在作用域顶端的对象，也就是全局对象上创建一个同名属性，并进行相应的赋值操作。

``` javascript
window.num = 1
```

那么，在全局环境下（之后的讨论范围都是在全局环境下）使用 **var** 关键字和不使用 var 关键字到底有什么区别呢？至少直观上并看不出有什么差别。但是在他们内部却有很大的区别。

虽然使用 **var** 关键字声明的变量会自动成为全局对象的属性，但它具有“不可配置”的特性。

简单的来说，它又是一个存在于全局环境的变量，又是全局对象的一个属性。作为一个变量，我们无法使用 delete 操作符来删除它。

delete 操作符只能用于普通的对象上的属性。因此它具有“不可配置”的数据特性，我们可以通过 Object.getOwnPropertyDescriptor 方法来验证：

``` javascript
var num = 10
Object.getOwnPropertyDescriptor(window, "num")
//  {
//   configurable: false,
//   enumerable: true,
//   writable: true,
//   value: 10
// }
```

这个方法返回一个对象，这个对象包含了该属性的属性描述符。我们可以看到,没有使用**var** 关键字声明的变量的 configurable 属性为 false，这意味着我们无法对该属性使用 delete 操作符

``` javascript
delete window.num // false
```

但是对于普通的全局对象上的属性，或者是不使用 **var** 关键字导致添加的属性，我们可以用 delete 操作符删除该属性，因为它只是一个普通的属性

``` javascript
a = 10
delete window.a // true
```

不过就算我们了解了这两种操作的细微区别，我们还是要避免不使用 **var** 关键字来创建变量的情况，这样代码的可读性会更强，也能预防将来发生一些意料之外的错误。

这里还要额外提一点，ES6 提供了新的关键字 `let` 和 `const` 来进行变量声明，这两者的具体差别和作用不会在这篇文章里讨论。

但是值得注意的是，在全局作用域下通过 `let` 和 `const` 关键字声明的变量，只会遮挡全局对象的属性，而不会覆盖：

``` javascript
var Array = 'array'
console.log(window.Array === Array) // true
 
let String = 'string'
console.log(window.String === String) // false
```
我们可以看到，如果使用 `var` 关键字不小心声明了和全局对象下的属性同名的变量，那么就覆盖了全局对象下的同名变量。

而 `let` 和 `const` 声明的变量只是会遮挡其同名属性，正真的属性仍然保持着正确的引用。
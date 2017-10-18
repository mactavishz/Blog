---
title: JS 对象的拷贝
date: 2017-10-16 17:11:06
tags: [JavaScript]
---

JS 对象的拷贝，有两种方式，一种是深拷贝(deep copy)，一种是浅拷贝(shallow copy)。其实我不是很喜欢这种说法，我更喜欢对象克隆(clone)和复制引用(reference copy)的说法。

## 复制引用

如其名曰，复制引用只是复制对这个对象的引用，例如：

``` js
var obj = {
  a:1
}
 
var newObj = obj
```

这个时候，obj 和 newObj 实质上都保存着对同一个对象的引用，有点像 C 当中的指针的概念，obj 和 newObj 保存着同一个对象的地址，因此任何对 newObj 的操作，都会反映在 obj 上：

``` js
newObj.a = 2
console.log(obj.a) // 2
```

不过对于包装类型：Number, String, Boolean 来说，上面这种做法是无效的，因为他们只会拷贝值，并不会拷贝对其的引用，试想，如果连这些原始类型都能拷贝引用了，那么代码就根本没法维护了，时时刻刻都有可能误操作到别的对象上了。

## 对象克隆

对象克隆本质上就是创建一个新的空对象，然后遍历源对象（要克隆的那个对象）的属性，然后把源对象的属性都一一复制到新的对象上，这样就完成了对源对象的克隆。

我们还需要检测源对象的属性，如果它的属性也是一个对象，我们就要利用递归来进行深层次的拷贝，如果是原始类型, 直接复制到新对象上即可。

同时，还要防止循环引用，也就是 a.b = a 的情况，这种情况会引起死循环，所以我们也要对其进行检测。

``` js
function clone(obj) {
  var name
  var copy = {}
 
  // 如果穿进来的参数不是一个对象或者函数
  if (typeof obj !== "object" && typeof obj !== "function") {
    return {}
  }
 
  // 如果对象的属性是数组
  if (obj instanceof Array) {
    return Array.prototype.slice.call(obj)
  }
 
  for (name in obj) {
    // 防止死循环
    if (obj[name] === obj) {
      continue
    }
    if (obj[name] && typeof obj[name] === "object") {
      copy[name] = clone(obj[name])
    } else if (obj[name]) {
      copy[name] = obj[name]
    }
  }
  return copy
}
```

这样我们就完成了比较基本的对象克隆：

``` js
var bar = {
  a: {
    inner: 123,
    inside: {
      test: "you can see me"
    }
  },
  b: [1, 2, 3],
  c: "string",
  d: function (a, b) {
    return a + b
  }
}
 
var foo = clone(bar)
console.log(foo)
```

输出：

``` js
{ a: { inner: 123, inside: { test: 'you can see me' } },
  b: [ 1, 2, 3 ],
  c: 'string',
  d: [Function: d] }
```

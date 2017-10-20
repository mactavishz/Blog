---
title:  JS 克隆数组的不同方法
date: 2017-10-19 23:28:42
tags: [JavaScript]
---

JavaScript 中的数组对象内置了许多强大的功能，但是却唯独没有克隆数组的单独方法。

数组其实也是对象，所以我们无法用赋值的方法来克隆一个数组。

``` javascript
var arr = [1, 2, 3]
var newArr = arr
newArr.push(4)
console.log(arr) // [1,2,3,4]
```

很明显，如果简单的使用赋值来克隆数组，其实是进行了引用的复制，因此任何操作都会反映到源对象上。

接下来，我将介绍不同的克隆数组的方法：

---

### 方法一

``` javascript
var arr = [1, 2, 3]
var newArr = arr.slice()
newArr.push(4)
console.log(arr) // [1,2,3]
console.log(newArr) // [1,2,3,4]
```

利用 Array.prototype.slice 来实现，不传参数或者参数为 `0` 的时候，就可以创建一个新的数组拷贝

---

### 方法二

``` javascript
var arr = [1, 2, 3]
var newArr = arr.concat()
newArr.push(4)
console.log(arr) // [1,2,3]
console.log(newArr) // [1,2,3,4]
```

利用 Array.prototype.concat 来实现，concat 方法会创建一个新的数组，然后合并传入的参数，不传参数的话就只返回和源数组一样的数组。

---

### 方法三


``` javascript
var arr = [1, 2, 3]
var newArr = Array.from(arr)
newArr.push(4)
console.log(arr) // [1,2,3]
console.log(newArr) // [1,2,3,4]
```

利用 Array.from 可以利用`可迭代的对象`或`类数组对象`创建一个新的数组实例，其内容相同，这是 ES2015 中新增的数组方法。

---

### 方法四

``` javascript
var arr = [1, 2, 3]
var newArr = [...arr]
newArr.push(4)
console.log(arr) // [1,2,3]
console.log(newArr) // [1,2,3,4]
```

利用对象展开符，来展开源数组，然后放在数组字面量中来创建一个新的数组。

---

### 总结

以上就是常用的 JavaScript 的克隆数组的方法，其实还可以有很多其他的方法，但是以上这几种是我认为比较方便的，并能够在日常编码中使用的。

至于具体使用哪种方法就仁者见仁智者见智了，我个人认为就语义性来说，我更倾向于 `...` 的操作方法。
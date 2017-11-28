---
title: ES2017 中的 Async function
date: 2017-11-28 23:27:44
tags: [Javascript]
---

<<<<<<< HEAD
## callback

=======
>>>>>>> 9852f8026763ef58998822e10f13fa685b2bb700
在没有 Promise 之前的时代，在 JS 中写 callback 简直是一种痛苦的煎熬

比如我们要下载一个文件，下载完成之后需要在成功的回调函数里去读写文件

抽象的代码如下：

``` js
function processData(url) {
  downloadFile({
    //... networking
    success: function(data) {
      readFile(data, function(err, file) {
        if(!err) {
          file.write(function(data) {
            //... write file
          })
        }
      })
    }
  })
}
```

这样的代码我们称作 `"callback hell"`，回调函数可以是无尽的深渊，那么维护起来会相当困难，简直不要太考验工程师的眼力

<<<<<<< HEAD
## Promise

=======
>>>>>>> 9852f8026763ef58998822e10f13fa685b2bb700
那么 ES2015 引入了 Promise 之后，回调函数的写法有了挺大的改善

我们可以利用 Promise 对上面的代码稍加改造:

``` js
function processData(url) {
  return new Promise((resolve, reject) => {
    downloadFile({
      success: resolve
    })
  })
}

processData.then(data => {
  return new Promsie((resolve, reject) => {
    readFile(data, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(file)
      }
    })
  })
}).then(file => {
  file.write(function(data) {
    //... write file
  })
}).catch(err => {
  console.error(err.message)
})
```

这样我们使得代码的可读性变得更强了，也更好维护了，但是依然避免不了要在 Promise 中写回调函数的问题

<<<<<<< HEAD
## async/await

这时候 ES2017 又推出了更好的解决方案，那就是 `Async Function`

利用 `async function` 可以定义一个异步的函数，返回一个 `AsyncFunction Object`

``` js
async function fn(){}
Object.prototype.toString.call(fn) // "[object AsyncFunction]"
```

当 `async function` 被调用的时候，它会返回一个 Promise，这个 Promise 会根据函数体内的返回值来 resolve，或者是根据函数体内抛出的异常来 reject

``` js
let result = fn()
console.log(r) // Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: undefined}
```

当函数体为空时，return 值自然是 undefined 所以最终 `fn` 返回给我们的是一个以 `undefined` 来 resolve 的 Promise

如果函数体内有 `await` 表达式的时候，那么 `async function` 会停止执行并等待 await 的表达式的执行结果以确定最终 Promise 用来 resolve 的值

MDN 上的注解是这么说的：

> The purpose of async/await functions is to simplify the behavior of using promises synchronously and to perform some behavior on a group of Promises. Just as Promises are similar to structured callbacks, async/await is similar to combining generators and promises.

重点在于 `async/await` 简化了我们同步地使用 Promise 来产生基于一组 Promise 的行为，这句话有点难理解，我们来看看代码：

``` js
function resolveAfter2s(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x)
    }, 2000)
  })
}

async function add(x) {
  const a = await resolveAfter2s(20)
  const b = await resolveAfter2s(30)
  return x + a + b
}

add(10).then(v => {
  console.log(v)  // prints 60 after 4 seconds.
})
```

这样就很容易看懂了，我们的 `add` 函数看起来是同步的，但是其实是利用了 promise 而实现了异步

## 总结

那么有了 `async/await` 之后，我们可以更好地分隔我们的代码，使得代码耦合度更低，逻辑更清晰
=======
这时候 ES2017 又推出了更好的解决方案，那就是 `Async Function`
>>>>>>> 9852f8026763ef58998822e10f13fa685b2bb700

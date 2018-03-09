---
title: 深入了解 JS 中的装饰器 (Decorator)
date: 2018-03-08 22:57:05
tags: [Javascript]
---

## 概述

今天我想谈一谈 ECMAScript 的下一代 "python" 化的提案 ———— Decorator

这个提案最先由 `Yehuda Katz` 提出，目前该提案在 TC39 处于 `Stage 2`，详情可以在 TC39 的 [Github Repo](https://github.com/tc39/proposals) 中找到

为什么要说 "python" 化呢，因为在 python 中就有 Decorator 的概念

额外说一点，JavaScript 在不断发展的过程中也是借鉴了很多其他编程语言的概念才慢慢走到了今天

## 什么是 Decorator

顾名思义，装饰器(Decorator) 是用于修饰的

ES5 的对象可以给其属性设置任意的值，但 ES6 的 class 则支持函数字面量作为值

> 注意：前提在是完全标准的 ES6 的环境下，不包含利用 babel 等工具实现的一些新的特性

``` js
class MyClass {
  // 这样是不行的，编译器会报错
  num: 123
  // 这样是 ok 的
  fun() {}
}
```

换句话说，我们只能使用命令式的方式来给 class 添加属性，不能使用声明式的方式来给 class 添加属性

``` js
let m = new MyClass()
m.prop = 'my prop'

// 或者
class MyClass {
  constructor() {
    this.prop = 'my prop'
  }
  // ... other code
}
```

Decorator 就为我们保留了使用声明式的语法来设计代码的能力，而在此之前，我们只能用一些高阶函数来修饰

有时候我们需要在多个 class 之间共享相同的功能，因此我们需要更加优雅的实现方法

所以让我们来进一步了解一下 Decorator 的神奇之处

## 基本用法

一个 Decorator 有以下这些特点：

* 它是一个表达式
* 它等价于一个函数
* 它会获取 `target(要修饰的对象), name(属性名), descriptor(对象属性描述符)` 作为参数
* 它会选择性地返回一个装饰器描述符来应用到 `target` 参数对应的对象上

### 装饰对象属性

假设我们这里有个基础的 Dog class:

``` js
class Dog {
  bark() {
    console.log(`barks!`)
  }
}
```

这样的写法等价于:

``` js
Object.defineProperty(Dog.prototype, 'bark', {
  value: bark,
  enumerable: false,
  configurable: true,
  writable: true
})
```

假设我们希望某个属性是只读的，我们可以实现一个 `readonly` 的装饰器:

``` js
function readonly(target, name, descriptor) {
  descriptor.writable = false
  return descriptor
}
```

然后我们添加到 `bark` 属性上：

``` js
class Dog {
  @readonly
  bark() {
    console.log(`barks!`)
  }
}
```

装饰器会先于定义属性的语法，在装饰器返回的 `descriptor` 真正应用到 `Dog.prototype` 上之前，JS 引擎会先调用装饰器函数:

``` js
let descriptor = {
  // 某个特定的函数
  value: specifiedFunction,
  enumerable: false,
  configurable: true,
  writable: true
}

descriptor = readonly(Dog.prototype, 'bark', descriptor) || descriptor
Object.defineProperty(Dog.prototype, 'bar', descriptor)

```

我们可以来验证一下，看看 `bark` 属性是不是已经变成只读的了:

``` js
let buffee = new Dog()
buffee.bark = function() { console.log('new assigned func') }
buffee.bark() // barks!
```

虽然装饰器还没有成为正式的规范，但是已经出现了不少的装饰器的库，比如[core-decorators](https://github.com/jayphelps/core-decorators)

这个库提供了许多实用的装饰器，就像我们之前实现的 readonly 一样:

``` js
import { readonly } from 'core-decorators'
class SomeClass {
  @readonly
  someprop() {}
}
```

同时，还有类似于 `@deprecate` 这样的工具类装饰器，用于提醒那些即将过时的 API
``` js
import { deprecate } from 'core-decorators'

class SomeClass {
  @deprecate('stop using this api, will be remove in the near futrue')
  oldAPI {}
}
```

## 装饰 class

说完了装饰属性，我们来看看如果装饰 class

如果使用装饰器来修饰 class，装饰器函数接受 class 的构造函数作为参数

``` js
// A simple decorator
@annotation
class MyClass { }

function annotation(target) {
   // Add a property on target
   target.annotated = true;
}
```

鉴于装饰器也是表达式，装饰器也可以接受额外的参数，就像工厂函数一样:

``` js
@isTestable(true)
class MyClass { }

// 使用一个函数来包装一下装饰器即可
function isTestable(value) {
   return function decorator(target) {
      target.isTestable = value;
   }
}
```

## 装饰器和 Mixins (混合)

正如之前所说，利用装饰器，我们可以在不同的类之间分享相同的功能和属性

在 ES5 中，我们可能经常会使用函数来实现 Mixin

这里介绍一个简单的函数式 Mixin

``` js
const FunctionalMixin = (behaviour) => target => Object.assign(target, behaviour)

class myClass {
}

const mixProps = FunctionalMixin({
  sayHi() {
    console.log('hi')
  }
})

mixProps(myClass.prototype)

let myclz = new myClass()

myclz.sayHi() // 'hi'
```

但是使用 Object.assign 来实现 mixins 将使得混入的方法变成可枚举的(enumerable)

这就和 class 默认的情况不一样，同时我们也希望能够使得同一类 mixin 可以分享一些相同的行为或属性

于是可以将上面的 Mixin 完善一下:

``` js
function mixin (behaviour, sharedBehaviour = {}) {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  for (let property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
```

我们先不使用装饰器来尝试使用最基本的函数式混合来看看效果:

``` js
const extraAbility = mixin({
  addFriend(name, age) {
    this.getFriends().push(new this.constructor(name, age))
  },
  getFriends() {
    return this.friends || (this.friends = [])
  }
}, {
  DEFAULT_NAME: 'PERSON',
  DEFAULT_AGE: '20'
})

class Person {
  constructor(name, age) {
    this.name = name
    this.age =age
  }
  sayName() {
    console.log(`This Person's name is: ${this.name}, defualt name is ${extraAbility.DEFAULT_NAME}`)
  }
}

extraAbility(Person)

const p = new Person('jack', 18)
p.addFriend('mary', 20)
console.log(p.getFriends()) // Person{name: 'mary', age: 20}
console.log(extraAbility.DEFAULT_NAME) // 'PERSON'
```

使用装饰器我们就可以很方便地来混合这些属性: 

``` js
const extraAbility = mixin({
  addFriend(name, age) {
    this.getFriends().push(new this.constructor(name, age))
  },
  getFriends() {
    return this.friends || (this.friends = [])
  }
}, {
  DEFAULT_NAME: 'PERSON',
  DEFAULT_AGE: '20'
})

@extraAbility
class Person {
  constructor(name, age) {
    this.name = name
    this.age =age
  }
  sayName() {
    console.log(`This Person's name is: ${this.name}, defualt name is ${extraAbility.DEFAULT_NAME}`)
  }
}
```

这些类装饰器是相对紧凑的，我们可以把他们用作帮助函数或者是高阶组件

经过之前的阐述，我们了解到，装饰器不过是高阶函数的语法糖而已，我们现在就来用几个实际的例子来看一下：

``` js
@F("color")
@G
class Foo {
}

function F(arg) {
	console.log('F: ' + arg)
	return target => target
}

function G(target) {
	console.log('G')
	return target
}
```

等价于

``` js
var Foo = (function () {
  class Foo {
  }

  Foo = F("color")(Foo = G(Foo) || Foo) || Foo;
  return Foo;
})();
```

因此我们可以看到类装饰器的执行情况，F 先执行，然后是 G

接着我们再来分析一下类方法的装饰器:

``` js
class Foo {
  @F("color")
  @G
  bar() { }
}

function F(arg) {
	console.log('F: ' + arg)
	return (target, name, descriptor) => descriptor
}

function G(target, name, descriptor) {
	console.log('G')
	return descriptor
}
```

等价于

``` js
var Foo = (function () {
  class Foo {
    bar() { }
  }

  var _temp;
  _temp = F("color")(Foo.prototype, "bar",
    _temp = G(Foo.prototype, "bar",
      _temp = Object.getOwnPropertyDescriptor(Foo.prototype, "bar")) || _temp) || _temp;
  if (_temp) Object.defineProperty(Foo.prototype, "bar", _temp);
  return Foo;
})();
```

## 总结

关于 Decorator 基本上要说的就这么多

目前在很多前端类库里已经充分地利用了 Decrorator 的概念，比如 Angular 的 `@Component`

利用 Decorator 我们可以在不破坏原有对象属性及方法的前提下，为他们赋予更多额外的功能


## 参考
> * https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841
> * https://github.com/wycats/javascript-decorators
> * http://raganwald.com/2015/06/26/decorators-in-es7.html
> * http://raganwald.com/2015/06/17/functional-mixins.html
> * https://github.com/jayphelps/core-decorators


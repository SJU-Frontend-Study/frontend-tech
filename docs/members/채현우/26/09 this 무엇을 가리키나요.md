# this 무엇을 가리키나요?

총 투표 수: 0
생성자: 현우 채
카테고리: JS
주차: 9주차
일정: 세션 발표 (https://www.notion.so/2dbf13fa572b80bba771d292633fdebc?pvs=21)

## 1. Quiz

**Q: 아래 코드를 실행하면 콘솔에 무엇이 찍힐까요?**

```jsx
const user = {
  name: 'Gemini',
  sayHi() {
    console.log(`Hi, I am ${this.name}`);
  }
};

const myHi = user.sayHi;
myHi(); // ???
```

- **정답: ???**
    - `Hi, I am undefined` (또는 에러)
    - **이유:** 함수를 `user.sayHi`로 꺼내서 `myHi()`로 호출하는 순간, `user`와의 연결고리가 끊기기 때문입니다.
    - **오늘의 핵심:** `this`는 **함수가 어디서 정의되었느냐**가 아니라, **어떻게 호출되었느냐**에 따라 결정됩니다.

---

## 2. `this`를 결정하는 2가지 규칙

### 규칙 1. this는 함수 스코프 내에서 동작합니다

- **Q: 일반 함수를 그냥 호출하면 `this`는 무엇일까요?**

```jsx
function hello() {
  console.log(this);
}
hello(); // ???
```

- **해설:** 기본적으로는 `window` (브라우저) 또는 `global` (Node.js) 객체를 가리킵니다.
- **단, 엄격 모드(`'use strict'`)에서는 `undefined`가 출력됩니다.** (실수 방지!)

---

### 규칙 2. ***호출할 때가 중요합니다***

```jsx
const room = {
  water: 'Jeju Air',
  drink() {
    console.log(this.water);
  }
};

const drink = room.drink;
room.drink(); // Jeju Air
drink() // window.water
```

<aside>
⚠️

호출하는 함수가 객체의 메서드인지 그냥 함수인지가 중요합니다

- 함수 호출 방식에 따라서 this의 값이 달라집니다!!
</aside>

---

## 3. 확인 Quiz! 이젠 맞출 수 있겠죠?

```jsx
var value = 1;
var obj = {
  value: 100,
  foo: function() {
    console.log("foo's this: ",  this);
    console.log("foo's this.value: ",  this.value);
    func*tion bar() {*
      console.log("bar's this: ",  this);
      console.log("bar's this.value: ", this.value);
    }
    bar();
  }
};
obj.foo();
```

<aside>
💡

생각보다 java랑 다르게 객체지향하기가 너무 까다롭습니다. this를 제어할 수 있는 방법은 없을까요?

</aside>

## 4. this를 제어하는 법

### 4-1. 명시적 바인딩 (Explicit Binding)

- **Q: 만약 `room` 객체에 없는 함수를 가져와서 쓰고 싶다면?**

```jsx
function clean() {
  console.log(`${this.name}을(를) 청소합니다.`);
}
const office = { name: '사무실' };

// clean 함수를 office의 것처럼 쓰고 싶다면 어떻게 해야 할까요?

```

but, jquery 에서는…

```jsx
$('div').on('click', function() {
  console.log(this); // <div/>
});
```

callback이 이 객체를 가리킵니다.

this 를 임의로 설정할 수 있는 방법. = 명시적 바인딩 (call, apply, bind)

| 메서드 | 반환값 |
| --- | --- |
| Function.prototype.call(thisArg[, arg1[, arg2[, ...]]]) | 함수의 반환 값 |
| Function.prototype.apply(thisArg[, argsArray]) | 함수의 반환 값 |
| Function.prototype.bind(thisArg[, arg1[, arg2[, ...]]]) | 함수 |
- 기본은 함수를 실행하는 것
- apply 는 인자를 배열 형태로 (spread 연산자)

```jsx
let userData = {
    signUp: '2020-10-06 15:00:00',
    id: 'minidoo',
    name: 'Not Set',
    setName: function(firstName, lastName) {
        this.name = firstName + ' ' + lastName;
    }
}

function getUserName(firstName, lastName, callback) {
    callback(firstName, lastName);
}

getUserName('PARK', 'MINIDDO', userData.setName);

console.log('1: ', userData.name); // Not Set
console.log('2: ', window.name); // PARK MINIDDO
```

```jsx
function getUserName(firstName, lastName, callback) {
    callback.call(userData, firstName, lastName);
}
```

---

### 4-2. new 바인딩 (New Binding)

- **해설:** `new`를 쓰는 순간 빈 객체가 생성되고, 그 객체가 `this`에 바인딩됩니다. 결과적으로 `myCar`라는 새로운 인스턴스가 생성됩니다.

```jsx
function Car(name) {
	this.name = name;
}

const tesla = new Car('Tesla');
console.log(tesla.name); // ???

const hyundai = Car('Hyundai');
console.log(hyundai.name) // ???
```

### 4-3. that 을 활용하자 (지역변수 활용법)

```jsx
var value = 1;
var obj = {
  value: 100,
  foo: function() {
	  const that = this;
	  
    console.log("foo's this: ",  this);
    console.log("foo's this.value: ",  this.value);
    
    function bar() {
      console.log("bar's that: ",  that);
      console.log("bar's that.value: ", that.value);
    }
    bar();
  }
};
obj.foo();
```

- 지역변수 that → 객체 저장 → this 바인딩 오류를 줄일 수 있음.

### 4-4. 화살표 함수 (Arrow Function)

```jsx
const timer = {
  seconds: 0,
  start() {
    setTimeout(function() {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
};
timer.start(); // 1초 뒤 결과는?
```

- **정답:**
    
    NaN (undefined + 1, undefined 를 숫자로 변환함)
    

화살표 함수를 이용해보자!

```jsx
const timer = {
  seconds: 0,
  start() {
    setTimeout(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
};
timer.start(); // 1초 뒤 결과는?
```

- 화살표 함수는 자신만의 `this`가 없습니다.
- **선언된 위치의 상위 스코프 `this`** 를 그대로 가져다 씁니다. (여기서는 `timer` 객체)

 

---

## 3. 심화: 우선순위 대결

- **Q: 만약 규칙들이 겹치면 누가 이길까요? (**`new` 바인딩 vs 명시적 바인딩(`bind`))
- **정답 및 순위:**
    1. **`new` 바인딩** (가장 강력)
    2. **명시적 바인딩** (`call`, `apply`, `bind`)
    3. **암시적 바인딩** (메서드 호출)
    4. **기본 바인딩** (나머지)

---

## 5. 결론 및 요약

- **this 판별 체크리스트:**
    1. `new`가 있는가?
    2. `call/apply/bind`가 있는가?
    3. 호출하는 객체(`.`)가 있는가?
    4. 화살표 함수인가? (상위 스코프 확인)
    5. 위가 다 아니라면 `window`/`undefined` (strict mode).

## 참고자료

https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-this-%EC%B4%9D%EC%A0%95%EB%A6%AC
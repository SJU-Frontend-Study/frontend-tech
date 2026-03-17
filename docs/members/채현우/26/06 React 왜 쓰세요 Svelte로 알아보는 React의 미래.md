# React 왜 쓰세요? :Svelte로 알아보는 React의 미래

총 투표 수: 0
생성자: 현우 채
카테고리: Tech
주차: 6주차

## 프론트엔드 트랜드는 어떻게 변화하고 있을까?

- CSR 등장 배경
- CSR 최적화
- SSR 으로 다시 회귀
- 앞으로는..?

---

# 1. AngularJS 의 시대

IE 와 웹 기술이 발전하던 시기

웹 표준 → 점차 만들어가기 시작함.

JS 조작에 대한 니즈

스파게티 코드

### **Ajax (1999~2005)**

- 1999년 3월에 이미 정립 / 2005년도 [Jesse James Garrett](https://web.archive.org/web/20150910072359/http://adaptivepath.org/ideas/ajax-new-approach-web-applications/) 가 소개
- 데이터만 별도 요청 가능

### **jQuery (2006)**

- DOM 직접 조작 (클라이언트 조작)
- 명령형 → 코드 복잡성 증가 / 유지보수 어려움

### **AngularJS (2009)**

- Backbone, Knockout 등 ***MV* 패턴*** 기반 프레임워크 등장
- 양방향 데이터 바인딩 → DOM Observe → 데이터에 따른 View 변화 (MMVM) `편해요😀`
- 선언형 기반 ->코드 양이 엄청 줄어듦
- 클린코드 지향 → 구조 강제
- 개발, 빌드, 테스트 등 통합 프레임워크
- **Dirty Checking:** $scope 에 있는 데이터 모두 확인 → DOM 반영 → 대규모 `느리다!🤬`
- **Increasemental-DOM:** DOM 직접 조작/직접 접근
- 양방향 바인딩 → 대규모 프로젝트에서 **데이터 흐름 파악 어려움**

---

# 2. Client Side Rendering (2013)

## 1. React 시대의 시작

Angular2 대규모 업데이트 (2016) → Angular2 로 마이그레이션 해야하네, 차라리 React 해볼까?

- Virtual DOM 사용 → DOM에 직접 접근하지 않아서 **빠릅니다!**
- 단방향 데이터 바인딩 → 상태 변경 예측 가능!

| **구분** | **Angular (프레임워크)** | **React (라이브러리)** |
| --- | --- | --- |
| **데이터 흐름** | 양방향: 데이터의 출처 추적 어려움 | **단방향**: 데이터 흐름 예측 가능 (안정성) |
| **역할** | 전체 솔루션 강제 (Opinionated) | **View만 집중**: 유연성 극대화 |
| **라우팅** | 라우팅 기능 내장 | react-router-dom 사용 |

## 2. V-DOM vs I-DOM

### Virtual DOM (V-DOM)

![image.png](image.png)

- Runtime 에 변경사항을 확인하여 Virtual DOM에서 비교 후 렌더링
- 변경사항을 한 번에 적용한다.

### **Incremental DOM (I-DOM)**

![image.png](image%201.png)

- 변경 발생 시, 실제 DOM을 모두 순회하며, 메모리 DOM과 비교, 즉시 변경
- 변경사항을 그때 그때 반영한다

### V-DOM vs I-DOM

- 일반적으로 V-DOM 이 빠름
- but, I-DOM 이 메모리 측면에서 최적화

## 3. 아니, DOM을 왜 확인하고 있어? feat.Svelte (2016)

- Component 를 만들면, 변경 될 부분을 이미 알고 있음.
- 변경될 부분에 대한 DOM 조작 코드를 생성하자!

```jsx
<script>
	let name = $state('world');
	let count = $state(0);
</script>

<h1>Hello {name}!</h1>

<input bind:value={name} />
<button onclick={() => count += 1}>
	clicks: {count}
</button>
```

```jsx
import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <input/> <button> </button>`, 1);

export default function App($$anchor) {
	let name = $.state('world');
	let count = $.state(0);
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.child(h1);

	$.reset(h1);

	var input = $.sibling(h1, 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	button.__click = () => $.set(count, $.get(count) + 1);

	var text_1 = $.child(button);

	$.reset(button);

	$.template_effect(() => {
		$.set_text(text, `Hello ${$.get(name) ?? ''}!`);
		$.set_text(text_1, `clicks: ${$.get(count) ?? ''}`);
	});

	$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
```

Build 타임에 변경되는 DOM을 알고 있고, 이벤트 처리시에 바로 해당 DOM에 반영, `빠르다!`

## 4. React Compiler 의 등장

- React 에서는 트리의 모든 부분을 확인하지 않기 위해서, memo 라는 기능을 제공
- 하지만, 성능적으로 사용자가 판단하기 어려운 것으로 판단
- compiler 가 memo를 사용할 부분을 판별

## 5. 앞으로의 방향성

| **공통점** | **Svelte의 방식** | **React의 대응** |
| --- | --- | --- |
| **번들 크기/성능 최적화** | **No V-DOM:** 런타임 오버헤드를 제거해 **번들 크기를 최소화**합니다. | **React Server Components (RSC):** 클라이언트 측 JavaScript 번들을 줄여 **초기 로딩 및 Hydration 비용**을 최소화합니다. |
| **자동 메모이제이션** | **컴파일러**가 상태 변화를 추적하여 **자동**으로 DOM 업데이트를 최적화합니다. | **React Compiler (Forget):** 개발자가 수동으로 `useMemo`, `useCallback`을 쓰는 대신, 컴파일러가 **자동으로 불필요한 리렌더링을 방지**합니다. |
| **코드의 간결성** | `<script>`, `<style>`, `<template>` 분리로 컴포넌트 구조가 직관적입니다. | **Hooks**를 통해 Class 컴포넌트의 복잡성을 제거하고 **함수 컴포넌트** 중심으로 간결함을 추구합니다. |

- Runtime / Compile Time 최적화
- 

---

## **Q&A**

## 참고자료

https://ssocoit.tistory.com/266

https://blog.nrwl.io/understanding-angular-ivy-incremental-dom-and-virtual-dom-243be844bf36
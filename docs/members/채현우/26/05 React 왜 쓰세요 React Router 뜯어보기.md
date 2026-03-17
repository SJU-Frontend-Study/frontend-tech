# React 왜 쓰세요? : React Router 뜯어보기

총 투표 수: 0
생성자: 현우 채
카테고리: Tech
주차: 5주차

## React 왜 쓰나요?

- 프론트 필수 스택이기 때문에 (🫢)
- Stackoverflow 에 내용이 많아요 (😀)
- Virtual Dom 성능이 좋아서 (🤔)
- CSR (Client Side Rendering) 기반 코드를 쉽게 만들어 줌.
- SPA (Single Page Application) 을 쉽게 만들기 위해서
- 편해서 😅
- 상태관리 용이 → 클로저 몰라도 됨
- 훅이 많아요 / 라이브러리 많음

## SPA와 라우팅의 필요성

- 전통적인 MPA(Multi Page Application)
    - 페이지 이동 시 → 전체 페이지 로드, 깜빡깜빡
    - 🤔 페이지 일부만 바꿀 수 없을까?
    - 🤔 화면 깜빡임 해결 못할까?
- ***화면의 일부분만 바꾸자!*** → CSR

## 근데, URL 어떻게 바꿔요..? 🤔

- 라우팅 해주는 함수 만들어서 쓸까? → SEO는요?
- 그럼 a 태그를… → 새로고침 됨

*아하! a 태그를 비활성화하고, 나머지 로직을 구현하자!*

## React-Router

- History API (주소 변경)
- popstate (주소 변경 감지)
- routes (매칭/렌더링)

[History API - Web API | MDN](https://developer.mozilla.org/ko/docs/Web/API/History_API)

## 자, 이제 뜯어볼까요? (React-Router v6)

### Link 태그

```jsx
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkWithRef(
    {
      onClick,
      relative,
      reloadDocument,
      replace,
      state,
      target,
      to,
      preventScrollReset,
      viewTransition,
      ...rest
    },
    ref
  ) {
    let { basename } = React.useContext(NavigationContext);

    // Rendered into <a href> for absolute URLs
    let absoluteHref;
    let isExternal = false;

    if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
      // Render the absolute href server- and client-side
      absoluteHref = to;

      // Only check for external origins client-side
      if (isBrowser) {
        try {
          let currentUrl = new URL(window.location.href);
          let targetUrl = to.startsWith("//")
            ? new URL(currentUrl.protocol + to)
            : new URL(to);
          let path = stripBasename(targetUrl.pathname, basename);

          if (targetUrl.origin === currentUrl.origin && path != null) {
            // Strip the protocol/origin/basename for same-origin absolute URLs
            to = path + targetUrl.search + targetUrl.hash;
          } else {
            isExternal = true;
          }
        } catch (e) {
          // We can't do external URL detection without a valid URL
          warning(
            false,
            `<Link to="${to}"> contains an invalid URL which will probably break ` +
              `when clicked - please update to a valid URL path.`
          );
        }
      }
    }

    // Rendered into <a href> for relative URLs
    let href = useHref(to, { relative });

    let internalOnClick = useLinkClickHandler(to, {
      replace,
      state,
      target,
      preventScrollReset,
      relative,
      viewTransition,
    });
    function handleClick(
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a
        {...rest}
        href={absoluteHref || href}
        onClick={isExternal || reloadDocument ? onClick : handleClick}
        ref={ref}
        target={target}
      />
    );
  }
);
```

먼저, 마지막을 보면, ***a 태그 반환*** 하는걸 알 수 있습니다.

핵심은 onClick → `isExternal || reloadDocument` 일 때 새로고침 / 아니면 CSR

- reloadDocument 라는 예외 케이스에 대한 처리도 있다는 사실

`handleClick` → `internalOnClick` → `useLinkClickHandler` 함 봅시다.

### useLinkClickHandler

```jsx
/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 */
export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition,
  }: {
    target?: React.HTMLAttributeAnchorTarget;
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
    viewTransition?: boolean;
  } = {}
): (event: React.MouseEvent<E, MouseEvent>) => void {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });

  return React.useCallback(
    (event: React.MouseEvent<E, MouseEvent>) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();

        // If the URL hasn't changed, a regular <a> will do a replace instead of
        // a push, so do the same here unless the replace prop is explicitly set
        let replace =
          replaceProp !== undefined
            ? replaceProp
            : createPath(location) === createPath(path);

        navigate(to, {
          replace,
          state,
          preventScrollReset,
          relative,
          viewTransition,
        });
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
      viewTransition,
    ]
  );
}
```

익숙한게 보이기 시작하네요! `useNavigate()` , `event.preventDefault();` 도 찾아볼 수 있습니다!!

`Link` 태그 (a태그)를 `onClick` 했을 때 → `event.preventDefault()` 로 새로고침을 방지하고 있습니다.

이제 useNavigate 를 뜯어볼까요?

### useNavigate

래핑이 되어있는 함수라 크게 볼 부분이 많이 없습니다. (라우팅에 대한 부분)

```jsx
// 참고: data route = createBrowserRouter(정적 라우팅 데이터)
export function useNavigate(): NavigateFunction {
  let { isDataRoute } = React.useContext(RouteContext);
  // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}

function useNavigateUnstable(): NavigateFunction {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`,
  );

  let dataRouterContext = React.useContext(DataRouterContext);
  let { basename, navigator } = React.useContext(NavigationContext);
  let { matches } = React.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();

  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));

  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });

  let navigate: NavigateFunction = React.useCallback(
    (to: To | number, options: NavigateOptions = {}) => {
      warning(activeRef.current, navigateEffectWarning);

      // Short circuit here since if this happens on first render the navigate
      // is useless because we haven't wired up our history listener yet
      if (!activeRef.current) return;

      if (typeof to === "number") {
        navigator.go(to);
        return;
      }

      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path",
      );

      // If we're operating within a basename, prepend it to the pathname prior
      // to handing off to history (but only if we're not in a data router,
      // otherwise it'll prepend the basename inside of the router).
      // If this is a root navigation, then we navigate to the raw basename
      // which allows the basename to have full control over the presence of a
      // trailing slash on root links
      if (dataRouterContext == null && basename !== "/") {
        path.pathname =
          path.pathname === "/"
            ? basename
            : joinPaths([basename, path.pathname]);
      }

      (!!options.replace ? navigator.replace : navigator.push)(
        path,
        options.state,
        options,
      );
    },
    [
      basename,
      navigator,
      routePathnamesJson,
      locationPathname,
      dataRouterContext,
    ],
  );

  return navigate;
}

function useNavigateStable(): NavigateFunction {
  let { router } = useDataRouterContext(DataRouterHook.UseNavigateStable);
  let id = useCurrentRouteId(DataRouterStateHook.UseNavigateStable);

  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });

  let navigate: NavigateFunction = React.useCallback(
    async (to: To | number, options: NavigateOptions = {}) => {
      warning(activeRef.current, navigateEffectWarning);

      // Short circuit here since if this happens on first render the navigate
      // is useless because we haven't wired up our router subscriber yet
      if (!activeRef.current) return;

      if (typeof to === "number") {
        router.navigate(to);
      } else {
        await router.navigate(to, { fromRouteId: id, ...options });
      }
    },
    [router, id],
  );

  return navigate;
}
```

```jsx
export interface Navigator {
  createHref: History["createHref"];
  // Optional for backwards-compat with Router/HistoryRouter usage (edge case)
  encodeLocation?: History["encodeLocation"];
  go: History["go"];
  push(to: To, state?: any, opts?: NavigateOptions): void;
  replace(to: To, state?: any, opts?: NavigateOptions): void;
}

interface NavigationContextObject {
  basename: string;
  navigator: Navigator;
  static: boolean;
  // TODO: Re-introduce a singular `FutureConfig` once we land our first
  // future.unstable_ or future.v8_ flag
  future: {};
}

export const NavigationContext = React.createContext<NavigationContextObject>(
  null!,
);
NavigationContext.displayName = "Navigation";
```

### 나머지 연결이 너무 복잡합니다

history를 반환하는 함수의 일부입니다. ()

```jsx
// createBrowserRouter -> history: getUrlBasedHistory
function getUrlBasedHistory(
  getLocation: (window: Window, globalHistory: Window["history"]) => Location,
  createHref: (window: Window, to: To) => string,
  validateLocation: ((location: Location, to: To) => void) | null,
  options: UrlHistoryOptions = {},
): UrlHistory {

let globalHistory = window.history;
// ...

function push(to: To, state?: any) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);

    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);

    // try...catch because iOS limits us to 100 pushState calls :/
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      // If the exception is because `state` can't be serialized, let that throw
      // outwards just like a replace call would so the dev knows the cause
      // https://html.spec.whatwg.org/multipage/nav-history-apis.html#shared-history-push/replace-state-steps
      // https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeinternal
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      // They are going to lose state here, but there is no real
      // way to warn them about it since the page will refresh...
      window.location.assign(url);
    }

    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }
  }

  function replace(to: To, state?: any) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);

    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);

    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }

  function createURL(to: To): URL {
    return createBrowserURLImpl(to);
  }

  let history: History = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window, globalHistory);
    },
    listen(fn: Listener) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window.addEventListener(PopStateEventType, handlePop);
      listener = fn;

      return () => {
        window.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window, to);
    },
    createURL,
    encodeLocation(to) {
      // Encode a Location the same way window.location would
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
    },
    push,
    replace,
    go(n) {
      return globalHistory.go(n);
    },
  };
```

### Routes

Route 에 맞는 component를 렌더링합니다

```jsx
// Routes 컴포넌트 -> useRoute -> useRouteImp
export function useRoutesImpl(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string,
  dataRouterState?: DataRouter["state"],
  unstable_onError?: unstable_ClientOnErrorFunction,
  future?: DataRouter["future"],
): React.ReactElement | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`,
  );

  let { navigator } = React.useContext(NavigationContext);
  let { matches: parentMatches } = React.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route; 

  let location = useLocation();
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;

  let matches = matchRoutes(routes, { pathname: remainingPathname });

  let renderedMatches = _renderMatches(
    matches &&
      matches.map((match) =>
        Object.assign({}, match, {
          params: Object.assign({}, parentParams, match.params),
          pathname: joinPaths([
            parentPathnameBase,
            // Re-encode pathnames that were decoded inside matchRoutes.
            // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
            // `new URL()` internally and we need to prevent it from treating
            // them as separators
            navigator.encodeLocation
              ? navigator.encodeLocation(
                  match.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23"),
                ).pathname
              : match.pathname,
          ]),
          pathnameBase:
            match.pathnameBase === "/"
              ? parentPathnameBase
              : joinPaths([
                  parentPathnameBase,
                  // Re-encode pathnames that were decoded inside matchRoutes
                  // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
                  // `new URL()` internally and we need to prevent it from treating
                  // them as separators
                  navigator.encodeLocation
                    ? navigator.encodeLocation(
                        match.pathnameBase
                          .replace(/\?/g, "%3F")
                          .replace(/#/g, "%23"),
                      ).pathname
                    : match.pathnameBase,
                ]),
        }),
      ),
    parentMatches,
    dataRouterState,
    unstable_onError,
    future,
  );

  // When a user passes in a `locationArg`, the associated routes need to
  // be wrapped in a new `LocationContext.Provider` in order for `useLocation`
  // to use the scoped location instead of the global location.
  if (locationArg && renderedMatches) {
    return (
      <LocationContext.Provider
        value={{
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location,
          },
          navigationType: NavigationType.Pop,
        }}
      >
        {renderedMatches}
      </LocationContext.Provider>
    );
  }

  return renderedMatches;
}
```

라우트에 따라 렌더링이 달라지므로, 뒤로가기 시 정보 유지가 안됨.

## React가 필수인가?

[GitHub - hotwired/turbo: The speed of a single-page web application without having to write any JavaScript](https://github.com/hotwired/turbo)

Html → SPA / CSR 만들어주는 라이브러리

HTML 파싱 → JS 캐싱 →  Body 바꾸기

→ SSR 환경에서 SSR + CSR 가능

## 의문

- React 는 왜 라우팅 기능을 내장하지 않았을까요?
- React 와 다른 라이브러리/프레임워크와의 강점이 무엇일까요?
    - 다른 라이브러리가 살아있는 이유는?

## Q&A

### 참고자료

https://slowlife1012.tistory.com/10

https://gum-equal-supply.tistory.com/16
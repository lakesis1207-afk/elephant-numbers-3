// 화면 전환: 이름으로 화면을 바꾸고, 바뀔 때마다 onChange를 부른다.

export function createRouter({ screens, onChange }) {
  let current = null;

  function go(name, params = {}) {
    if (!Object.hasOwn(screens, name)) {
      throw new Error(`[router] 없는 화면입니다: ${name}`);
    }
    current = Object.freeze({ name, params });
    onChange(current);
  }

  return {
    go,
    get current() {
      return current;
    },
  };
}

/** 브라우저 뒤로 가기를 눌러도 앱 밖으로 나가지 않게 막는다. */
export function blockBackButton(win = window) {
  const stay = () => win.history.pushState({ app: true }, '', win.location.href);
  stay();
  win.addEventListener('popstate', stay);
}

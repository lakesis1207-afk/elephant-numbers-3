// 끌어놓기: 손가락으로 끌어서 목표 위에 놓으면 onDrop, 거의 움직이지 않고 떼면 onTap.
// 3세는 끌기가 서툴러서 톡 누르기도 같은 뜻으로 받아 준다. 목표 칸은 실제보다 조금 넓게 본다.

const TAP_MOVE_PX = 12;
const TARGET_MARGIN_PX = 30;

/** (x, y)가 el 안에 있는지 (margin만큼 넓게) */
export function isInside(rect, x, y, margin = TARGET_MARGIN_PX) {
  return x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin;
}

/**
 * @param el 끌 그림
 * @param target () => 놓을 곳 요소
 * @param onDrop 목표 위에 놓았을 때
 * @param onTap 톡 눌렀을 때
 */
export function draggable(el, { target, onDrop, onTap }) {
  let start = null;

  const reset = () => {
    start = null;
    el.classList.remove('dragging');
    el.style.transform = '';
  };

  el.addEventListener('pointerdown', (e) => {
    if (el.dataset.locked) return;
    e.preventDefault();
    try {
      el.setPointerCapture(e.pointerId); // 손가락이 그림 밖으로 빨리 나가도 계속 따라오게
    } catch {
      /* 잡을 수 없는 포인터면 그냥 둔다 */
    }
    start = { x: e.clientX, y: e.clientY, moved: false };
    el.classList.add('dragging');
  });
  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > TAP_MOVE_PX) start.moved = true;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
  });
  el.addEventListener('pointerup', (e) => {
    if (!start) return;
    const { moved } = start;
    reset();
    if (!moved) onTap();
    else if (isInside(target().getBoundingClientRect(), e.clientX, e.clientY)) onDrop();
  });
  el.addEventListener('pointercancel', reset);
  // 키보드로도 고를 수 있게 (Enter = 톡 누르기)
  el.tabIndex = 0;
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !el.dataset.locked) onTap();
  });
}

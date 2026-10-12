/**
 * Spreads heavy, one-off work (like painting a big canvas) across idle moments, one task at a time,
 * so the page never freezes while it loads. Each call returns a function that cancels the task.
 */
type Task = () => void;

const queue: Task[] = [];
let scheduled = false;

const later = (cb: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 400 }) : setTimeout(cb, 16);

function pump() {
  scheduled = false;
  queue.shift()?.();
  if (queue.length) {
    scheduled = true;
    later(pump);
  }
}

export function whenIdle(task: Task) {
  queue.push(task);
  if (!scheduled) {
    scheduled = true;
    later(pump);
  }
  return () => {
    const i = queue.indexOf(task);
    if (i >= 0) queue.splice(i, 1);
  };
}

/** Runs `task` once `el` comes within `margin` of the screen. Returns a function that cancels it. */
export function whenNear(el: Element, task: Task, margin = '600px') {
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      task();
    },
    { rootMargin: `${margin} 0px` },
  );
  io.observe(el);
  return () => io.disconnect();
}

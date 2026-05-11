import { useEffect, useState } from "react";

/**
 * 把一个频繁变化的值「降频」：在 delay ms 内没有新变化时才更新返回值。
 * 适合搜索框、resize 等高频事件。
 */
export function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

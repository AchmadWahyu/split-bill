// Helper to merge refs
export function mergeRefs<T = unknown>(
  ...refs: Array<React.Ref<T> | undefined>
) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

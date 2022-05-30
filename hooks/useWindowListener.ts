import { useEffect } from "react";

function useWindowListener(
  event: string,
  callback: (p?: any) => any,
  apply = true
) {
  useEffect(() => {
    apply && callback && window.addEventListener(event, callback);

    return () =>
      apply && callback && window.removeEventListener(event, callback);
  }, [apply, event, callback]);
}

export default useWindowListener;

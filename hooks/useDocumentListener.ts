import { useEffect } from "react";

function useDocumentListener(
  event: string,
  callback: (p?: any) => any,
  apply = true
) {
  useEffect(() => {
    apply && callback && document.addEventListener(event, callback);

    return () =>
      apply && callback && document.removeEventListener(event, callback);
  }, [apply, event, callback]);
}

export default useDocumentListener;

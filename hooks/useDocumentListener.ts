import { useEffect } from "react";

function useDocumentListener(
  event: string,
  callback: (e?: any) => any,
  apply = true
) {
  useEffect(() => {
    if (apply && callback) document?.addEventListener(event, callback);

    return () => document?.removeEventListener(event, callback);
  }, [apply, event, callback]);
}

export default useDocumentListener;

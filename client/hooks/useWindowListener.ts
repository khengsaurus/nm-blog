import { useIsoEffect } from "hooks";

function useWindowListener(
  event: string,
  callback: (p?: any) => any,
  apply = true
) {
  useIsoEffect(() => {
    if (apply && callback) callback();
    window.addEventListener(event, callback);

    return () => window.removeEventListener(event, callback);
  }, [apply, event, callback]);
}

export default useWindowListener;

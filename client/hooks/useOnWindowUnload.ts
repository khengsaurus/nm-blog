import { useCallback, useEffect } from "react";

const useOnWindowUnload = (callback: () => void, unmount = true) => {
  const _callback = useCallback(
    (e: BeforeUnloadEvent) => {
      e.preventDefault();
      callback();
    },
    [callback]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", _callback);

    return () => {
      window.removeEventListener("beforeunload", _callback);
    };
  }, [_callback]);

  useEffect(() => {
    return () => {
      if (unmount) callback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unmount]);
};

export default useOnWindowUnload;

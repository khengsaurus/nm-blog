import { useCallback } from "react";
import useDocumentListener from "./useDocumentListener";

const useKeyListener = (
  which: string,
  callback: () => void,
  ready = true
) => {
  const _callback = useCallback(
    (e) => {
      if (e?.key === which) callback();
    },
    [which, callback]
  );

  useDocumentListener("keydown", _callback, ready);
};

export default useKeyListener;

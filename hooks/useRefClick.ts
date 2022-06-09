import React, { MutableRefObject, useCallback } from "react";
import useWindowListener from "./useWindowListener";

const useRefClick = (
  ref: MutableRefObject<any>,
  callback: () => void,
  ready: boolean,
  outside = true
) => {
  const trigger = useCallback(
    (e: React.MouseEvent) => {
      if (ready && ref?.current) {
        if (outside) {
          if (ref.current !== e.target) callback();
        } else if (ref.current === e.target) callback();
      }
    },
    [outside, ref, ready, callback]
  );

  useWindowListener("click", trigger);
};

export default useRefClick;

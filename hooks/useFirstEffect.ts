import React, { useEffect, useRef } from "react";

const useFirstEffect = (callback: () => any, deps: any[]) => {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useFirstEffect;

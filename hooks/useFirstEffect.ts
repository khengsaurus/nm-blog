import { useEffect, useRef } from "react";

const useFirstEffect = (
  callback: () => void,
  deps: any[],
  requireDeps = false
) => {
  const calledRef = useRef(false);

  useEffect(() => {
    if ((!requireDeps || deps.length > 0) && !calledRef.current) {
      calledRef.current = true;
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, requireDeps, JSON.stringify(deps)]);
};

export default useFirstEffect;

import { useRef, useState } from "react";
import { Status } from "../enums";
import useIsoEffect from "./useIsoEffect";

const useFirstEffect = (
  callback: () => Promise<boolean>,
  deps: any[],
  requireDeps = false
) => {
  const [status, setStatus] = useState(Status.IDLE);
  const calledRef = useRef(false);

  useIsoEffect(() => {
    if ((!requireDeps || deps.length > 0) && !calledRef.current) {
      setStatus(Status.PENDING);
      calledRef.current = true;
      callback().then((success) =>
        setStatus(success ? Status.SUCCESS : Status.ERROR)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, requireDeps, JSON.stringify(deps)]);

  return { status };
};

export default useFirstEffect;

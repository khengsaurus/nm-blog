import { useState } from "react";
import { singletonHook } from "react-singleton-hook";
import useIsoEffect from "./useIsoEffect";

const useWindowLoadedImpl = () => {
  const [windowLoaded, setWindowLoaded] = useState(false);

  useIsoEffect(() => {
    if (typeof window !== undefined) setWindowLoaded(true);
  }, []);

  return windowLoaded;
};

const useWindowLoaded = singletonHook(false, useWindowLoadedImpl);

export default useWindowLoaded;

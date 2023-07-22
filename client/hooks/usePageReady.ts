import { AppContext } from "hooks";
import { useContext, useEffect } from "react";

// Render loading animation on toolbar for ms duration
const usePageReady = (ms = 500) => {
  const { setPageReady } = useContext(AppContext);

  useEffect(() => {
    setTimeout(() => setPageReady(true), ms);
  }, [ms, setPageReady]);
};

export default usePageReady;

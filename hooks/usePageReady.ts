import { AppContext } from "hooks";
import { useContext, useEffect } from "react";

const usePageReady = () => {
  const { setPageReady } = useContext(AppContext);

  useEffect(() => {
    setTimeout(() => setPageReady(true), 500);
  }, [setPageReady]);
};

export default usePageReady;

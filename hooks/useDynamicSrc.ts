import { useState } from "react";
import useIsoEffect from "./useIsoEffect";

const useDynamicSrc = (fallback: string, src: string) => {
  const [readySrc, setReadySrc] = useState(fallback);

  useIsoEffect(() => {
    const _img = new Image();
    _img.src = src;
    _img.onload = () => setReadySrc(src);

    return () => (_img.onload = null);
  }, []);

  return readySrc;
};

export default useDynamicSrc;

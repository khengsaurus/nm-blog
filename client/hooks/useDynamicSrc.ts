import { useIsoEffect } from "hooks";
import { useState } from "react";

const useDynamicSrc = (fallback: string, src: string) => {
  const [readySrc, setReadySrc] = useState(fallback);

  useIsoEffect(() => {
    const _img = new Image();
    _img.onload = () => setReadySrc(src);
    _img.src = src;

    return () => (_img.onload = null);
  }, [src]);

  return readySrc;
};

export default useDynamicSrc;

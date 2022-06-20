import { useIsoEffect } from "hooks";
import NextImage, { ImageProps } from "next/image";
import { useState } from "react";

interface ISuspenseImage {
  src: string;
  fallback: string;
  priority?: boolean;
  alt?: string;
  props?: ImageProps;
}

/**
 * Render a Next Image with a fallback src (pre-loaded) and hydrate with another src when it has loaded
 */
const SuspenseImage = ({
  src,
  fallback,
  props,
  priority = true,
  alt = "#",
}: ISuspenseImage) => {
  const [readySrc, setReadySrc] = useState(fallback);

  useIsoEffect(() => {
    const _img = new Image();
    _img.src = src;
    _img.onload = () => setReadySrc(src);

    return () => (_img.onload = null);
  }, []);

  return (
    <NextImage
      src={readySrc}
      alt={alt}
      layout="fill"
      objectFit="cover"
      priority={priority}
      {...props}
    />
  );
};

export default SuspenseImage;

import { useDynamicSrc } from "hooks";
import NextImage, { ImageProps } from "next/image";

interface ISuspenseImage {
  src: string;
  fallback: string;
  priority?: boolean;
  alt?: string;
  props?: Partial<ImageProps>;
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
  const readySrc = useDynamicSrc(fallback, src);

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

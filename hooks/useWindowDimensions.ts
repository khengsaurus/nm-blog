import { useCallback, useState } from "react";
import { singletonHook } from "react-singleton-hook";
import { useWindowListener } from ".";

/**
 * Returns a window width and height, changes on window resize.
 * Uses singletonHook from react-singleton-hook
 *
 * @return { height, width }
 */
const useWindowDimensionsImpl = () => {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  const handleResize = useCallback(() => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  }, []);

  useWindowListener("resize", handleResize, true);

  return { height, width };
};

const useWindowDimensions = singletonHook(
  { width: 1200, height: 800 },
  useWindowDimensionsImpl
);

export default useWindowDimensions;

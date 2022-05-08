import { useLayoutEffect, useEffect } from "react";

const useIsoEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsoEffect;

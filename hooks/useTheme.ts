import { DEFAULT_THEME } from "consts";
import $ from "jquery";
import { themes } from "lib/client";
import { useEffect, useState } from "react";
import useLocalStorage from "./useLocalStorage";

const useTheme = () => {
  const [theme, setTheme] = useState(themes[DEFAULT_THEME]);
  const [themeName, setThemeName] = useLocalStorage("theme", DEFAULT_THEME);

  useEffect(() => {
    const _theme = themes[themeName];
    $("a").css("color", _theme.mainText);
    setTheme(themes[themeName]);
  }, [themeName]);

  return [theme, setThemeName];
};

export default useTheme;

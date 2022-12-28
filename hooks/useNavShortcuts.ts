import { SEARCHBOX_ID } from "consts";
import { PageRoute } from "enums";
import { useCallback, useContext } from "react";
import { AppContext } from "./context";
import useWindowListener from "./useWindowListener";

const useNavShortcuts = () => {
  const { userSessionActive, router, routerPush } = useContext(AppContext);
  const currRoute = router.pathname;

  const handleShortcut = useCallback(
    (e) => {
      const activeElement = document.activeElement;
      if (activeElement.tagName === "INPUT") {
        return;
      }
      switch (e?.key) {
        case "h":
          return currRoute !== PageRoute.HOME
            ? routerPush(PageRoute.HOME)
            : null;
        case "l":
          return !userSessionActive && currRoute !== PageRoute.LOGIN
            ? routerPush(PageRoute.LOGIN)
            : null;
        case "m":
          return userSessionActive && currRoute !== PageRoute.MY_POSTS
            ? routerPush(PageRoute.MY_POSTS)
            : null;
        case "n":
          return userSessionActive && currRoute !== PageRoute.POST_FORM
            ? routerPush(PageRoute.POST_FORM + "/new")
            : null;
        case "p":
          return userSessionActive && currRoute !== PageRoute.MY_PROFILE
            ? routerPush(PageRoute.MY_PROFILE)
            : null;
        case "s":
          e.preventDefault();
          return document.getElementById(SEARCHBOX_ID)?.focus();
        default:
          return;
      }
    },
    [currRoute, userSessionActive, routerPush]
  );

  useWindowListener("keydown", handleShortcut);
};

export default useNavShortcuts;

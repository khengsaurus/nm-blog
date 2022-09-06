import { DEFAULT_THEME } from "consts";
import { PageRoute, Status } from "enums";
import { getPostSlugs, HTTPService, themes } from "lib/client";
import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { IAppContext, IUser } from "types";
import useFirstEffectAsync from "./useFirstEffectAsync";
import useLocalStorage from "./useLocalStorage";
import useTheme from "./useTheme";
import useWindowListener from "./useWindowListener";

const initialContext: IAppContext = {
  pageReady: false,
  user: null,
  userToken: "",
  userSessionActive: true,
  router: null,
  history: [],
  theme: themes[DEFAULT_THEME],
  setPageReady: null,
  handleUser: null,
  logout: null,
  routerPush: null,
  routerBack: null,
  setThemeName: null,
  updatePostSlugs: null,
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [pageReady, setPageReady] = useState(false);
  const [user, setUser] = useState<IUser>();
  const [userSessionActive, setUserSessionActive] = useState(true);
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const [theme, setThemeName] = useTheme();
  const historyRef = useRef([]);
  const router = useRouter();

  /* -------------------- Start Router stuff -------------------- */
  const routerPush = useCallback(
    (route: string) => {
      setPageReady(false);
      if (route === PageRoute.HOME) {
        historyRef.current = new Array();
      } else {
        historyRef.current.push(router.asPath);
      }
      router.push(route);
    },
    [router]
  );

  const historyPop = useCallback(() => {
    if (historyRef.current?.length > 0) {
      historyRef.current.pop();
    }
  }, []);

  const routerBack = useCallback(() => {
    historyPop();
    router.back();
  }, [router, historyPop]);

  useWindowListener("popstate", historyPop);

  /* -------------------- End router stuff -------------------- */

  const updatePostSlugs = useCallback(
    (user: IUser) => {
      getPostSlugs(user?.username).then((res) => {
        if (res.status === 200 && res.data.user) {
          const _user = { ...user };
          _user.posts = res.data.user.posts || [];
          setUser(_user);
        }
      });
    },
    [setUser]
  );

  const handleUser = useCallback(
    (token: string, user: IUser) => {
      HTTPService.setBearer(token, user.id);
      setUserToken(token);
      setUser(user);
      updatePostSlugs(user);
    },
    [setUserToken, updatePostSlugs]
  );

  const userTokenLogin = useCallback(async () => {
    return new Promise((resolve) => {
      if (userToken) {
        HTTPService.setBearer(userToken, user?.id);
        HTTPService.handleTokenLogin(userToken).then((res) => {
          if (res.status === 200 && res.data?.user) {
            handleUser(userToken, res.data.user);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }, [handleUser, userToken, user?.id]);

  const sessionValidation = useFirstEffectAsync(
    userTokenLogin,
    !!userToken ? [userToken] : [],
    true
  );

  useEffect(() => {
    if (
      !user &&
      (sessionValidation === Status.SUCCESS ||
        sessionValidation === Status.ERROR)
    ) {
      setUserSessionActive(false);
    } else {
      setUserSessionActive(true);
    }
  }, [sessionValidation, user]);

  const logout = useCallback(
    (login = false) => {
      HTTPService.setBearer("", "");
      setUserToken("");
      setUser(null);
      if (login) {
        router.push(PageRoute.LOGIN);
      }
    },
    [setUserToken, router]
  );

  return (
    <AppContext.Provider
      value={{
        pageReady,
        user,
        userToken,
        userSessionActive,
        router,
        history: historyRef.current,
        theme,
        setPageReady,
        handleUser,
        logout,
        routerBack,
        routerPush,
        setThemeName,
        updatePostSlugs,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

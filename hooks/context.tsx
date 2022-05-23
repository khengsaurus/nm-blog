import { getPostSlugs } from "lib/client/backgroundTasks";
import { useRouter } from "next/router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { PageRoute, Status } from "../enums";
import { HTTPService } from "../lib/client";
import { IAppContext, IUser } from "../types";
import useFirstEffectAsync from "./useFirstEffectAsync";
import useLocalStorage from "./useLocalStorage";

const initialContext: IAppContext = {
  user: null,
  userToken: "",
  darkMode: false,
  router: null,
  userSessionActive: true,
  logout: () => {},
  handleUser: (token: string, user: IUser) => {},
  setDarkMode: (_?: boolean) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const [darkMode, setDarkMode] = useState(false);
  const [userSessionActive, setUserSessionActive] = useState(true);
  const router = useRouter();

  const handleUser = useCallback(
    (token: string, user: IUser) => {
      HTTPService.setBearer(token, user.id);
      setUserToken(token);
      setUser(user);
      // Make a separate call to populate user's posts to reduce load time for login events
      getPostSlugs(user.username).then((res) => {
        if (res.status === 200 && res.data.user) {
          const _user = { ...user };
          _user.posts = res.data.user.posts || [];
          setUser(_user);
        }
      });
    },
    [setUserToken]
  );

  const userTokenLogin = useCallback(async () => {
    return new Promise((resolve) => {
      if (userToken) {
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
  }, [handleUser, userToken]);

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
        router,
        user,
        userToken,
        darkMode,
        userSessionActive,
        logout,
        handleUser,
        setDarkMode,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

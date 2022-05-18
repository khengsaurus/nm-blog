import { useRouter } from "next/router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { PageRoute, Status } from "../enums";
import { HTTPService } from "../lib/client";
import { IAppContext, IUser } from "../types";
import useLocalStorage from "./useLocalStorage";
import useFirstEffectAsync from "./useFirstEffectAsync";

const initialContext: IAppContext = {
  user: null,
  userToken: "",
  darkMode: false,
  router: null,
  sessionValidation: Status.IDLE,
  logout: () => {},
  handleUser: (token: string, user: IUser) => {},
  setDarkMode: (_?: boolean) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const userTokenLogin = useCallback(async () => {
    return new Promise((resolve) => {
      if (userToken) {
        HTTPService.setBearer(userToken, "");
        HTTPService.handleTokenLogin().then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            HTTPService.setBearer(userToken, res.data.user.id);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }, [userToken]);

  const sessionValidation = useFirstEffectAsync(
    userTokenLogin,
    !!userToken ? [userToken] : [],
    true
  );

  const handleUser = useCallback(
    (token: string, user: IUser) => {
      HTTPService.setBearer(token, user.id);
      setUserToken(token);
      setUser(user);
    },
    [setUserToken]
  );

  const logout = useCallback(() => {
    HTTPService.setBearer("", "");
    setUserToken("");
    setUser(null);
    // router.push(PageRoute.LOGIN);
  }, [setUserToken]);

  return (
    <AppContext.Provider
      value={{
        router,
        user,
        userToken,
        darkMode,
        sessionValidation,
        logout,
        handleUser,
        setDarkMode,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

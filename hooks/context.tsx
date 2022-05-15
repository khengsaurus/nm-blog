import { useRouter } from "next/router";
import React, { createContext, useCallback, useState } from "react";
import { PageRoute } from "../enums";
import { HTTPService } from "../lib/client";
import { IAppContext, IUser } from "../types";
import useLocalStorage from "./useLocalStorage";
import useFirstEffectAsync from "./useFirstEffectAsync";

const initialContext: IAppContext = {
  user: null,
  userToken: "",
  darkMode: false,
  sessionActive: false,
  router: null,
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
    if (userToken) {
      HTTPService.setBearer(userToken, "");
      HTTPService.handleTokenLogin().then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          HTTPService.setBearer(userToken, res.data.user.id);
          return true;
        }
      });
    } else {
      return false;
    }
  }, [userToken]);

  const { status: sessionActive } = useFirstEffectAsync(
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
    router.push(PageRoute.LOGIN);
  }, [setUserToken, router]);

  return (
    <AppContext.Provider
      value={{
        router,
        user,
        userToken,
        darkMode,
        sessionActive,
        logout,
        handleUser,
        setDarkMode,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

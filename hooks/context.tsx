import { useRouter } from "next/router";
import React, { createContext, useCallback, useState } from "react";
import { PageRoute } from "../enums";
import { HTTPService } from "../lib/client";
import { IAppContext, IUser } from "../types";
import useLocalStorage from "../util/hooks/useLocalStorage";
import useFirstEffect from "./useFirstEffect";

const initialContext: IAppContext = {
  router: null,
  user: null,
  userToken: "",
  darkmode: false,
  logout: () => {},
  setUser: (_?: IUser) => {},
  handleUserToken: (_?: string) => {},
  setDarkmode: (_?: boolean) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const [darkmode, setDarkmode] = useState(false);
  const router = useRouter();

  const userTokenLogin = useCallback(() => {
    if (userToken) {
      HTTPService.setBearerToken(userToken);
      HTTPService.handleTokenLogin().then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
      });
    }
  }, [userToken]);

  useFirstEffect(userTokenLogin, !!userToken ? [userToken] : [], true);

  const handleUserToken = useCallback(
    (token: string) => {
      HTTPService.setBearerToken(token);
      setUserToken(token);
    },
    [setUserToken]
  );

  const logout = useCallback(() => {
    HTTPService.setBearerToken("");
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
        darkmode,
        logout,
        setUser,
        handleUserToken,
        setDarkmode,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

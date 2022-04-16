import { useRouter } from "next/router";
import React, { createContext, useCallback, useState } from "react";
import { PageRoute } from "../enum";
import { HTTPService } from "../lib/client";
import { IAlert, IAppContext, IUser } from "../types";
import useLocalStorage from "../util/hooks/useLocalStorage";
import useFirstEffect from "./useFirstEffect";

const initialContext: IAppContext = {
  router: null,
  user: null,
  userToken: "",
  logout: () => {},
  setUser: (_?: IUser) => {},
  handleUserToken: (_?: string) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
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
    router.push(PageRoute.LOGIN);
  }, [setUserToken, router]);

  return (
    <AppContext.Provider
      value={{
        router,
        user,
        userToken,
        logout,
        setUser,
        handleUserToken,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

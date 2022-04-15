import { useRouter } from "next/router";
import React, { createContext, useCallback, useState } from "react";
import { HTTPService } from "../lib/client";
import { IAlert, IAppContext, IUser } from "../types";
import useLocalStorage from "../util/hooks/useLocalStorage";

const initialContext: IAppContext = {
  alert: null,
  router: null,
  user: null,
  userToken: "",
  setAlert: (_?: IAlert) => {},
  setUser: (_?: IUser) => {},
  handleUserToken: (_?: string) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [alert, setAlert] = useState<IAlert>(null);
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const router = useRouter();

  const handleUserToken = useCallback(
    (token: string) => {
      HTTPService.setBearerToken(token);
      setUserToken(token);
    },
    [setUserToken]
  );

  return (
    <AppContext.Provider
      value={{
        alert,
        router,
        user,
        userToken,
        setAlert,
        setUser,
        handleUserToken,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

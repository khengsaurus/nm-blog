import React, { createContext, useEffect, useState } from "react";
import { IAlert, IAppContext, IUser } from "../types";

const initialContext: IAppContext = {
  user: null,
  username: "",
  setUser: (_?: IUser) => {},
  setUsername: (_?: string) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [alert, setAlert] = useState<IAlert>(null);
  const [user, setUser] = useState<IUser>();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(user?.username || "");
  }, [user?.username]);

  return (
    <AppContext.Provider
      value={{ user, username, setUser, setUsername }}
      {...props}
    />
  );
};

export default AppContextProvider;

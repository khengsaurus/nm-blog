import React, { createContext, useEffect, useState } from "react";
import { IUser } from "../types";

interface IAppContext {
  user: IUser | null;
  username: string;
  setUser: (_?: IUser) => void;
  setUsername: (_?: string) => void;
}

const initialContext = {
  user: null,
  username: "",
  setUser: (_?: IUser) => {},
  setUsername: (_?: string) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
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

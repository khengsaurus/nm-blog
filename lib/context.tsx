import axios, { AxiosRequestConfig } from "axios";
import { NextRouter, useRouter } from "next/router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { DBService, HttpRequestType } from "../enum";
import { IAlert, IAppContext, IUser } from "../types";
import useLocalStorage from "../util/hooks/useLocalStorage";

const initialContext: IAppContext = {
  alert: null,
  router: null,
  user: null,
  userToken: "",
  makeAuthHttpReq: (
    service: DBService,
    method: HttpRequestType,
    data?: any,
    config?: AxiosRequestConfig<any>
  ) => {},
  setAlert: (_?: IAlert) => {},
  setUser: (_?: IUser) => {},
  setUserToken: (_?: string) => {},
};

export const AppContext = createContext<IAppContext>(initialContext);

const AppContextProvider = (props: any) => {
  const [alert, setAlert] = useState<IAlert>(null);
  const [user, setUser] = useState<IUser>();
  const [userToken, setUserToken] = useLocalStorage("userToken", "");
  const router = useRouter();

  const makeAuthHttpReq = useCallback(
    (
      service: DBService,
      method: HttpRequestType,
      data?: any,
      config?: AxiosRequestConfig<any>
    ) => {
      const reqConfig = {
        ...config,
        headers: {
          ...(config?.headers || {}),
          Authorization: `Basic ${userToken}`,
        },
      };

      switch (method) {
        case HttpRequestType.GET:
          return axios.get(`api/${service}`, data);
        case HttpRequestType.POST:
          return axios.post(`api/${service}`, data, reqConfig);
        case HttpRequestType.PUT:
          return axios.put(`api/${service}`, data, reqConfig);
        case HttpRequestType.DELETE:
          return axios.delete(`api/${service}`, { ...reqConfig, data });
        default:
          return null;
      }
    },
    [userToken]
  );

  return (
    <AppContext.Provider
      value={{
        alert,
        router,
        user,
        userToken,
        makeAuthHttpReq,
        setAlert,
        setUser,
        setUserToken,
      }}
      {...props}
    />
  );
};

export default AppContextProvider;

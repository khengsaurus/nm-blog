import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { DBService, HttpRequestType } from "../../enum";

class ClientHTTPService {
  private instance: AxiosInstance;
  // private config: AxiosRequestConfig;
  private bearerToken: string;

  constructor() {
    this.instance = axios.create();
    // this.config = {};
  }

  setBearerToken(token: string) {
    this.bearerToken = token;
  }

  makeAuthHttpReq(
    service: DBService,
    method: HttpRequestType,
    data?: any,
    config?: AxiosRequestConfig<any>
  ) {
    const reqConfig = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    switch (method) {
      case HttpRequestType.GET:
        return this.instance.get(`api/${service}`, data);
      case HttpRequestType.POST:
        return this.instance.post(`api/${service}`, data, reqConfig);
      case HttpRequestType.PUT:
        return this.instance.put(`api/${service}`, data, reqConfig);
      case HttpRequestType.DELETE:
        return this.instance.delete(`api/${service}`, { ...reqConfig, data });
      default:
        return null;
    }
  }

  // handleLogin(res: IResponse): IResponse {
  //   if (res.token) {
  //     this.setBearerToken(res.token);
  //     return res;
  //   } else {
  //     throw new Error(res.message || ErrorMessage.LOGIN_FAIL);
  //   }
  // }

  // handleLoginWithToken = async (): Promise<IResponse | null> => {
  //   return new Promise((resolve) => {
  //     try {
  //       this.instance
  //         .post(
  //           this.usersRoute,
  //           {
  //             action: "login-token",
  //           },
  //           this.config
  //         )
  //         .then((res) => resolve(this.handleLogin(res.data)))
  //         .catch((err) => resolve({ message: err.message, error: true }));
  //     } catch (err) {
  //       console.error(err);
  //       resolve(null);
  //     }
  //   });
  // };

  // handleUserLogin = async (
  //   username: string,
  //   password: string
  // ): Promise<IResponse | null> => {
  //   return new Promise((resolve) => {
  //     try {
  //       this.instance
  //         .post(
  //           this.usersRoute,
  //           {
  //             username,
  //             password,
  //             action: "login",
  //           },
  //           this.config
  //         )
  //         .then((res) => resolve(this.handleLogin(res.data)))
  //         .catch((err) => resolve({ message: err.message, error: true }));
  //     } catch (err) {
  //       console.error(err);
  //       resolve(null);
  //     }
  //   });
  // };

  // handleUserRegister = async (
  //   username: string,
  //   password: string
  // ): Promise<IResponse | null> => {
  //   return new Promise(async (resolve) => {
  //     try {
  //       await this.instance
  //         .post(
  //           this.usersRoute,
  //           {
  //             username,
  //             password,
  //             action: "register",
  //           },
  //           this.config
  //         )
  //         .then((res) => resolve(this.handleLogin(res.data)))
  //         .catch((err) => resolve({ message: err.message, error: true }));
  //     } catch (err) {
  //       console.error(err);
  //       resolve(null);
  //     }
  //   });
  // };
}

export default ClientHTTPService;

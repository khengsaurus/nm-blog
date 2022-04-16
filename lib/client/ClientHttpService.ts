import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, HttpRequestType } from "../../enum";

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

  handleTokenLogin() {
    return this.makeAuthHttpReq(DBService.USERS, HttpRequestType.POST, {
      action: APIAction.USER_TOKEN_LOGIN,
    });
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
}

export default ClientHTTPService;

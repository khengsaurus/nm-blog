import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, HttpRequest } from "../../enum";

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
    return this.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      action: APIAction.USER_TOKEN_LOGIN,
    });
  }

  makeAuthHttpReq(
    service: DBService,
    method: HttpRequest,
    data?: any,
    params?: object,
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
      case HttpRequest.GET:
        return this.instance.get(`api/${service}`, { params });
      case HttpRequest.POST:
        return this.instance.post(`api/${service}`, data, reqConfig);
      case HttpRequest.PUT:
        return this.instance.put(`api/${service}`, data, reqConfig);
      case HttpRequest.DELETE:
        return this.instance.delete(`api/${service}`, { ...reqConfig, data });
      default:
        return null;
    }
  }
}

export default ClientHTTPService;

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, HttpRequest } from "../../enums";

class ClientHTTPService {
  private instance: AxiosInstance;
  private bearerToken: string;
  private userId: string;

  constructor() {
    this.instance = axios.create();
  }

  setBearer(token: string, userId: string) {
    this.bearerToken = token;
    this.userId = userId;
  }

  handleTokenLogin() {
    return this.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      action: APIAction.USER_TOKEN_LOGIN,
    });
  }

  makeGetReq(service: DBService, params?: Object) {
    return this.instance.get(`api/${service}`);
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
        return this.instance.post(
          `api/${service}`,
          { ...data, userId: this.userId },
          reqConfig
        );
      case HttpRequest.PUT:
        return this.instance.put(
          `api/${service}`,
          { ...data, userId: this.userId },
          reqConfig
        );
      case HttpRequest.DELETE:
        return this.instance.delete(`api/${service}`, {
          ...reqConfig,
          data: { ...data, userId: this.userId },
        });
      default:
        return null;
    }
  }
}

export default ClientHTTPService;

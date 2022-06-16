import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, HttpRequest } from "enums";
import { IResponse } from "types";

class ClientHTTPService {
  private instance: AxiosInstance;
  private bearerToken: string;
  private userId: string;

  constructor() {
    this.instance = axios.create({ baseURL: "/api/" });
  }

  /**
   * Content-Type: application/json by default.
   * Will inject bearer token & userId into body for POST requests
   */
  makeAuthHttpReq(
    service: DBService,
    method: HttpRequest,
    bodyOrParams?: object,
    config?: AxiosRequestConfig<any>
  ) {
    const reqConfig = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
        // Authorization: `Bearer ${this.bearerToken}`, // TODO: vercel
        userToken: this.bearerToken,
      },
    };

    switch (method) {
      case HttpRequest.GET:
        return this.instance.get(service, {
          params: bodyOrParams,
        });
      case HttpRequest.POST:
        return this.instance.post(
          service,
          { ...bodyOrParams, userId: this.userId },
          reqConfig
        );
      case HttpRequest.PATCH:
        return this.instance.patch(
          service,
          { ...bodyOrParams, userId: this.userId },
          reqConfig
        );
      case HttpRequest.DELETE:
        return this.instance.delete(service, {
          ...reqConfig,
          params: { ...bodyOrParams, userId: this.userId },
        });
      default:
        return null;
    }
  }

  /**
   * Current flow is to have this called twice on app mount:
   * -> first time to set bearer token
   * -> handleTokenLogin to retrieve userId
   * -> second time to set userId
   */
  setBearer(token: string, userId: string) {
    this.bearerToken = token;
    this.userId = userId;
  }

  handleTokenLogin(token: string) {
    return this.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      token,
      action: APIAction.USER_TOKEN_LOGIN,
    });
  }

  makeGetReq(service: DBService, params?: object) {
    return this.instance.get(service, { params });
  }

  uploadImage = async (image: any): Promise<IResponse | null> => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("userId", this.userId);
    return this.instance.post(DBService.IMAGES, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // Authorization: `Bearer ${this.bearerToken}`, // TODO: vercel
        userToken: this.bearerToken,
      },
    });
  };
}

export default ClientHTTPService;

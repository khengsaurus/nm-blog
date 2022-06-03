import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, HttpRequest } from "enums";
import { IResponse } from "types";

export const serverUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_URL
    : process.env.PROD_URL;

class ClientHTTPService {
  private instance: AxiosInstance;
  private bearerToken: string;
  private userId: string;

  constructor() {
    this.instance = axios.create({
      baseURL: serverUrl,
    });
  }

  /**
   * Content-Type: application/json by default
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
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    switch (method) {
      case HttpRequest.GET:
        return this.instance.get(`/api/${service}`, {
          params: bodyOrParams,
        });
      case HttpRequest.POST:
        return this.instance.post(
          `/api/${service}`,
          { ...bodyOrParams, userId: this.userId },
          reqConfig
        );
      case HttpRequest.PATCH:
        return this.instance.patch(
          `/api/${service}`,
          { ...bodyOrParams, userId: this.userId },
          reqConfig
        );
      case HttpRequest.DELETE:
        return this.instance.delete(`/api/${service}`, {
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
    return this.instance.get(`/api/${service}`, { params });
  }

  uploadImage = async (image: any): Promise<IResponse | null> => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("userId", this.userId);
    return this.instance.post(`/api/${DBService.IMAGES}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${this.bearerToken}`,
      },
    });
  };

  deleteImage = async (imageKey: string): Promise<IResponse> => {
    return this.makeAuthHttpReq(DBService.IMAGES, HttpRequest.DELETE, {
      imageKey,
    });
  };
}

export default ClientHTTPService;

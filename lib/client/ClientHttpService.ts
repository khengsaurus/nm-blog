import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IResponse } from "types";
import { APIAction, DBService, HttpRequest } from "../../enums";

export const serverUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_URL
    : process.env.VERCEL_URL;

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
    body?: object,
    getParams?: object,
    config?: AxiosRequestConfig<any>
  ) {
    const reqConfig = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
        Authorization: `Bearer ${this.bearerToken}`,
      },
      // onUploadProgress: (event) =>
      //   console.log(
      //     `Current progress:`,
      //     Math.round((event.loaded * 100) / event.total)
      //   ),
    };

    switch (method) {
      case HttpRequest.GET:
        return this.instance.get(`/api/${service}`, {
          params: getParams,
        });
      case HttpRequest.POST:
        return this.instance.post(
          `/api/${service}`,
          { ...body, userId: this.userId },
          reqConfig
        );
      case HttpRequest.PUT:
        return this.instance.put(
          `/api/${service}`,
          { ...body, userId: this.userId },
          reqConfig
        );
      case HttpRequest.DELETE:
        return this.instance.delete(`/api/${service}`, {
          ...reqConfig,
          data: { ...body, userId: this.userId },
        });
      default:
        return null;
    }
  }

  /**
   * Current flow is to have this called twice on app mount:
   * -> first time to set bearer token
   * -> handleTokenLogin to retrieve useId
   * -> second time to set userId
   */
  setBearer(token: string, userId: string) {
    console.log("-> setBearer(): " + userId);
    this.bearerToken = token;
    this.userId = userId;
  }

  handleTokenLogin() {
    return this.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      action: APIAction.USER_TOKEN_LOGIN,
    });
  }

  makeGetReq(service: DBService, params?: Object) {
    return this.instance.get(`/api/${service}`, { params });
  }

  uploadImage = async (image: any): Promise<IResponse | null> => {
    const formData = new FormData();
    console.log(this.userId);
    formData.append("image", image);
    formData.append("user-id", this.userId);
    return this.instance.post(`/api/${DBService.IMAGES}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${this.bearerToken}`,
      },
    });
  };
}

export default ClientHTTPService;

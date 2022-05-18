import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IResponse } from "types";
import { APIAction, DBService, HttpRequest } from "../../enums";

class ClientHTTPService {
  private instance: AxiosInstance;
  private bearerToken: string;
  private userId: string;

  constructor() {
    this.instance = axios.create({
      baseURL:
        process.env.NODE_ENV === "development"
          ? process.env.DEV_URL
          : process.env.VERCEL_URL,
    });
  }

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
        ...config?.headers,
        Authorization: `Bearer ${this.bearerToken}`,
      },
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
    return this.instance.get(`/api/${service}`, { params });
  }

  uploadPostWithImage = async (
    postData: any,
    file: any
  ): Promise<IResponse | null> => {
    const formData = new FormData();
    const fileName = `${file.name}`;
    formData.append("attachment", file, fileName);
    return this.makeAuthHttpReq(
      DBService.POSTS,
      HttpRequest.POST,
      {
        ...postData,
        formData,
        userId: this.userId,
      },
      null, // TODO:
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };
}

export default ClientHTTPService;

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { APIAction, DBService, ErrorMessage, HttpRequest } from "enums";

const authBearer = { Authorization: `Bearer ${process.env.BEARER}` };

class ClientHTTPService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({ baseURL: "/api/", headers: authBearer });
  }

  /**
   * Current flow is to have this called twice on app mount:
   * -> first time to set bearer token
   * -> handleTokenLogin to retrieve userId
   * -> second time to set user-id header
   */
  setBearer(token: string, userId: string) {
    this.instance.defaults.headers.common["user-token"] = token;
    this.instance.defaults.headers.common["user-id"] = userId;
  }

  handleTokenLogin(token: string) {
    return this.makeAuthHttpReq(DBService.USERS, HttpRequest.POST, {
      token,
      action: APIAction.USER_TOKEN_LOGIN,
    });
  }

  /**
   * Content-Type: application/json by default.
   * Headers will contain user-id & user-token if user is logged in
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
      },
    };

    switch (method) {
      case HttpRequest.GET:
        return this.instance.get(service, {
          params: bodyOrParams,
          headers: authBearer,
        });
      case HttpRequest.POST:
        return this.instance.post(service, { ...bodyOrParams }, reqConfig);
      case HttpRequest.PUT:
        return this.instance.put(service, { ...bodyOrParams }, reqConfig);
      case HttpRequest.PATCH:
        return this.instance.patch(service, { ...bodyOrParams }, reqConfig);
      case HttpRequest.DELETE:
        return this.instance.delete(service, {
          ...reqConfig,
          params: { ...bodyOrParams },
        });
      default:
        return null;
    }
  }

  makeGetReq(service: DBService, params?: object) {
    return this.instance.get(service, { params, headers: authBearer });
  }

  /**
   * Upload a file to S3 via a presigned `PutObject` URL.
   * Invokes a PUT fetch with header "Content-Type": "multipart/form-data"
   */
  uploadFile = async (presignedURL: string, file: any): Promise<Response> => {
    if (!presignedURL || !file) {
      return Promise.reject(new Error(ErrorMessage.IMAGE_UPLOAD_400));
    }
    return fetch(presignedURL, {
      method: HttpRequest.PUT,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: file,
    });
  };
}

export default ClientHTTPService;

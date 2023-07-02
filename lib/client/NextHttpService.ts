import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { IS_DEV_S } from "consts";
import { ApiAction, DbService, ErrorMessage, HttpRequest } from "enums";
import { IFileReq, IPostReq, IUserReq } from "types";

const authBearer = { Authorization: `Bearer ${process.env.BEARER}` };

class NextHttpService {
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
    return this.makeAuthHttpReq(DbService.USERS, HttpRequest.POST, {
      token,
      action: ApiAction.USER_TOKEN_LOGIN,
    });
  }

  /**
   * Content-Type: application/json by default.
   * Headers will contain user-id & user-token if user is logged in
   */
  makeAuthHttpReq(
    service: DbService,
    method: HttpRequest,
    bodyOrParams?: Partial<IPostReq | IUserReq | IFileReq>,
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

  /**
   * Upload a file to S3 via a presigned `PutObject` URL.
   * Invokes a PUT fetch with header "Content-Type": "multipart/form-data"
   *
   * https://github.com/localstack/localstack/issues/3266
   * Localstack S3: ensure the same `Content-Type` header is sent when
   * generating the presigned-url as when uploading to it via PUT request
   */
  uploadFile = async (
    presignedURL: string,
    userId: string,
    file: File,
    signal?: AbortSignal
  ): Promise<Response> => {
    if (!presignedURL || !file) {
      return Promise.reject(new Error(ErrorMessage.F_UPLOAD_400));
    }
    return fetch(presignedURL, {
      method: HttpRequest.PUT,
      headers: IS_DEV_S
        ? {
            "Content-Type": "application/json",
            "x-amz-acl": "public-read-write",
            "x-amz-tagging": `user_id=${userId}&file_name=${file.name}`,
          }
        : {
            "Content-Type": "multipart/form-data",
            // "x-amz-tagging": tag,
          },
      body: file,
      signal,
    });
  };
}

export default NextHttpService;

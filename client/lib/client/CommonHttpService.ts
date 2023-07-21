import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { SERVER_URL } from "consts";
import ip from "ip";

class CommonHttpService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: SERVER_URL,
      headers: { "x-client-ip": ip.address() },
    });
  }

  head(url: string, config?: AxiosRequestConfig) {
    return this.instance.head(url, config);
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }
}

export default CommonHttpService;

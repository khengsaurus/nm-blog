import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { SERVER_URL } from "consts";
import ip from "ip";

class ClientHttpService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({ baseURL: SERVER_URL });
    this.instance.defaults.headers.common["x-client-ip"] = ip.address();
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }
}

export default ClientHttpService;

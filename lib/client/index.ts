import ClientHTTPService, { serverUrl } from "./ClientHttpService";
import { getPostSlugs, uploadImage } from "./tasks";

const HTTPService = new ClientHTTPService();

export { serverUrl, HTTPService, getPostSlugs, uploadImage };

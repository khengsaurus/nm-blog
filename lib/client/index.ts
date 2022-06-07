import ClientHTTPService, { serverUrl } from "./ClientHttpService";
import { getPostSlugs, uploadImage } from "./tasks";
import themes from "./themes";

const HTTPService = new ClientHTTPService();

export { serverUrl, HTTPService, themes, getPostSlugs, uploadImage };

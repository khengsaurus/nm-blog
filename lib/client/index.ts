import ClientHTTPService from "./ClientHttpService";
import { getPostSlugs, uploadImage } from "./tasks";
import themes from "./themes";

const HTTPService = new ClientHTTPService();

export { HTTPService, themes, getPostSlugs, uploadImage };

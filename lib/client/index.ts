import ClientHTTPService from "./ClientHttpService";
import markdown from "./markdown";
import { getPostSlugs } from "./tasks";
import themes from "./themes";

const HTTPService = new ClientHTTPService();

export { HTTPService, themes, getPostSlugs, markdown };

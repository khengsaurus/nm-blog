export const CACHE_DEFAULT =
  "public, maxage=21600, s-maxage=21600, stale-while-revalidate=300"; // cache 6 hours
export const DEFAULT_THEME = "dark";
export const DEFAULT_EXPIRE_S = 600;
export const EXPERIMENTAL_RUNTIME = { runtime: "experimental-edge" };
export const MAX_FILE_SIZE_MB = 8;
export const PAGINATE_LIMIT = 12;
export const MAX_POSTS_PER_USER = 8;
export const MAX_FILES = 4;
export const MAX_FILES_A = 10;
export const IS_DEV_S =
  process.env.DEV_S === "1" || process.env.NEXT_PUBLIC_DEV_S === "1";
export const IS_DEV = IS_DEV_S || process.env.DEV === "1";
export const SEARCHBOX_ID = "search-box";

// point to public for both server & client access
export const SERVER_URL = IS_DEV_S
  ? process.env.NEXT_PUBLIC_DEV_SERVER_URL
  : process.env.NEXT_PUBLIC_SERVER_URL;

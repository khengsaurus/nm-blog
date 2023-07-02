export const CACHE_DEFAULT =
  // "public, maxage=30, s-maxage=30, stale-while-revalidate=604800"; // 7 days swr
  "public, maxage=1, s-maxage=1, stale-while-revalidate=1";
export const DEFAULT_THEME = "dark";
export const DEFAULT_EXPIRE_S = 600;
export const EXPERIMENTAL_RUNTIME = { runtime: "experimental-edge" };
export const MAX_FILE_SIZE_MB = 8;
export const PAGINATE_LIMIT = 12;
export const MAX_POSTS_PER_USER = 8;
export const MAX_FILES = 4;
export const MAX_FILES_A = 10;
export const IS_DEV = process.env.DEV === "1";
export const SEARCHBOX_ID = "search-box";

// redis keys
export const CURR = "NM_CURR";
export const HOME = "NM_HOME";

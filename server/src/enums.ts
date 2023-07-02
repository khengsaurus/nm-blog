export enum ConnectionType {
  MONGO = "mongo",
  REDIS = "redis",
}

export enum DurationMS {
  MIN = 1000 * 60,
  HOUR = 1000 * 60 * 60,
  DAY = 1000 * 60 * 60 * 24,
  WEEK = 1000 * 60 * 60 * 24 * 7,
}

export enum Flag {
  PREVIEW = "preview",
  PREVIEW_IMG = "preview-img",
  USER_TAG = "u=",
  DATE_TAG = "d=",
  LIMIT_TAG = "l=",
  PRIVATE_TAG = "p=",
  SEARCH = "s=",
}

export enum HttpResponse {
  _200 = "Success",
  _400 = "Bad request",
  _401 = "Unauthorized request",
  _404 = "Failed to find resource",
  _500 = "Internal server error",
  BAD_LOGIN = "Incorrect username or password",
  SERVER_LISTENING = "Server listening on port ",
  USERNAME_TAKEN = "Username already taken",
}

export enum ServerInfo {
  EMAIL_USED = "Email already used",
  USER_LOGIN = "User logged in successfully",
  USER_DELETED = "User deleted successfully",
  USER_NA = "User does not exist",
  USER_REGISTERED = "User registered",
  USER_RETRIEVED = "User retrieved",
  USER_UPDATED = "User updated",
  USERNAME_TAKEN = "Username already taken",
  USER_BAD_LOGIN = "Incorrect username or password",

  POST_CREATED = "Post created",
  POST_DELETED = "Post deleted",
  POST_RETRIEVED = "Post(s) retrieved",
  POST_RETRIEVED_CACHED = "Post(s) retrieved from cache",
  POST_UPDATED = "Post updated",
  POST_SLUGS_RETRIEVED = "Post slugs retrieved",
  POST_NA = "No post(s) found",

  FILE_DELETED = "File deleted",
  REQUEST_FAILED = "Server request failed",

  REDIS_SET_SUCCESS = "Redis - successful set",
  REDIS_GET_SUCCESS = "Redis - successful get",
  REDIS_DEL_SUCCESS = "Redis - successful del",

  REDIS_SET_FAIL = "Redis - failed set",
  REDIS_GET_FAIL = "Redis - failed get",
  REDIS_DEL_FAIL = "Redis - failed del",

  REDIS_HSET_SUCCESS = "Redis - successful hset",
  REDIS_HGET_SUCCESS = "Redis - successful hget",
  REDIS_HGETALL_SUCCESS = "Redis - successful hgetall",
  REDIS_HDEL_SUCCESS = "Redis - successful hdel",

  REDIS_HSET_FAIL = "Redis - failed hset",
  REDIS_HGETALL_FAIL = "Redis - failed hgetall",
  REDIS_HDEL_FAIL = "Redis - failed hdel",

  REDIS_CONNECTION_FAIL = "Redis - failed to init connection",
  MONGO_CONNECTION_FAIL = "MongoDB - failed to init connection",

  SERVER_ACTIVE = "Server active",
}

export enum ErrorMessage {
  FAILED_TO_GEN_TOKEN = "Failed to generate user token",

  U_REGISTER_FAILED = "Failed to register user",
  U_LOGIN_FAILED = "Failed to login user",
  U_RETRIEVE_FAILED = "Failed to retreive user data",
  U_UPDATE_FAILED = "Failed to update user",
  U_DELETE_FAILED = "Failed to delete user",

  P_SLUG_USED = "Slug already used",
  P_CREATE_FAIL = "Failed to create post",
  P_DELETE_FAIL = "Failed to delete post",
  P_RETRIEVE_FAIL = "Failed to retrieve post(s)",
  P_UPDATE_FAIL = "Failed to update post",

  F_UPLOAD_400 = "File upload missing required params",
  F_UPLOAD_500 = "File upload failed",
  F_DOWNLOAD_404 = "File could not be found",
  F_DOWNLOAD_500 = "Failed to retrieve download url",
  F_DOWNLOAD_FAILED = "Failed to download file",
}

export enum APIAction {
  LOGIN = "login",
  REGISTER = "register",
  USER_TOKEN_LOGIN = "user-token-login",
  USER_SET_USERNAME = "user-set-username",
  GET_POST_SLUGS = "get-post-slugs",
  GET_UPLOAD_KEY = "get-upload-key",
  GET_DOWNLOAD_KEY = "get-download-key",
  READ = "read",
}

export enum FileStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
}

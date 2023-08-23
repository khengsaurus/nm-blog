export enum Status {
  ERROR,
  IDLE,
  INFO,
  PENDING,
  SUCCESS,
}

export enum DbService {
  FILES = "files",
  POST = "post",
  POSTS_HOME = "posts/home",
  POSTS_QUERY = "posts",
  POSTS_RECENT = "posts/recent",
  POSTS_USER = "posts/user",
  USER = "user",
}

export enum HttpRequest {
  DELETE = "DELETE",
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export enum PageRoute {
  HOME = "/",
  LOGIN = "/login",
  NEW_USER = "/new-user",
  POST_FORM = "/post-form",
  MY_PROFILE = "/my-profile",
  MY_POSTS = "/my-posts",
  EDIT_PROFILE = "/edit-profile",
}

export enum DurationMS {
  MIN = 1000 * 60,
  HOUR = 1000 * 60 * 60,
  DAY = 1000 * 60 * 60 * 24,
  WEEK = 1000 * 60 * 60 * 24 * 7,
}

export enum Dimension {
  BANNER_H = 350,
  CARD_IMG_H = 80,
  CARD_W = 280,
  AVATAR_S = 24,
  AVATAR_M = 40,
  AVATAR_L = 140,
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

export enum TransitionSpeed {
  SLOW = "800ms",
  MEDIUM = "450ms",
  FAST = "300ms",
  INSTANT = "0ms",
}

export enum Transition {
  SLOW = 800,
  MEDIUM = 450,
  FAST = 300,
  INSTANT = 0,
}

export enum Size {
  XS,
  S,
  M,
  L,
}

export enum HttpResponse {
  _200 = "Success",
  _400 = "Bad request",
  _401 = "Unauthorized request",
  _404 = "Failed to find resource",
  _500 = "Internal server error",
}

export enum ToastMessage {
  POST_EDITED = "Post edited successfully",
  POST_EDITED_FAIL = "Failed to edit post",

  POST_CREATED = "Post created successfully",
  POST_CREATE_FAILED = "Failed to create post",

  POST_DELETED = "Post deleted successfully",
  POST_DELETE_FAILED = "Failed to delete post",

  PROFILE_SAVED = "Profile saved successfully",
  PROFILE_SAVE_FAILED = "Failed to save profile",

  PW_NOT_MATCHING = "Passwords do not match",

  I_ONE_ONLY = "Only 1 image can be uploaded",
  I_UPLOAD_FAIL = "Failed to upload image",
}

export enum ServerInfo {
  EMAIL_USED = "Email already used",
  USER_NA = "User does not exist",
  USER_REGISTERED = "User registered",
  POST_NA = "No post(s) found",
  FILE_DELETED = "File deleted",
}

export enum ErrorMessage {
  TRY_AGAIN = "Please try again",

  U_REGISTER_FAILED = "Failed to register user",
  U_LOGIN_FAILED = "Failed to login user",
  U_RETRIEVE_FAILED = "Failed to retreive user data",
  U_UPDATE_FAILED = "Failed to update user",
  U_DELETE_FAILED = "Failed to delete user",

  P_SLUG_USED = "Slug already used",
  P_RETRIEVE_FAIL = "Failed to retrieve post(s)",
  P_CREATE_FAIL = "Failed to create post",
  P_UPDATE_FAIL = "Failed to update post",
  P_DELETE_FAIL = "Failed to delete post",

  F_UPLOAD_400 = "File upload missing required params",
  F_UPLOAD_500 = "File upload failed",
  F_DOWNLOAD_404 = "File could not be found",
  F_DOWNLOAD_500 = "Failed to retrieve download url",
  F_DOWNLOAD_FAILED = "Failed to download file",
}

export enum ApiAction {
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

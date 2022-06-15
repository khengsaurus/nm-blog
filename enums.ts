export enum DBService {
  POSTS = "posts",
  USERS = "users",
  IMAGES = "images",
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
  POST_UPDATED = "Post updated",
  POST_SLUGS_RETRIEVED = "Post slugs retrieved",
  POST_NA = "No post(s) found",

  FILE_DELETED = "File deleted",
  REQUEST_FAILED = "Server request failed",
}

export enum ErrorMessage {
  POST_SLUG_USED = "Slug already used",
  TRY_AGAIN = "Please try again",
  PW_NOT_MATCHING = "Passwords do not match",
  ONE_IMAGE_ONLY = "Only 1 image can be uploaded",
  POST_CREATE_FAIL = "Failed to create post",
  POST_DELETE_FAIL = "Failed to delete post",
  POST_UPDATE_FAIL = "Failed to update post",
  IMAGE_DELETE_FAIL = "Failed to delete image",
  IMAGE_UPLOAD_FAIL = "Failed to upload image",
  IMAGE_DOWNLOAD_FAIL = "Failed to download image",
}

export enum APIAction {
  LOGIN = "login",
  REGISTER = "register",
  USER_TOKEN_LOGIN = "user-token-login",
  USER_SET_USERNAME = "user-set-username",
  GET_POST_SLUGS = "get-post-slugs",
  READ = "read",
}

export enum Status {
  ERROR = "error",
  IDLE = "idle",
  INFO = "info",
  PENDING = "pending",
  SUCCESS = "success",
}

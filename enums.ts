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
}

export enum PageRoute {
  HOME = "/",
  LOGIN = "/login",
  NEWPOST = "/new-post",
  NEWUSER = "/new-user",
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
  POST_RETRIEVED = "Post retrieved",
  POST_UPDATED = "Post updated",
  POST_NA = "Post does not exist",

  REQUEST_FAILED = "Server request failed",
}

export enum ErrorMessage {
  POST_SLUG_USED = "Slug already used",
  TRY_AGAIN = "Please try again",
  PW_NOT_MATCHING = "Passwords do not match",
  ONE_FILE_ONLY = "Only 1 file can be uploaded",
  FILE_UPLOAD_FAIL = "Failed to upload file",
  FILE_DOWNLOAD_FAIL = "Failed to download file",
}

export enum APIAction {
  USER_TOKEN_LOGIN = "user-token-login",
  USER_SET_USERNAME = "user-set-username",
}

export enum Status {
  ERROR = "error",
  IDLE = "idle",
  INFO = "info",
  PENDING = "pending",
  SUCCESS = "success",
}

/*------------------------------ Client ------------------------------*/

export enum PageTitle {
  HOME = "Home",
  LOGIN = "Login",
  POST = "Post",
  NEW_USER = "New User",
  NEW_POST = "New Post",
}

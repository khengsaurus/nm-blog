export enum DBService {
  POSTS = "posts",
  ITEMS = "items",
  USERS = "users",
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
  NEWUSER = "/new-user",
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
  BAD_REQUEST = "Bad request",
  EMAIL_USED = "Email already used",
  USER_DOC_CREATED = "Email available",
  USER_LOGIN = "User logged in successfully",
  USER_DELETED = "User deleted successfully",
  USER_NA = "User does not exist",
  USER_REGISTERED = "User registered",
  USER_RETRIEVED = "User retrieved",
  USER_UPDATED = "User updated",
  USERNAME_TAKEN = "Username already taken",
  USER_BAD_LOGIN = "Incorrect username or password",
}

export enum ServerError {
  CREATE_USER = "Failed to create new user doc",
}

export enum ErrorMessage {
  TRY_AGAIN = "Please try again",
  PW_NOT_MATCHING = "Passwords do not match",
}

export enum APIAction {
  USER_TOKEN_LOGIN = "user-token-login",
  USER_SET_USERNAME = "user-set-username",
}

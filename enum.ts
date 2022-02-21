export enum DBService {
  POST = "post",
  PRODUCT = "product",
  USER = "user",
}

export enum HttpRequestType {
  DELETE = "DELETE",
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
}

export enum PageRoute {
  LOGIN = "/login",
  NEWUSER = "/new-user",
}

export enum Transition {
  SLOW = 800,
  MEDIUM = 450,
  FAST = 300,
  INSTANT = 0,
}

export enum ApiError {
  AUTH_FAILED = "Authorization failed",
  AUTH_HEADER_NA = 'No auth token found. Auth header must be in the form "Bearer <token>',
  INTERNAL_500 = "Internal server error",
  INVALID_FIELDS = "Invalid fields",
}

export enum ApiInfo {
  EMAIL_AVAIL = "Email available",
  EMAIL_USED = "Email already used",
  USER_LOGIN = "User logged in successfully",
  USER_DELETED = "User deleted successfully",
  USER_NA = "User does not exist",
  USER_REGISTERED = "User registered",
  USER_RETRIEVED = "User retrieved",
  USER_UPDATED = "User updated",
  USERNAME_TAKEN = "Username already taken",
  USER_LOGIN_WRONG_CREDENTIALS = "Incorrect username or password",
}

export enum ErrorMessage {
  TRY_AGAIN = "Please try again",
  PW_NOT_MATCHING = "Passwords do not match",
}

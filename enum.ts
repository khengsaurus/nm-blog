export enum PageRoute {
  LOGIN = "/login",
}

export enum ApiError {
  AUTH_HEADER_NA = 'No auth token found. Auth header must be in the form "Bearer <token>',
  INTERNAL_500 = "Internal server error",
  INVALID_FIELDS = "Invalid fields",
}

export enum ApiInfo {
  USER_LOGIN = "User logged in successfully",
  USER_NA = "User does not exist",
  USER_REGISTERED = "User registered",
  USER_RETRIEVED = "User retrieved",
  USER_UPDATED = "User updated",
  USERNAME_TAKEN = "Username already taken",
  USER_LOGIN_WRONG_CREDENTIALS = "Incorrect username or password",
}

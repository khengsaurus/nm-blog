export function isDev() {
  return process.env.REACT_APP_FLAG?.startsWith("dev");
}

export function isDev() {
  return process.env.REACT_APP_FLAG?.startsWith("dev");
}

export function docToObject(data: any) {
  const { _id, user, ...main } = data;
  if (_id) {
    main.id = _id.toString();
  }
  if (user) {
    const { _id: userId, ..._user } = user;
    _user.id = userId.toString();
    main.user = _user;
  }
  return main;
}

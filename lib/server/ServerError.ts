import { HttpResponse } from "../../enums";

class ServerError extends Error {
  status: number;
  message: string;

  constructor(status = 500, message?: string) {
    const _message = message || HttpResponse[`_${status}`];
    super(_message);
    this.status = status;
    this.message = _message;
  }
}

export default ServerError;

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class LobbyNotFoundError extends AppError {
  constructor(code: string) {
    super(`Lobby ${code} was not found`);
  }
}

export class LobbyConflictError extends AppError {
  constructor(code: string) {
    super(`Lobby ${code} could not be updated after repeated conflicts`);
  }
}

export class ValidationError extends AppError {}

export class NotAuthorizedError extends AppError {}

export class InvalidPhaseError extends AppError {}

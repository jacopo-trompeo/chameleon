export enum ClientEvent {
  JoinLobby = "lobby:join",
  SetReady = "lobby:ready",
  StartGame = "game:start",
  SubmitQuestions = "round:submit-questions",
  SubmitAnswer = "round:submit-answer",
  ResolveRound = "round:resolve",
  NextRound = "round:next",
  ReturnToLobby = "game:return-to-lobby",
}

export enum ServerEvent {
  LobbyUpdated = "lobby:updated",
  GameStarted = "game:started",
  RoundStarted = "round:started",
  AllAnswersReady = "round:all-answers-ready",
  RoundResolved = "round:resolved",
  GameOver = "game:over",
  Error = "error",
}

export enum GamePhase {
  Lobby = "lobby",
  QuestionInput = "question-input",
  Answering = "answering",
  Reveal = "reveal",
  Resolution = "resolution",
  GameOver = "game-over",
}

export enum ResolutionVerdict {
  Caught = "caught",
  Fooled = "fooled",
}

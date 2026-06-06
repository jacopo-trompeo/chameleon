import { randomInt } from "node:crypto";
import {
  LOBBY_CODE_ALPHABET,
  LOBBY_CODE_LENGTH,
} from "@chameleon/types/constants";

export function generateLobbyCode(): string {
  let code = "";
  for (let index = 0; index < LOBBY_CODE_LENGTH; index++) {
    code += LOBBY_CODE_ALPHABET.charAt(randomInt(LOBBY_CODE_ALPHABET.length));
  }
  return code;
}

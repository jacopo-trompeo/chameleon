const CLIENT_ID_KEY = "chameleon:client-id";

export function getClientId(): string {
  let id = sessionStorage.getItem(CLIENT_ID_KEY);

  if (id === null) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLIENT_ID_KEY, id);
  }

  return id;
}

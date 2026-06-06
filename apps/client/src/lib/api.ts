const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function isLobbyCodeResponse(data: unknown): data is { code: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof (data as Record<string, unknown>).code === "string"
  );
}

export async function createLobbyRequest(targetScore: number): Promise<string> {
  const response = await fetch(`${SERVER_URL}/lobbies`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetScore }),
  });

  if (!response.ok) {
    throw new Error("Could not create a lobby");
  }

  const data: unknown = await response.json();
  if (!isLobbyCodeResponse(data)) {
    throw new Error("Unexpected server response");
  }

  return data.code;
}

export async function lobbyExists(code: string): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/lobbies/${code}`);
    return response.ok;
  } catch {
    return false;
  }
}

// services/conversational.js
// Jarvis : questions en langage libre, réponse en flux (Server-Sent Events) depuis le modèle de langage du backend.
const API_BASE_URL = '/api/api/conversational';

const SUGGESTIONS_MARKER = /[*_\s]*SUGGESTIONS\s*:/i;

/**
 * Retire la ligne « SUGGESTIONS: a | b | c » que le modèle ajoute en fin de réponse (utile pendant le flux,
 * quand le serveur n'a pas encore séparé les suggestions).
 */
export function stripSuggestions(text) {
  const index = text.search(SUGGESTIONS_MARKER);
  return index === -1 ? text : text.slice(0, index).trimEnd();
}

/**
 * Pose une question à Jarvis.
 * @param {{messages: {role: 'user'|'assistant', content: string}[], onToken?: (token: string) => void, signal?: AbortSignal}} options
 *        `messages` : l'historique de la conversation, la dernière entrée étant la question.
 * @returns {Promise<{answer: string, suggestions: string[]}>}
 */
export async function askJarvis({ messages, onToken, signal }) {
  const response = await fetch(`${API_BASE_URL}/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Votre session a expiré. Reconnectez-vous pour parler à Jarvis.');
    }
    if (response.status === 404) {
      throw new Error('Le serveur ne connaît pas encore Jarvis (route introuvable). Redémarrez le backend pour charger la dernière version.');
    }
    let message = '';
    try {
      message = (await response.json()).error;
    } catch {
      /* corps non JSON */
    }
    throw new Error(message || `Jarvis est indisponible (erreur ${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let received = '';
  let final = null;

  const handleEvent = (block) => {
    const line = block.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return;
    let payload;
    try {
      payload = JSON.parse(line.slice(5).trim());
    } catch {
      return;
    }
    if (payload.error) throw new Error(payload.error);
    if (payload.token) {
      received += payload.token;
      onToken?.(payload.token);
    }
    if (payload.done) final = payload;
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop(); // dernier bloc peut être incomplet
    blocks.forEach(handleEvent);
  }
  if (buffer.trim()) handleEvent(buffer);

  if (final) return { answer: final.answer, suggestions: final.suggestions || [] };
  if (received.trim()) return { answer: stripSuggestions(received), suggestions: [] }; // flux coupé : on garde ce qui est arrivé
  throw new Error('Jarvis n\'a pas répondu. Réessayez.');
}

export default { askJarvis, stripSuggestions };

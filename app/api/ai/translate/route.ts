import { handleRoute } from '@/server/handle-route';
import { findMail } from '@/server/store';
import { permsFor } from '@/server/rules';
import { ApiError } from '@/server/actions';
import { LANGUAGES, translateText } from '@/server/translate';

// POST { mailId, messageId, to }  - NFR "Languages": the AI can translate mail and replies (EN, DE, FR, IT, ES, PT, ZH).
// Demo only: the dummy translator knows the sentences of the seeded mails. Nothing is stored or sent.
export const POST = handleRoute('all', async (req, u) => {
  const { mailId, messageId, to } = await req.json();
  const m = findMail(mailId);
  if (!m || !permsFor(u, m).open) throw new ApiError(404, 'NOT_FOUND', 'Mail not found.');
  const message = m.thread.find((x) => x.id === messageId);
  if (!message) throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  const language = LANGUAGES.find((x) => x.code === to);
  if (!language) throw new ApiError(400, 'BAD_LANGUAGE', 'Pick one of: ' + LANGUAGES.map((x) => x.name).join(', ') + '.');
  const { text, translatedParts } = translateText(message.body, language.code);
  return { text, language: language.name, from: m.entities.language, translatedParts, languages: LANGUAGES };
});

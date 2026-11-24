/** Languages the AI can translate mail and replies into (from the requirements: EN, DE, FR, IT, ES, PT, ZH). */
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

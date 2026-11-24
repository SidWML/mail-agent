// Demo translator for the dummy server. In the real system this is the Azure OpenAI model.
// It only knows the sentences the seeded mails and replies use; everything else stays as written.

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
] as const;

type Code = (typeof LANGUAGES)[number]["code"];

const PHRASES: Array<Record<Code, string>> = [
  {
    en: "Hello AI team,",
    de: "Hallo KI-Team,",
    fr: "Bonjour l'équipe IA,",
    it: "Salve team IA,",
    es: "Hola equipo de IA,",
    pt: "Olá equipa de IA,",
    zh: "AI 团队您好，",
  },
  {
    en: "Could you please help?",
    de: "Könnten Sie uns bitte helfen?",
    fr: "Pourriez-vous nous aider, s'il vous plaît ?",
    it: "Potreste aiutarci, per favore?",
    es: "¿Podrían ayudarnos, por favor?",
    pt: "Poderiam ajudar, por favor?",
    zh: "能否请您帮忙？",
  },
  {
    en: "Thank you,",
    de: "Vielen Dank,",
    fr: "Merci,",
    it: "Grazie,",
    es: "Gracias,",
    pt: "Obrigado,",
    zh: "谢谢，",
  },
  {
    en: "Thank you.",
    de: "Vielen Dank.",
    fr: "Merci.",
    it: "Grazie.",
    es: "Gracias.",
    pt: "Obrigado.",
    zh: "谢谢。",
  },
  {
    en: "Best regards,",
    de: "Mit freundlichen Grüßen,",
    fr: "Cordialement,",
    it: "Cordiali saluti,",
    es: "Saludos cordiales,",
    pt: "Com os melhores cumprimentos,",
    zh: "此致敬礼，",
  },
  {
    en: "Here are the details you asked for.",
    de: "Hier sind die gewünschten Angaben.",
    fr: "Voici les détails que vous avez demandés.",
    it: "Ecco i dettagli che avete richiesto.",
    es: "Aquí están los detalles que solicitó.",
    pt: "Aqui estão os detalhes que pediu.",
    zh: "这是您要求的详细信息。",
  },
  {
    en: "One more question: can you confirm the timeline?",
    de: "Noch eine Frage: Können Sie den Zeitplan bestätigen?",
    fr: "Une dernière question : pouvez-vous confirmer le calendrier ?",
    it: "Un'altra domanda: potete confermare le tempistiche?",
    es: "Una pregunta más: ¿pueden confirmar el calendario?",
    pt: "Mais uma pergunta: podem confirmar o prazo?",
    zh: "还有一个问题：您能确认时间安排吗？",
  },
  {
    en: "Thanks for the details.",
    de: "Danke für die Angaben.",
    fr: "Merci pour ces détails.",
    it: "Grazie per i dettagli.",
    es: "Gracias por los detalles.",
    pt: "Obrigado pelos detalhes.",
    zh: "感谢您提供的详细信息。",
  },
  {
    en: "We are checking this with the platform team.",
    de: "Wir klären das mit dem Plattform-Team.",
    fr: "Nous vérifions cela avec l'équipe plateforme.",
    it: "Stiamo verificando con il team della piattaforma.",
    es: "Lo estamos revisando con el equipo de la plataforma.",
    pt: "Estamos a verificar com a equipa da plataforma.",
    zh: "我们正在与平台团队确认此事。",
  },
  {
    en: "The change is planned for next week; we will confirm once it is done.",
    de: "Die Änderung ist für nächste Woche geplant; wir bestätigen, sobald sie erledigt ist.",
    fr: "Le changement est prévu pour la semaine prochaine ; nous confirmerons dès qu'il sera fait.",
    it: "La modifica è prevista per la prossima settimana; confermeremo appena completata.",
    es: "El cambio está previsto para la próxima semana; lo confirmaremos cuando esté hecho.",
    pt: "A alteração está prevista para a próxima semana; confirmaremos quando estiver concluída.",
    zh: "该更改计划在下周进行，完成后我们会通知您。",
  },
  {
    en: "Thank you for your message. Could you please send us a few more details so we can continue?",
    de: "Vielen Dank für Ihre Nachricht. Könnten Sie uns bitte noch einige Angaben senden, damit wir weitermachen können?",
    fr: "Merci pour votre message. Pourriez-vous nous envoyer quelques détails supplémentaires afin que nous puissions continuer ?",
    it: "Grazie per il messaggio. Potreste inviarci qualche dettaglio in più così da poter proseguire?",
    es: "Gracias por su mensaje. ¿Podrían enviarnos algunos detalles más para poder continuar?",
    pt: "Obrigado pela sua mensagem. Poderiam enviar-nos mais alguns detalhes para podermos continuar?",
    zh: "感谢您的来信。请再提供一些详细信息，以便我们继续处理。",
  },
  {
    en: "Thanks, we have started. Could you confirm one detail?",
    de: "Danke, wir haben begonnen. Könnten Sie noch eine Angabe bestätigen?",
    fr: "Merci, nous avons commencé. Pourriez-vous confirmer un détail ?",
    it: "Grazie, abbiamo iniziato. Potreste confermare un dettaglio?",
    es: "Gracias, ya hemos empezado. ¿Podrían confirmar un detalle?",
    pt: "Obrigado, já começámos. Poderiam confirmar um detalhe?",
    zh: "谢谢，我们已开始处理。请确认一个细节。",
  },
  {
    en: "Here is the answer to your question.",
    de: "Hier ist die Antwort auf Ihre Frage.",
    fr: "Voici la réponse à votre question.",
    it: "Ecco la risposta alla vostra domanda.",
    es: "Aquí está la respuesta a su pregunta.",
    pt: "Aqui está a resposta à sua pergunta.",
    zh: "这是对您问题的答复。",
  },
];

const GREETINGS: Record<Code, string> = {
  en: "Hello",
  de: "Hallo",
  fr: "Bonjour",
  it: "Salve",
  es: "Hola",
  pt: "Olá",
  zh: "您好",
};

/** Translate a message into one of the supported languages. Sentences the demo does not know stay unchanged. */
export function translateText(text: string, to: Code) {
  let result = text;
  let translated = 0;
  for (const phrase of PHRASES) {
    if (result.includes(phrase.en)) {
      result = result.split(phrase.en).join(phrase[to]);
      translated += 1;
    }
  }
  // "Hello Aisha," style greetings.
  result = result.replace(/^Hello ([A-Z][a-z]+),/gm, (_match, name: string) => {
    translated += 1;
    return `${GREETINGS[to]} ${name},`;
  });
  return { text: result, translatedParts: translated };
}

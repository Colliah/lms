export const getPosColor = (pos: string) => {
  const type = pos?.toUpperCase() || "unknown";

  const colorMap = {
    NOUN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    VERB: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    ADJECTIVE:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    ADVERB: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    PREPOSITION:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    CONJUNCTION:
      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    INTERJECTION:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    PRONOUN:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  };

  return (
    colorMap[type as keyof typeof colorMap] ||
    "bg-secondary text-secondary-foreground"
  );
};

export function formatMWPhonetic(text: string): string {
  if (!text) return "";

  let formatted = text;

  formatted = formatted.replace(/-/g, "");

  const symbolMap: Record<string, string> = {
    ü: "uː", // như trong 'rule' -> /ruːl/
    ᵊ: "ə", // schwa viết nhỏ -> schwa thường
    ȧ: "a", // a có chấm -> a
    ä: "ɑː", // a hai chấm -> a dài
    e: "ɛ", // e thường trong MW thường là âm /ɛ/ (bed)
    ē: "iː", // e gạch ngang -> i dài (see)
    i: "ɪ", // i thường -> i ngắn (sit)
    ī: "aɪ", // i gạch ngang -> /ai/ (ice)
    ō: "oʊ", // o gạch ngang -> /oʊ/ (go)
    ȯ: "ɔː", // o một chấm -> o dài (law)
    u̇: "ʊ", // u một chấm -> u ngắn (put)
    sh: "ʃ", // sh -> ký tự tích phân
    ch: "tʃ", // ch -> t + tích phân
    j: "dʒ", // j trong MW thường là âm /dʒ/ (job)
    y: "j", // y trong MW là âm /j/ (yet)
    th: "θ", // th vô thanh (nhưng cẩn thận vì MW dùng th gạch dưới cho hữu thanh)
  };

  Object.keys(symbolMap).forEach((key) => {
    formatted = formatted.replace(new RegExp(key, "g"), symbolMap[key]);
  });

  return formatted;
}

import type { Locale } from "./I18nProvider";

function isZh(locale: Locale) {
  return locale === "zh-CN";
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getSourceTypeLabel(sourceType: string, locale: Locale) {
  const labels: Record<string, { en: string; zh: string }> = {
    YOUTUBE: { en: "YouTube Video", zh: "YouTube 视频" },
    ARTICLE: { en: "Article", zh: "文章" },
    TEXT: { en: "Plain Text", zh: "纯文本" },
    MANUAL: { en: "Manual Import", zh: "手动导入" },
  };

  const label = labels[sourceType];
  if (label) {
    return isZh(locale) ? label.zh : label.en;
  }
  return sourceType;
}

export function getLessonStatusLabel(status: string, locale: Locale) {
  const labels: Record<string, { en: string; zh: string }> = {
    READY: { en: "Ready", zh: "已就绪" },
    PROCESSING: { en: "Processing", zh: "处理中" },
    FAILED: { en: "Failed", zh: "失败" },
  };

  const label = labels[status];
  if (label) {
    return isZh(locale) ? label.zh : label.en;
  }
  return status;
}

export function getTaskTypeLabel(taskType: string, locale: Locale) {
  const labels: Record<string, { en: string; zh: string }> = {
    listen_transcribe: { en: "Listen and Transcribe", zh: "听写还原" },
    fill_blank: { en: "Fill in the Blank", zh: "填空" },
    rebuild_sentence: { en: "Rebuild the Sentence", zh: "整句重建" },
    meaning_recall: { en: "Meaning Recall", zh: "语义回忆" },
  };

  const label = labels[taskType];
  if (label) {
    return isZh(locale) ? label.zh : label.en;
  }
  return titleCase(taskType);
}

export function getDifficultyLabel(difficulty: number, locale: Locale) {
  const zhLabels = ["简单", "热身", "进阶", "较难", "挑战"];
  const enLabels = ["Easy", "Warm-up", "Stretch", "Hard", "Challenge"];
  const label = isZh(locale) ? zhLabels[difficulty - 1] : enLabels[difficulty - 1];
  return label ? `${difficulty} - ${label}` : String(difficulty);
}

export function getErrorTypeLabel(errorType: string, locale: Locale) {
  const labels: Record<string, { en: string; zh: string }> = {
    article: { en: "Article Usage", zh: "冠词" },
    awkward_expression: { en: "Awkward Expression", zh: "表达不自然" },
    capitalization: { en: "Capitalization", zh: "大小写" },
    collocation: { en: "Collocation", zh: "固定搭配" },
    grammar: { en: "Grammar", zh: "语法" },
    meaning: { en: "Meaning", zh: "语义" },
    missing_word: { en: "Missing Word", zh: "遗漏词" },
    plural: { en: "Plural Form", zh: "单复数" },
    preposition: { en: "Preposition", zh: "介词" },
    pronoun: { en: "Pronoun", zh: "代词" },
    punctuation: { en: "Punctuation", zh: "标点" },
    redundant_word: { en: "Redundant Word", zh: "多余词" },
    register: { en: "Register", zh: "语域" },
    sentence_structure: { en: "Sentence Structure", zh: "句子结构" },
    spelling: { en: "Spelling", zh: "拼写" },
    tense: { en: "Tense", zh: "时态" },
    translationese: { en: "Translationese", zh: "中式表达" },
    vocab_choice: { en: "Word Choice", zh: "词汇选择" },
    word_form: { en: "Word Form", zh: "词形" },
    word_order: { en: "Word Order", zh: "词序" },
  };

  const key = errorType.toLowerCase();
  const label = labels[key];
  if (label) {
    return isZh(locale) ? label.zh : label.en;
  }
  return isZh(locale) ? errorType.replaceAll("_", " / ") : titleCase(errorType);
}

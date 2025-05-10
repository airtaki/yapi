import en from "../locales/en.json";
import hu from "../locales/hu.json";

const defaultLocale = "en-US";
const locales: Record<string, Record<string, string>> = {
  "en-US": en,
  "hu-HU": hu,
};

export const t = (
  key: string,
  locale: string = defaultLocale,
  values: Record<string, string | number> = {}
): string => {
  const selectedLocale = locales[locale] || locales[defaultLocale];
  const template = selectedLocale[key] || key;
  return Object.entries(values).reduce(
    (result, [placeholder, value]) =>
      result.replace(new RegExp(`:${placeholder}`, "g"), String(value)),
    template
  );
};

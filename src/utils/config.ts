import config from "config";

export const getConfig = <T>(
  key: string,
  parser: (value: any) => T = (value) => value as unknown as T
): T => {
  const envValue = process.env[key.replace(/\./g, "_")];
  if (envValue !== undefined) {
    try {
      return parser(envValue);
    } catch (error) {
      throw new Error(`Failed to parse environment variable ${key}: ${error}`);
    }
  }
  return config.get<T>(key);
};

export const parseBoolean = (value: string): boolean => {
  return value.toLowerCase() === "true";
};

export const parseNumber = (value: string): number => {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Value "${value}" is not a valid number`);
  }
  return parsed;
};

export const parseJson = <T = unknown>(value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON from value "${value}": ${error}`);
  }
};

export const parseArray = (value: string, separator = ","): string[] => {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

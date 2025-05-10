const sensitivityRules = [
  /token/i,
  /key/i,
  /guid/i,
  /payee/i,
  /secret/i,
  /password/i,
  /signature/i,
  /hash/i,
  /salt/i,
  /auth/i,
  /email/i,
  /firstname/i,
  /lastname/i,
  /phone/i,
  /paymentId/i,
  /mongo/i,
  /_id/i,
  /\-id/i,
  /railway/i,
];

export const maskSensitiveData = (obj: any, seen = new WeakSet()): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object" && obj !== null) {
    if (seen.has(obj)) return "[Circular]";
    seen.add(obj);
  }

  if (typeof obj === "string" && obj.startsWith("{") && obj.endsWith("}")) {
    try {
      const parsed = JSON.parse(obj);
      return maskSensitiveData(parsed, seen);
    } catch (e) {
      return obj;
    }
  }

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveData(item, seen));
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (sensitivityRules.some((rule) => rule.test(key))) {
      acc[key] =
        typeof value === "string"
          ? value.length < 6
            ? "*".repeat(value.length)
            : value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2)
          : maskSensitiveData(value, seen);
    } else {
      acc[key] = maskSensitiveData(value, seen);
    }
    return acc;
  }, {} as Record<string, any>);
};

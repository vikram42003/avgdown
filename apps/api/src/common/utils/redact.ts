const SENSITIVE_KEYS = [
  "token",
  "code",
  "state",
  "password",
  "secret",
  "key",
  "iv",
  "salt",
  "cookie",
  "authorization",
  "signature",
  "apiKey",
  "client_id",
  "client_secret",
];

const REDACTED_VALUE = "[REDACTED]";

export function redact(input: unknown): unknown {
  if (typeof input === "string") {
    try {
      const url = new URL(input, "http://localhost");
      const searchParams = url.searchParams;

      searchParams.forEach((_, key) => {
        if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          searchParams.set(key, REDACTED_VALUE);
        }
      });

      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return input;
    }
  }

  if (Array.isArray(input)) {
    return input.map((item) => redact(item));
  }

  if (typeof input === "object" && input !== null) {
    const redactedObj = { ...(input as Record<string, unknown>) };
    Object.keys(redactedObj).forEach((key) => {
      if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        redactedObj[key] = REDACTED_VALUE;
      } else {
        redactedObj[key] = redact(redactedObj[key]);
      }
    });
    return redactedObj;
  }

  return input;
}

export function truncateId(id?: string | null): string {
  return id ? (id.split("-")[0] ?? "[MISSING_ID]") : "[MISSING_ID]";
}

export function redactEmail(email?: string | null): string {
  if (!email) return "[REDACTED]";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[REDACTED]";
  return `${local.charAt(0)}***${local.at(-1) || ""}@${domain}`;
}

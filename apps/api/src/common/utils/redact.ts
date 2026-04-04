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

// Helper function that redacts sensitive query parameters from a URL string or an object.
// Our logger interceptor logs everything but we kinda cannot log OAuth related or other stuff due to security concerns
export function redact(input: string | Record<string, unknown>): string | Record<string, unknown> {
  if (typeof input === "string") {
    try {
      const url = new URL(input, "http://localhost"); // Use dummy base for relative URLs
      const searchParams = url.searchParams;

      searchParams.forEach((_, key) => {
        // Stupid sonarlint is showing a false flag for key
        // eslint-disable-next-line sonarjs/null-dereference
        if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          searchParams.set(key, REDACTED_VALUE);
        }
      });

      // Return the pathname + search + hash for relative style consistency
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // If parsing fails, just return the original input
      return input;
    }
  }

  // If object, redact keys recursively
  const redactedObj = { ...input };
  Object.keys(redactedObj).forEach((key) => {
    // Stupid sonarlint is showing a false flag for key
    // eslint-disable-next-line sonarjs/null-dereference
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      redactedObj[key] = REDACTED_VALUE;
    } else if (typeof redactedObj[key] === "object" && redactedObj[key] !== null) {
      redactedObj[key] = redact(redactedObj[key] as Record<string, unknown>);
    }
  });

  return redactedObj;
}

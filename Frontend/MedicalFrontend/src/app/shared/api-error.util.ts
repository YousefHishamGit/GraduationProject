export function parseApiError(error: any, fallback = 'Something went wrong. Please try again.'): string {
  const body = error?.error;

  if (!body) {
    return fallback;
  }

  if (typeof body === 'string') {
    return body;
  }

  const lines: string[] = [];

  if (body.errors && typeof body.errors === 'object') {
    for (const [field, messages] of Object.entries(body.errors)) {
      const fieldMessages = Array.isArray(messages) ? messages : [messages];
      fieldMessages
        .filter(Boolean)
        .forEach((message) => lines.push(`${formatFieldName(field)}: ${message}`));
    }
  }

  if (lines.length > 0) {
    return lines.join('\n');
  }

  if (body.message) {
    return body.message;
  }

  if (body.title) {
    return body.title;
  }

  return fallback;
}

function formatFieldName(field: string): string {
  return field
    .replace(/^\$\./, '')
    .replace(/\[(\d+)\]/g, ' $1')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\./g, ' > ');
}

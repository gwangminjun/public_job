export async function sendSlackWebhookMessage(destination: string, text: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(destination, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed: ${response.status} ${body}`);
  }
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized.endsWith('.local') ||
    normalized.startsWith('127.') ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.')
  );
}

export function validateSlackWebhookUrl(destination: string): string {
  let parsed: URL;

  try {
    parsed = new URL(destination);
  } catch {
    throw new Error('유효한 Slack Webhook URL이 아닙니다.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Slack Webhook URL은 https여야 합니다.');
  }

  if (isPrivateHostname(parsed.hostname)) {
    throw new Error('사설 네트워크 주소는 사용할 수 없습니다.');
  }

  if (parsed.hostname !== 'hooks.slack.com' || !parsed.pathname.startsWith('/services/')) {
    throw new Error('Slack Incoming Webhook URL만 지원합니다.');
  }

  return parsed.toString();
}

export function maskSlackWebhook(destination: string): string {
  if (!destination) {
    return '';
  }

  if (destination.length <= 18) {
    return `${destination.slice(0, 6)}***`;
  }

  return `${destination.slice(0, 18)}...`;
}

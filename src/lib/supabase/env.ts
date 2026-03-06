const REQUIRED_ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

function getRequired(name: keyof typeof REQUIRED_ENV): string {
  const value = REQUIRED_ENV[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return getRequired('SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return getRequired('SUPABASE_ANON_KEY');
}

export function getSupabaseServiceRoleKey(): string {
  return getRequired('SUPABASE_SERVICE_ROLE_KEY');
}

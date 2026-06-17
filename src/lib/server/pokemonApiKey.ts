export function getPokemonApiKey(): string {
  return process.env.POKEMON_TCG_API_KEY?.trim() ?? '';
}

export function getPokemonApiBaseUrl(): string {
  return process.env.POKEMON_TCG_BASE_URL?.trim() ?? 'https://api.pokemontcg.io/v2';
}

import type { Metadata } from 'next';
import PokemonTcgShell from './PokemonTcgShell';

export const metadata: Metadata = {
  title: 'Pokemon TCG 도감',
  description: 'Pokemon TCG 카드 세트 및 카드 시세 조회',
};

export default function PokemonTcgLayout({ children }: { children: React.ReactNode }) {
  return <PokemonTcgShell>{children}</PokemonTcgShell>;
}

import Image from 'next/image';
import Link from 'next/link';
import type { PokemonCard } from '@/lib/pokemon/types';
import { TYPE_COLORS } from '@/lib/pokemon/typeColors';

interface CardDetailProps {
  card: PokemonCard;
}

export function CardDetail({ card }: CardDetailProps) {
  const tcgPrices = card.tcgplayer?.prices;
  const cmPrices = card.cardmarket?.prices;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 카드 이미지 */}
      <div className="flex-shrink-0 flex justify-center">
        <Image
          src={card.images.large}
          alt={card.name}
          width={367}
          height={512}
          className="rounded-2xl shadow-2xl max-w-[280px] w-full"
          unoptimized
          priority
        />
      </div>

      {/* 카드 정보 */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* 이름 + HP + 타입 */}
        <div>
          <div className="flex items-start gap-3 flex-wrap mb-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{card.name}</h1>
            {card.hp && (
              <span className="text-sm font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-lg self-center">
                HP {card.hp}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {card.types?.map((type) => (
              <span
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {type}
              </span>
            ))}
            {card.subtypes?.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {sub}
              </span>
            ))}
          </div>

          {/* 기본 정보 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: '희귀도', value: card.rarity },
              { label: '카드 번호', value: `#${card.number} / ${card.set.printedTotal}` },
              { label: '일러스트레이터', value: card.artist },
              { label: '슈퍼타입', value: card.supertype },
              ...(card.evolvesFrom ? [{ label: '진화 전', value: card.evolvesFrom }] : []),
            ].map(({ label, value }) =>
              value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              ) : null
            )}
          </div>

          {/* 수록 세트 */}
          <div className="mt-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">수록 세트</p>
            <Link
              href={`/pokemon-tcg/sets/${card.set.id}`}
              className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              {card.set.images.symbol && (
                <Image
                  src={card.set.images.symbol}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-auto"
                  unoptimized
                />
              )}
              {card.set.name} · {card.set.releaseDate}
            </Link>
          </div>
        </div>

        {/* 플레이버 텍스트 */}
        {card.flavorText && (
          <div className="border-l-4 border-red-400 pl-4">
            <p className="text-sm italic text-gray-600 dark:text-gray-400">{card.flavorText}</p>
          </div>
        )}

        {/* 특성 */}
        {card.abilities && card.abilities.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">특성</h2>
            <div className="space-y-2">
              {card.abilities.map((ability, i) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                      {ability.type}
                    </span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{ability.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{ability.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기술 */}
        {card.attacks && card.attacks.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">기술</h2>
            <div className="space-y-2">
              {card.attacks.map((attack, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {attack.cost?.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                          [{attack.cost.join('')}]
                        </span>
                      )}
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {attack.name}
                      </span>
                    </div>
                    {attack.damage && (
                      <span className="font-bold text-red-600 dark:text-red-400 shrink-0">{attack.damage}</span>
                    )}
                  </div>
                  {attack.text && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">{attack.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 약점 / 저항 / 도주 */}
        {(card.weaknesses || card.resistances || card.retreatCost) && (
          <div className="flex flex-wrap gap-4">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">약점</p>
                <div className="flex gap-1">
                  {card.weaknesses.map((w, i) => (
                    <span
                      key={i}
                      className={`text-sm font-medium px-2 py-1 rounded ${TYPE_COLORS[w.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {w.type} {w.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">저항</p>
                <div className="flex gap-1">
                  {card.resistances.map((r, i) => (
                    <span
                      key={i}
                      className={`text-sm font-medium px-2 py-1 rounded ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {r.type} {r.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.retreatCost && card.retreatCost.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">도주</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {'⚪'.repeat(card.retreatCost.length)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 시세 */}
        {(tcgPrices || cmPrices) && (
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">시세</h2>

            {tcgPrices && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                  TCGPlayer (USD)
                  {card.tcgplayer?.updatedAt && (
                    <span className="ml-2 text-xs font-normal text-blue-400">
                      {card.tcgplayer.updatedAt}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(tcgPrices) as [string, typeof tcgPrices.normal][]).map(
                    ([variant, prices]) =>
                      prices ? (
                        <div key={variant}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                            {variant.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          {prices.market !== undefined && (
                            <p className="font-bold text-gray-900 dark:text-white">
                              ${prices.market.toFixed(2)}
                            </p>
                          )}
                          {prices.low !== undefined && prices.high !== undefined && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              ${prices.low.toFixed(2)} ~ ${prices.high.toFixed(2)}
                            </p>
                          )}
                        </div>
                      ) : null
                  )}
                </div>
              </div>
            )}

            {cmPrices && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">
                  CardMarket (EUR)
                  {card.cardmarket?.updatedAt && (
                    <span className="ml-2 text-xs font-normal text-green-400">
                      {card.cardmarket.updatedAt}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '평균 판매가', value: cmPrices.averageSellPrice },
                    { label: '트렌드', value: cmPrices.trendPrice },
                    { label: '7일 평균', value: cmPrices.avg7 },
                    { label: '30일 평균', value: cmPrices.avg30 },
                  ].map(({ label, value }) =>
                    value !== undefined ? (
                      <div key={label}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                        <p className="font-bold text-gray-900 dark:text-white">€{value.toFixed(2)}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

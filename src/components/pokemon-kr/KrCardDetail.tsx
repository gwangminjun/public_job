import Image from 'next/image';
import Link from 'next/link';
import type { KrCard } from '@/lib/pokemon/kr-types';
import { KR_TYPE_COLORS } from '@/lib/pokemon/kr-types';

interface KrCardDetailProps {
  card: KrCard;
}

export function KrCardDetail({ card }: KrCardDetailProps) {
  const vi = card._versionInfo;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 카드 이미지 */}
      <div className="flex-shrink-0 flex justify-center">
        {vi?.cardImgURL ? (
          <Image
            src={vi.cardImgURL}
            alt={card.name}
            width={367}
            height={512}
            className="rounded-2xl shadow-2xl max-w-[280px] w-full"
            unoptimized
            priority
          />
        ) : (
          <div className="w-[280px] h-[390px] bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
            이미지 없음
          </div>
        )}
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
            {card.type && card.type !== '' && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${KR_TYPE_COLORS[card.type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {card.type}
              </span>
            )}
            {card.subtypes?.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {sub}
              </span>
            ))}
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: '등급', value: vi?.rarity },
              { label: '카드 번호', value: vi?.number ? `#${vi.number}` : undefined },
              { label: '일러스트레이터', value: vi?.artist },
              { label: '슈퍼타입', value: card.supertype },
              { label: '레귤레이션', value: vi?.regu },
            ].map(({ label, value }) =>
              value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              ) : null
            )}
          </div>

          {/* 수록 제품 */}
          {vi?.prodCode && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">수록 제품</p>
              <Link
                href={`/pokemon-tcg/kr/sets/${vi.prodCode}`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {vi.prodSymbolURL && (
                  <Image
                    src={vi.prodSymbolURL}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-auto"
                    unoptimized
                  />
                )}
                {vi.prodName}
              </Link>
            </div>
          )}
        </div>

        {/* 플레이버 텍스트 */}
        {card.flavorText && (
          <div className="border-l-4 border-blue-400 pl-4">
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
                    {ability.type && (
                      <span className="text-xs font-bold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                        {ability.type}
                      </span>
                    )}
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
                      {attack.cost && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                          [{attack.cost}]
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
        {(card.weakness || card.resistance || card.retreatCost) && (
          <div className="flex flex-wrap gap-4">
            {card.weakness?.type && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">약점</p>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${KR_TYPE_COLORS[card.weakness.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  {card.weakness.type} {card.weakness.value}
                </span>
              </div>
            )}
            {card.resistance?.type && card.resistance.value !== '--' && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">저항</p>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${KR_TYPE_COLORS[card.resistance.type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  {card.resistance.type} {card.resistance.value}
                </span>
              </div>
            )}
            {card.retreatCost !== undefined && card.retreatCost > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">도주</p>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {'⚪'.repeat(card.retreatCost)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

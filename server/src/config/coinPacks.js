/** Server-side coin packs (prices must not be client-controlled). */
export const COIN_PACKS = [
  {
    id: 'cp1',
    name: 'Standard Pack',
    coins: 100,
    priceUsd: 14.99,
    originalPrice: null,
    features: ['Profile Boost (24hrs)'],
    isPopular: false,
  },
  {
    id: 'cp2',
    name: 'Medium Pack',
    coins: 250,
    priceUsd: 35.99,
    originalPrice: 37.5,
    features: ['Profile Boost (24hrs)', 'Messages Priority (24 hrs)'],
    isPopular: true,
  },
  {
    id: 'cp3',
    name: 'Elite Pack',
    coins: 1000,
    priceUsd: 139.99,
    originalPrice: 149.99,
    features: ['Profile Priority', 'Messages Priority'],
    isPopular: false,
  },
];

export function getCoinPack(packId) {
  return COIN_PACKS.find((p) => p.id === packId) ?? null;
}

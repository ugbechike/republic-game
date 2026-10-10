import type { Asset, Inventory, PartyRole } from './party';
export const ASSET_LABEL: Record<Asset, string> = {
  credits: 'Credits',
  oil: 'Oil',
  passage: 'Canal passage',
  shipping: 'Shipping capacity',
  protection: 'Protection',
  food: 'Food supplies',
  repairs: 'Repairs',
};
export const ROLE_INFO: Record<PartyRole, { name: string; asset: Asset; headline: string; intel: string }> = {
  oil: {
    name: 'Oil Republic',
    asset: 'oil',
    headline: 'The world needs your fuel. You need a way through.',
    intel:
      'Keep three oil units for your own shipment. Both canal passage and shipping can deliver it; you can mix the routes.',
  },
  canal: {
    name: 'Canal Authority',
    asset: 'passage',
    headline: 'You hold the passage. Keep the canal running.',
    intel:
      'Shipping capacity brings your maintenance team home. Protection or repairs can secure the operation when those partners are present.',
  },
  shipping: {
    name: 'Shipping Republic',
    asset: 'shipping',
    headline: 'When the canal stalls, everyone needs another route.',
    intel:
      'Your ships are an alternative route for oil. You still need fuel and one passage slot to bring your fleet home.',
  },
  military: {
    name: 'Security Republic',
    asset: 'protection',
    headline: 'Your escorts can turn uncertainty into safe passage.',
    intel:
      'Canal security needs your protection. Keep your crews supplied; a signed protection transfer is enforceable, a chat promise is not.',
  },
  food: {
    name: 'Agricultural Republic',
    asset: 'food',
    headline: 'The crisis is reaching dinner tables. You have supplies.',
    intel:
      'The security fleet needs your food. Your own harvest needs fuel and shipping. Offering supplies for transport can protect both nations.',
  },
  repairs: {
    name: 'Engineering Republic',
    asset: 'repairs',
    headline: 'You can reopen the machinery that moves the world.',
    intel:
      'The canal can use repairs instead of protection. Your engineers need fuel and passage. A machinery incident may increase demand for your repair units.',
  },
};
export const BASE_VALUES: Inventory = {
  credits: 1,
  oil: 3,
  passage: 3,
  shipping: 3,
  protection: 4,
  food: 3,
  repairs: 4,
};
export const PARTY_RULES = {
  duration: 300000,
  reveal: 20000,
  twist: 150000,
  needDeadline: 240000,
  proposal: 45000,
  initialSupport: 50,
  initialCredits: 8,
  oilInventory: 14,
  roleInventory: 8,
  supportWeight: 0.7,
  influenceWeight: 0.3,
  weaknessThreshold: 6,
  weaknessRate: 0.5,
  twistInfluence: 4,
  needReward: 32,
  lateReward: 18,
  missedPenalty: 18,
  twistReward: 8,
  exportInfluence: 24,
  fallbackCredits: 4,
  fallbackReward: 12,
  giveawayRate: 1.5,
  strategicUnit: 3,
};
export const emptyInventory = (): Inventory => ({
  credits: 0,
  oil: 0,
  passage: 0,
  shipping: 0,
  protection: 0,
  food: 0,
  repairs: 0,
});

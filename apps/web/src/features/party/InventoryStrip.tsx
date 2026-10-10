import { ASSETS, ASSET_LABEL, type Inventory } from '@republic/contracts';
export function InventoryStrip({ inventory }: { inventory: Inventory }) {
  return (
    <div className="party-inventory" aria-label="Available inventory">
      {ASSETS.filter((a) => a === 'credits' || inventory[a] > 0).map((a) => (
        <span key={a}>
          <b>{inventory[a]}</b>
          {ASSET_LABEL[a]}
        </span>
      ))}
    </div>
  );
}

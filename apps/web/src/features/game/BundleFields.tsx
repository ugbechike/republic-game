import { TRADE_RESOURCES, RESOURCE_LABEL, type Bundle, type TradeItem } from '@republic/contracts';
export function BundleFields({ label, value, change }: { label: string; value: Bundle; change: (b: Bundle) => void }) {
  const items =
    value.items ??
    (value.amount ? [{ resource: value.resource, amount: value.amount, timing: 'annual' as const }] : []);
  function update(next: TradeItem[]) {
    change({ ...value, amount: 0, items: next });
  }
  return (
    <fieldset className="bundle-fields">
      <legend>{label}</legend>
      <div className="form-row">
        <label>
          Money ($B)
          <input
            type="number"
            min="0"
            max="30"
            step=".1"
            value={value.money}
            onChange={(e) => change({ ...value, money: Number(e.target.value) })}
          />
        </label>
        <label>
          Cash timing
          <select
            value={value.moneyTiming ?? 'annual'}
            onChange={(e) => change({ ...value, moneyTiming: e.target.value as 'now' | 'annual' })}
          >
            <option value="now">Immediately</option>
            <option value="annual">Per year, paid monthly</option>
          </select>
        </label>
      </div>
      {items.map((item, i) => (
        <div className="form-row trade-item" key={i}>
          <label>
            Resource {i + 1}
            <select
              value={item.resource}
              onChange={(e) =>
                update(items.map((x, j) => (j === i ? { ...x, resource: e.target.value as TradeItem['resource'] } : x)))
              }
            >
              {TRADE_RESOURCES.map((k) => (
                <option key={k} value={k}>
                  {RESOURCE_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Units
            <input
              type="number"
              min="0"
              max="60"
              step=".1"
              value={item.amount}
              onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))}
            />
          </label>
          <label>
            Delivery
            <select
              value={item.timing}
              onChange={(e) =>
                update(items.map((x, j) => (j === i ? { ...x, timing: e.target.value as TradeItem['timing'] } : x)))
              }
            >
              <option value="now">Immediately</option>
              <option value="annual">Units/year, monthly</option>
            </select>
          </label>
          <button
            type="button"
            aria-label={`Remove ${label} resource ${i + 1}`}
            onClick={() => update(items.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={items.length >= 8}
        onClick={() => update([...items, { resource: 'oil', amount: 1, timing: 'now' }])}
      >
        + Add resource
      </button>
    </fieldset>
  );
}

import { useState, type Dispatch, type SetStateAction } from "react";
import { trade, placeLimit, convert, transfer, type State } from "./engine";
export function TradeDesk({
  s,
  setS,
  symbols,
  money,
  notify,
  bank = false,
  defaultMode = "Buy",
  defaultAsset = 0,
}: {
  s: State;
  setS: Dispatch<SetStateAction<State>>;
  symbols: string[];
  money: (n: number) => string;
  notify: (s: string) => void;
  bank?: boolean;
  defaultMode?: string;
  defaultAsset?: number;
}) {
  const [mode, setMode] = useState(defaultMode),
    [order, setOrder] = useState("Market"),
    [asset, setAsset] = useState(defaultAsset),
    [target, setTarget] = useState(defaultAsset === 0 ? 1 : 0),
    [quantity, setQuantity] = useState(
      s.prices[defaultAsset] > 10000 ? 0.01 : 1,
    ),
    [price, setPrice] = useState(s.prices[defaultAsset]),
    [search, setSearch] = useState(""),
    [amount, setAmount] = useState(1000);
  const execute = () => {
    const next = bank
      ? transfer(s, amount)
      : mode === "Convert"
        ? convert(s, asset, target, quantity)
        : order === "Limit"
          ? placeLimit(s, asset, quantity * (mode === "Sell" ? -1 : 1), price)
          : trade(s, asset, quantity * (mode === "Sell" ? -1 : 1));
    if (next === s) {
      notify("Check the amount, available cash, or asset holdings.");
      return;
    }
    setS(next);
    notify(
      bank
        ? "Fictional transfer recorded"
        : order === "Limit" && mode !== "Convert"
          ? "Limit order placed; it will fill when the simulated market reaches your price."
          : "Fictional transaction recorded",
    );
  };
  return (
    <section className="ref-panel trade-desk">
      <div className="desk-header">
        <h2>{bank ? "Transfer funds" : "Trade simulator"}</h2>
        <span>SIMULATION · NO REAL MONEY</span>
      </div>
      <div className="desk-tabs">
        {(bank
          ? ["Transfer"]
          : ["Buy", "Sell", "Trade", "Convert", "Order history"]
        ).map((v) => (
          <button
            className={v === mode ? "selected" : ""}
            key={v}
            onClick={() => setMode(v === "Trade" ? "Buy" : v)}
          >
            {v}
          </button>
        ))}
      </div>
      {mode === "Order history" ? (
        <div className="order-history">
          {(s.limits || []).map((o) => (
            <div className="ref-activity-row" key={o.id}>
              <span>
                {o.quantity > 0 ? "Buy" : "Sell"} {Math.abs(o.quantity)}{" "}
                {symbols[o.asset]} @ {money(o.price)}
              </span>
              <b>{o.status}</b>
              {o.status === "pending" && (
                <button
                  onClick={() =>
                    setS((p) => ({
                      ...p,
                      limits: p.limits?.map((x) =>
                        x.id === o.id ? { ...x, status: "cancelled" } : x,
                      ),
                    }))
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
          {s.transactions.map((o, i) => (
            <div className="ref-activity-row" key={i}>
              <span>{o.label}</span>
              <b>{money(o.amount)}</b>
              <small>Filled · {o.time}s</small>
            </div>
          ))}
          {!s.transactions.length && !s.limits?.length && (
            <p>No orders yet. Your fictional trades will appear here.</p>
          )}
        </div>
      ) : (
        <>
          <div className="trade-fields">
            {bank ? (
              <>
                <label>
                  From
                  <input readOnly value={`Checking · ${money(s.cash)}`} />
                </label>
                <label>
                  To
                  <input readOnly value={`Savings · ${money(s.savings)}`} />
                </label>
                <label>
                  Amount
                  <input
                    type="number"
                    min=".01"
                    step=".01"
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Search assets
                  <input
                    placeholder="Symbol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label>
                  Asset
                  <select
                    value={asset}
                    onChange={(e) => {
                      setAsset(+e.target.value);
                      setPrice(s.prices[+e.target.value]);
                    }}
                  >
                    {symbols.map((v, i) =>
                      v.toLowerCase().includes(search.toLowerCase()) ? (
                        <option key={v} value={i}>
                          {v} · {money(s.prices[i])}
                        </option>
                      ) : null,
                    )}
                  </select>
                </label>
                {mode === "Convert" ? (
                  <label>
                    To asset
                    <select
                      value={target}
                      onChange={(e) => setTarget(+e.target.value)}
                    >
                      {symbols.map((v, i) => (
                        <option key={v} value={i}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    Order type
                    <select
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                    >
                      <option>Market</option>
                      <option>Limit</option>
                    </select>
                  </label>
                )}
                <label>
                  Quantity ({symbols[asset]})
                  <input
                    type="number"
                    min=".000001"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                  />
                </label>
                {order === "Limit" && mode !== "Convert" && (
                  <label>
                    Limit price
                    <input
                      type="number"
                      min=".01"
                      step=".01"
                      value={price}
                      onChange={(e) => setPrice(+e.target.value)}
                    />
                  </label>
                )}
              </>
            )}
          </div>
          <div className="trade-summary">
            <span>
              Available cash <b>{money(s.cash)}</b>
              {!bank && (
                <>
                  {" "}
                  · Holdings{" "}
                  <b>
                    {s.quantities[asset].toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {symbols[asset]}
                  </b>
                </>
              )}
            </span>
            <span>
              {mode === "Convert"
                ? `Receive ${((quantity * s.prices[asset]) / s.prices[target]).toFixed(6)} ${symbols[target]}`
                : bank
                  ? `Total ${money(amount)}`
                  : `Estimated total ${money(quantity * (order === "Limit" ? price : s.prices[asset]))}`}
            </span>
            <button onClick={execute}>
              {bank
                ? "Transfer"
                : mode === "Convert"
                  ? "Convert"
                  : `${mode} ${symbols[asset]}`}{" "}
              · simulated
            </button>
          </div>
        </>
      )}
    </section>
  );
}

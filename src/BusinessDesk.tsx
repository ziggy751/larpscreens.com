import { useState, type Dispatch, type SetStateAction } from "react";
import { type State } from "./engine";
export function BusinessDesk({
  s,
  setS,
  notify,
  money,
}: {
  s: State;
  setS: Dispatch<SetStateAction<State>>;
  notify: (s: string) => void;
  money: (n: number) => string;
}) {
  const [product, setProduct] = useState("Essential kit"),
    [price, setPrice] = useState(249),
    [quantity, setQuantity] = useState(1),
    [recurring, setRecurring] = useState(false);
  return (
    <section className="ref-panel trade-desk">
      <div className="desk-header">
        <h2>Create a fictional order</h2>
        <span>DEMO COMMERCE</span>
      </div>
      <div className="trade-fields">
        <label>
          Product
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            {[
              "Essential kit",
              "Pro collection",
              "Digital bundle",
              "Studio plan",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Unit price
          <input
            type="number"
            min=".01"
            step=".01"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
          />
        </label>
        <label>
          Quantity
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
          />
        </label>
        <label>
          Billing
          <select
            value={recurring ? "Monthly" : "One-time"}
            onChange={(e) => setRecurring(e.target.value === "Monthly")}
          >
            <option>One-time</option>
            <option>Monthly</option>
          </select>
        </label>
      </div>
      <div className="trade-summary">
        <span>
          Total <b>{money(price * quantity)}</b>
        </span>
        <button
          onClick={() => {
            if (
              !Number.isFinite(price) ||
              price <= 0 ||
              !Number.isInteger(quantity) ||
              quantity < 1
            ) {
              notify("Enter a positive price and whole quantity");
              return;
            }
            const amount = Math.round(price * quantity * 100) / 100;
            setS((p) => ({
              ...p,
              revenue: p.revenue + amount,
              customers: p.customers + 1,
              mrr: p.mrr + (recurring ? amount : 0),
              orders: [
                {
                  id: Math.max(1000, ...p.orders.map((o) => o.id)) + 1,
                  label: `${product} × ${quantity}${recurring ? " · subscription" : ""}`,
                  amount,
                  time: p.tick,
                },
                ...p.orders,
              ],
            }));
            notify(`New demo order · ${money(amount)}`);
          }}
        >
          Place fictional order
        </button>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Button, Card, Heading } from "./components/ui/Primitives";
export default function Pricing({ onClose }) {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="pricing-page">
      <Heading
        eyebrow="SUBSCRIPTIONS"
        title="A plan for your continuity"
        text="Core encryption, recovery fundamentals, and secure storage belong to everyone."
      />
      <Button onClick={() => setAnnual(!annual)}>
        {annual ? "Annual billing" : "Monthly billing"}
      </Button>
      <div className="pricing-grid">
        {[
          ["Starter", 0, 0, "3 records · 250 MB · 1 trusted person"],
          ["Individual", 499, 4999, "100 records · 5 GB · 2 trusted people"],
          ["Family", 999, 9999, "Unlimited records · 25 GB · 6 trusted people"],
          ["Private", 2499, 24999, "100 GB · 15 trusted people"],
          [
            "Private+",
            4999,
            49999,
            "250 GB+ · dedicated onboarding and continuity reviews",
          ],
        ].map(([name, monthly, yearly, features]) => (
          <Card key={name}>
            <h2>{name}</h2>
            <h3>
              {monthly
                ? "₹" + (annual ? yearly : monthly).toLocaleString("en-IN")
                : "Free"}
              {monthly ? (annual ? " / year" : " / month") : ""}
            </h3>
            <p className="muted">{features}</p>
            <p className="field-hint">
              {monthly
                ? "Planned subscription · checkout is not enabled."
                : "Core protection included."}
            </p>
          </Card>
        ))}
      </div>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}

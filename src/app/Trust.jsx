import { Brand, Card, Heading, Button } from "../components/ui/Primitives";
import { pages } from "./trustContent";
export default function Trust() {
  const [title, text, sections] = pages[window.location.pathname];
  return (
    <main className="trust-page">
      <a className="brand" href="/auth">
        <Brand />
      </a>
      <Heading eyebrow="LEQVOR BY LENVOR" title={title} text={text} />
      <nav className="category-tabs">
        {Object.entries(pages).map(([path, [title]]) => (
          <a key={path} href={path}>
            {title}
          </a>
        ))}
      </nav>
      {sections.map(([heading, text]) => (
        <Card key={heading}>
          <h2>{heading}</h2>
          <p className="muted">{text}</p>
        </Card>
      ))}
      <Button onClick={() => window.location.assign("/auth")}>
        Return to sign in
      </Button>
    </main>
  );
}

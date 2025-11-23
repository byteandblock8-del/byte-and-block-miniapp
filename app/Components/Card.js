// app/components/Card.js
export default function Card({ title, tag, children }) {
  return (
    <section className="bb-card">
      <div className="bb-card-inner">
        <header className="bb-card-header">
          <h2 className="bb-card-title">{title}</h2>
          {tag && <span className="bb-card-tag">{tag}</span>}
        </header>
        {children}
      </div>
    </section>
  );
}

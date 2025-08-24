import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container-xl py-24 text-center" style={{ background: 'var(--color-bg)', color: 'var(--color-text-main)' }}>
      <h1 className="h1" style={{ color: 'var(--color-heading)' }}>Page not found</h1>
      <p className="p-muted mt-2">Sorry, we couldn’t find that page.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to home
      </Link>
    </section>
  );
}

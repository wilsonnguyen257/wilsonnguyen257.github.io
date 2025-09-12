import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-white dark:bg-slate-900">
      <section className="container-xl py-24 text-center">
        <h1 className="h1">Page not found</h1>
        <p className="p-muted mt-2">Sorry, we couldn’t find that page.</p>
        <Link to="/" className="btn btn-primary mt-6">
          Back to home
        </Link>
      </section>
    </div>
  );
}

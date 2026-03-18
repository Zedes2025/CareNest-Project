import { Link } from "react-router-dom";
import authBg from "../assets/auth-bg.png";

export function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E6D9B5", backgroundImage: `url(${authBg})` }} className="flex items-center justify-center px-4">
      <div className="card shadow-lg p-8 text-center" style={{ maxWidth: "400px" }}>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Oops! The community page you are looking for does not exist.</p>
        <Link to="/home" className="btn btn-primary px-6 py-3 text-lg font-semibold">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

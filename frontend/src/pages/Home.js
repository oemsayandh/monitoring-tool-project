import { Link } from "react-router-dom";
import "../style.css";

export default function Home() {
  return (
    <div className="landing-wrapper">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">📊</span> Zero Test
        </div>
        <div className="nav-links">
          <Link to="/product">Product</Link>
          <Link to="/features">Features</Link>
          
        </div>
        <div className="nav-auth">
          <Link to="/login" className="nav-login">Log in</Link>
          <Link to="/register" className="nav-register">REGISTER HERE</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Zero Test Monitoring System</h1>
          <p className="hero-subtitle">
            Real-time CPU and RAM insights for distributed systems. 
            Supervise multiple users or manage your own dashboard with sub-second latency.
          </p>
          <div className="hero-cta">
            <Link to="/register">
              <button className="btn-primary">Get started for free</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Decorative background element */}
      <div className="bg-radial-glow"></div>
    </div>
  );
}
import { Link } from "react-router-dom";
import SocietyCard from "../components/SocietyCard.jsx";
import "./Home.css";
import { useEffect, useState } from "react";

function Home() {
  const [societyData, setSocietyData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/societies")
      .then((response) => response.json())
      .then((data) => setSocietyData(data))
      .catch((error) => console.error("Failed to fetch societies:", error));
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll(".home-page .reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [societyData.length]);

  const categories = [...new Set(societyData.map((society) => society.category).filter(Boolean))];

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-content">
          <p className="hero-label hero-enter hero-enter-1">NSUT SOCIETY RECRUITMENT</p>

          <h1 className="hero-title hero-enter hero-enter-2">
            Find Your <span><i>People.</i></span>
            <br />
            Find Your Society.
          </h1>

          <p className="hero-description hero-enter hero-enter-3">
            Discover communities at NSUT, explore what they build, and find a place where your interests can grow.
          </p>

          <div className="hero-actions hero-enter hero-enter-4">
            <Link to="/societies" className="hero-primary-button">
              Explore societies <span>→</span>
            </Link>
            <a href="#featured" className="hero-secondary-button">
              See what&apos;s inside
            </a>
          </div>

          <div className="hero-meta hero-enter hero-enter-5" aria-label="Society Hub highlights">
            <span>{societyData.length || "—"} societies</span>
            <i />
            <span>{categories.length || "—"} categories</span>
            <i />
            <span>One campus</span>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span />
          Scroll to explore
        </div>
      </section>

      <section className="featured home-section reveal" id="featured">
        <div className="section-heading">
          <div>
            <p className="section-label">DISCOVER</p>
            <h2>Featured societies</h2>
            <p className="section-description">
              A few communities to start with. There&apos;s more waiting for you.
            </p>
          </div>
          <Link to="/societies" className="view-all">
            View all <span>→</span>
          </Link>
        </div>

        <div className="society_grid">
          {societyData.length > 0 ? (
            societyData.slice(0, 6).map((society, index) => (
              <div
                className="reveal-card"
                key={society.id}
                style={{ "--reveal-delay": `${index * 70}ms` }}
              >
                <SocietyCard
                  id={society.id}
                  name={society.name}
                  description={society.description}
                  category={society.category}
                  deadline={society.deadline}
                />
              </div>
            ))
          ) : (
            <div className="home-empty">
              <span>Loading societies</span>
              <p>We&apos;re fetching the latest communities for you.</p>
            </div>
          )}
        </div>
      </section>

      <section className="home-statement reveal">
        <div className="statement-number">01</div>
        <div>
          <p className="section-label">WHY SOCIETY HUB</p>
          <h2>More than a list of clubs.</h2>
          <p>
            Find communities, understand what they do, and move from discovering a society to actually applying — all in one place.
          </p>
        </div>
      </section>

      <section className="home-cta reveal">
        <p className="section-label">READY?</p>
        <h2>There&apos;s a place for your interests here.</h2>
        <Link to="/societies" className="hero-primary-button">
          Start exploring <span>→</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SocietyDetails.css";

function SocietyDetails() {
  const { id } = useParams();

  // society = the society object returned by the backend/MySQL.
  const [society, setSociety] = useState(null);

  // loading = whether we are still fetching the society details.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/societies/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // data = the society details returned by the backend.
        setSociety(data);
      })
      .catch((error) => {
        console.error("Failed to fetch society:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Show a loading message while the backend request is running.
  if (loading) {
    return (
      <main className="society-details">
        <p className="section-label">SOCIETY</p>
        <h1>Loading...</h1>
      </main>
    );
  }

  // Show this if the society doesn't exist.
  if (!society) {
    return (
      <main className="society-details">
        <p className="section-label">SOCIETY</p>

        <h1>Society not found</h1>

        <p>
          The society you're looking for doesn't exist.
        </p>

        <Link to="/societies" className="back-link">
          ← Back to societies
        </Link>
      </main>
    );
  }

  // deadline = the deadline saved for this society in MySQL.
  const deadline = society.deadline
    ? new Date(society.deadline)
    : null;

  // isOpen = true when there is no deadline or the deadline
  // has not passed yet.
  const isOpen =
    !deadline || deadline.getTime() > Date.now();

  return (
    <main className="society-details">
      <Link to="/societies" className="back-link">
        ← Back to societies
      </Link>

      <section className="society-details-header">
        <div>
          <span className="society-details-category">
            {society.category}
          </span>

          <h1>{society.name}</h1>

          <p>{society.description}</p>
        </div>

        <span
          className={`society-details-status ${
            isOpen ? "open" : "closed"
          }`}
        >
          {isOpen ? "Recruitment Open" : "Recruitment Closed"}
        </span>
      </section>

      <section className="society-details-content">
        <div>
          <p className="section-label">ABOUT</p>

          <h2>About this society</h2>

          <p>
            Join a community of students who share your interests,
            collaborate on projects, participate in events, and
            build experiences beyond the classroom.
          </p>
        </div>

        <div className="application-panel">
          <p className="section-label">RECRUITMENT</p>

          <h2>
            {isOpen
              ? "Ready to join?"
              : "Applications are closed"}
          </h2>

          <p>
            {isOpen
              ? deadline
                ? `Applications are open until ${deadline.toLocaleString()}`
                : "Applications are currently open for this society."
              : "The application deadline for this society has passed."}
          </p>

          {isOpen ? (
            <Link
              to={`/apply/${society.id}`}
              className="apply-button"
            >
              Apply Now
            </Link>
          ) : (
            <span className="apply-button disabled">
              Applications Closed
            </span>
          )}
        </div>
      </section>
    </main>
  );
}

export default SocietyDetails;

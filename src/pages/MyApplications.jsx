import { useEffect, useState } from "react";
import "./MyApplications.css";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/applications/my", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch applications:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="applications-page">
        <p>Loading applications...</p>
      </main>
    );
  }

  return (
    <main className="applications-page">
      <div className="applications-header">
        <p className="section-label">STUDENT DASHBOARD</p>
        <h1>My Applications</h1>
        <p>Track the societies you've applied to.</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h2>No applications yet</h2>
          <p>
            You haven't applied to any societies yet.
          </p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <div
              className="application-card"
              key={application.id}
            >
              <div className="application-card-top">
                <div>
                  <p className="application-category">
                    {application.category}
                  </p>

                  <h2>{application.societyName}</h2>
                </div>

                <span className="application-status">
                  {application.status}
                </span>
              </div>

              <div className="application-reason">
                <p className="reason-label">YOUR REASON</p>
                <p>{application.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyApplications;
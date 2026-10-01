import { useEffect, useState } from "react";
import "./MyApplications.css";
import io from "socket.io-client";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch applications
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/applications/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch applications"
          );
        }

        return data;
      })
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch applications:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log(
        "Connected to Socket.IO:",
        socket.id
      );
    });

    socket.on(
      "applicationStatusUpdated",
      (updatedApplication) => {
        console.log(
          "Received application status update:",
          updatedApplication
        );

        setApplications((prevApplications) =>
          prevApplications.map((application) =>
            application.id ===
            updatedApplication.applicationId
              ? {
                  ...application,
                  status:
                    updatedApplication.status,
                }
              : application
          )
        );
      }
    );

    socket.on("connect_error", (error) => {
      console.error(
        "Socket.IO connection error:",
        error
      );
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO");
    });

    return () => {
      socket.disconnect();
    };
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
        <p className="section-label">
          STUDENT DASHBOARD
        </p>

        <h1>My Applications</h1>

        <p>
          Track the societies you've applied to.
        </p>
      </div>

      {error ? (
        <div className="empty-state">
          <h2>Unable to load applications</h2>
          <p>{error}</p>
        </div>
      ) : applications.length === 0 ? (
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

                  <h2>
                    {application.societyName}
                  </h2>
                </div>

                <span className="application-status">
                  {application.status}
                </span>

              </div>

              <div className="application-reason">

                <p className="reason-label">
                  YOUR REASON
                </p>

                <p>
                  {application.reason}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </main>
  );
}

export default MyApplications;

import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deadline, setDeadline] = useState("");
  const [deadlineMessage, setDeadlineMessage] = useState("");
  const [updatingDeadline, setUpdatingDeadline] = useState(false);

  const [question, setQuestion] = useState("");
  const [questionMessage, setQuestionMessage] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);

  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const token = localStorage.getItem("token");

        // Fetch applications
        const applicationsResponse = await fetch(
          "http://localhost:5000/api/admin/applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const applicationsData =
          await applicationsResponse.json();

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.message ||
              "Failed to fetch applications"
          );
        }

        setApplications(applicationsData);

        // Fetch analytics
        const analyticsResponse = await fetch(
          "http://localhost:5000/api/admin/analytics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const analyticsData =
          await analyticsResponse.json();

        if (!analyticsResponse.ok) {
          throw new Error(
            analyticsData.message ||
              "Failed to fetch analytics"
          );
        }

        setAnalytics(analyticsData);

        // Fetch deadline
        const deadlineResponse = await fetch(
          "http://localhost:5000/api/admin/deadline",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const deadlineData =
          await deadlineResponse.json();

        if (!deadlineResponse.ok) {
          throw new Error(
            deadlineData.message ||
              "Failed to fetch deadline"
          );
        }

        if (deadlineData.deadline) {
          setDeadline(
            deadlineData.deadline.slice(0, 16)
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch admin data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  async function updateDeadline() {
    if (!deadline) {
      setDeadlineMessage(
        "Please enter a valid deadline."
      );
      return;
    }

    setUpdatingDeadline(true);
    setDeadlineMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/deadline",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: JSON.stringify({
            deadline: deadline,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update deadline"
        );
      }

      setDeadlineMessage(
        "Deadline updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update deadline:",
        error
      );

      setDeadlineMessage(
        "Failed to update deadline. Please try again."
      );
    } finally {
      setUpdatingDeadline(false);
    }
  }

  async function addQuestion() {
    if (!question.trim()) {
      setQuestionMessage(
        "Please enter a question."
      );
      return;
    }

    setAddingQuestion(true);
    setQuestionMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add question"
        );
      }

      setQuestion("");

      setQuestionMessage(
        "Question added successfully."
      );
    } catch (error) {
      console.error(
        "Failed to add question:",
        error
      );

      setQuestionMessage(
        "Failed to add question. Please try again."
      );
    } finally {
      setAddingQuestion(false);
    }
  }

  async function updateApplicationStatus(
    applicationId,
    status
  ) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update application status"
        );
      }

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
              }
            : application
        )
      );

      // Update analytics instantly
      setAnalytics((prevAnalytics) => {
        const application =
          applications.find(
            (item) => item.id === applicationId
          );

        if (!application) {
          return prevAnalytics;
        }

        const oldStatus = application.status;

        if (oldStatus === status) {
          return prevAnalytics;
        }

        return {
          ...prevAnalytics,
          [oldStatus.toLowerCase()]:
            Math.max(
              0,
              prevAnalytics[
                oldStatus.toLowerCase()
              ] - 1
            ),
          [status.toLowerCase()]:
            prevAnalytics[
              status.toLowerCase()
            ] + 1,
        };
      });
    } catch (error) {
      console.error(
        "Failed to update application status:",
        error
      );

      alert(
        "Failed to update application status. Please try again."
      );
    }
  }

  if (loading) {
    return <p>Loading applications...</p>;
  }

  return (
    <main className="admin-page">

      {/* ADMIN HEADER */}
      <div className="admin-header">
        <div>
          <p className="admin-label">
            SOCIETY ADMIN
          </p>

          <h1>Admin Dashboard</h1>

          <p className="admin-subtitle">
            Manage applications for your society.
          </p>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="analytics-section">

        <div className="analytics-heading">
          <p className="admin-label">
            APPLICATION ANALYTICS
          </p>

          <h2>Application Overview</h2>

          <p className="analytics-description">
            A quick look at the applications received
            by your society.
          </p>
        </div>

        <div className="analytics-circles">

          <div className="analytics-circle total-circle">
            <div className="circle-content">
              <strong>{analytics.total}</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="analytics-circle pending-circle">
            <div className="circle-content">
              <strong>{analytics.pending}</strong>
              <span>Pending</span>
            </div>
          </div>

          <div className="analytics-circle accepted-circle">
            <div className="circle-content">
              <strong>{analytics.accepted}</strong>
              <span>Accepted</span>
            </div>
          </div>

          <div className="analytics-circle rejected-circle">
            <div className="circle-content">
              <strong>{analytics.rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>

        </div>
      </div>

      {/* DEADLINE */}
      <div className="deadline-section">
        <div>
          <p className="admin-label">
            RECRUITMENT DEADLINE
          </p>

          <h2>Set application deadline</h2>

          <p className="deadline-description">
            Applications will automatically close
            after this date and time.
          </p>
        </div>

        <div className="deadline-controls">
          <input
            type="datetime-local"
            value={deadline}
            onChange={(event) =>
              setDeadline(event.target.value)
            }
          />

          <button
            className="deadline-button"
            onClick={updateDeadline}
            disabled={updatingDeadline}
          >
            {updatingDeadline
              ? "Updating..."
              : "Update Deadline"}
          </button>
        </div>

        {deadlineMessage && (
          <p className="deadline-message">
            {deadlineMessage}
          </p>
        )}
      </div>

      {/* QUESTIONS */}
      <div className="questions-section">
        <div>
          <p className="admin-label">
            APPLICATION QUESTIONS
          </p>

          <h2>
            Add a question for applicants
          </h2>

          <p className="questions-description">
            Add a custom question that students
            must answer when applying to your society.
          </p>
        </div>

        <div className="question-controls">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="e.g. Why do you want to join this society?"
            rows="3"
          />

          <button
            className="question-button"
            onClick={addQuestion}
            disabled={addingQuestion}
          >
            {addingQuestion
              ? "Adding..."
              : "Add Question"}
          </button>
        </div>

        {questionMessage && (
          <p className="question-message">
            {questionMessage}
          </p>
        )}
      </div>

      {/* APPLICATIONS */}
      {applications.length === 0 ? (
        <div className="empty-state">
          <h2>No applications yet</h2>

          <p>
            Applications submitted to your society
            will appear here.
          </p>
        </div>
      ) : (
        <div className="applications-list">

          {applications.map((application) => (

            <div
              className="application-card"
              key={application.id}
            >

              <div className="application-top">

                <div>
                  <p className="application-label">
                    APPLICATION
                  </p>

                  <h2>{application.name}</h2>
                </div>

                <span
                  className={`status-badge ${application.status.toLowerCase()}`}
                >
                  {application.status}
                </span>

              </div>

              <div className="student-info">

                <div>
                  <span>Roll Number</span>
                  <p>{application.rollNumber}</p>
                </div>

                <div>
                  <span>Email</span>
                  <p>{application.email}</p>
                </div>

                <div>
                  <span>Applied</span>

                  <p>
                    {new Date(
                      application.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

              <div className="reason-section">

                <span>
                  Why they want to join
                </span>

                <p>
                  {application.reason}
                </p>

              </div>

              {application.answers &&
                application.answers.length > 0 && (

                  <div className="answers-section">

                    <span className="answers-title">
                      Application Questions and Answers
                    </span>

                    <div className="answers-list">

                      {application.answers.map(
                        (item, index) => (

                          <div
                            key={index}
                            className="answer-item"
                          >

                            <p className="answerquestion">
                              {item.question}
                            </p>

                            <p className="answer-text">
                              {item.answer ||
                                "No answer provided."}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              <div className="application-actions">

                <button
                  className="accept-btn"
                  onClick={() =>
                    updateApplicationStatus(
                      application.id,
                      "Accepted"
                    )
                  }
                >
                  Accept
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    updateApplicationStatus(
                      application.id,
                      "Rejected"
                    )
                  }
                >
                  Reject
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </main>
  );
}

export default AdminDashboard;
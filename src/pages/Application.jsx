
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Application.css";

function Application() {
  const { societyId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    reason: "",
  });

  // questions = all custom questions created by the admin
  // for the society the student is applying to.
  const [questions, setQuestions] = useState([]);

  // answers = the student's answers to the custom questions.
  // The key is the question ID and the value is the student's answer.
  const [answers, setAnswers] = useState({});

  // Tracks whether the questions are currently being loaded.
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Tracks whether the application is currently being submitted.
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `https://society-hub-zsj4.onrender.com/api/societies/${societyId}/questions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch questions."
          );
        }

        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, [societyId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleQuestionChange(questionId, value) {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent another submission while the current request is running.
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] || "",
      }));

      const response = await fetch(
        "https://society-hub-zsj4.onrender.com/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reason: formData.reason,
            societyId: Number(societyId),
            answers: formattedAnswers,
          }),
        }
      );

      // Read the response as text first.
      // This prevents the frontend from crashing if the server
      // happens to return HTML instead of JSON.
      const responseText = await response.text();

      let data;

      try {
        // Try converting the server response into JSON.
        data = JSON.parse(responseText);
      } catch {
        // If the response wasn't JSON, create a useful fallback.
        data = {
          message: "Server returned an unexpected response.",
        };
      }

      if (!response.ok) {
        alert(data.message || "Failed to submit application.");
        return;
      }

      alert(data.message || "Application submitted successfully.");

      setFormData({
        reason: "",
      });

      setAnswers({});
    } catch (error) {
      console.error("Error submitting application:", error);

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="application-page">
      <div className="application-container">

        <Link to="/societies" className="application-back-link">
          ← Back to societies
        </Link>

        <div className="application-header">
          <p className="section-label">RECRUITMENT</p>

          <h1>Society Application</h1>

          <p>
            Tell us a little about yourself and why you want to
            become part of this society.
          </p>
        </div>

        <form
          className="application-form"
          onSubmit={handleSubmit}
        >

          <div className="form-section">
            <div className="form-section-heading">
              <span>01</span>
              <h2>Personal Information</h2>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={user?.name || ""}
                  readOnly
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rollNumber">Roll Number</label>

                <input
                  id="rollNumber"
                  type="text"
                  name="rollNumber"
                  placeholder="e.g. 2025UCA1936"
                  value={user?.rollNumber || ""}
                  readOnly
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={user?.email || ""}
                  readOnly
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-section">

            <div className="form-section-heading">
              <span>02</span>
              <h2>Why this society?</h2>
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                Tell us why you want to join
              </label>

              <textarea
                id="reason"
                name="reason"
                placeholder="Tell us about your interests, experience, or what you hope to contribute..."
                value={formData.reason}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

          </div>

          {/* Custom questions created by the society admin */}
          {!loadingQuestions && questions.length > 0 && (
            <div className="form-section">

              <div className="form-section-heading">
                <span>03</span>
                <h2>Additional Questions</h2>
              </div>

              {questions.map((question) => (
                <div
                  className="form-group"
                  key={question.id}
                >
                  <label htmlFor={`question-${question.id}`}>
                    {question.question}
                  </label>

                  <textarea
                    id={`question-${question.id}`}
                    placeholder="Your answer..."
                    value={answers[question.id] || ""}
                    onChange={(event) =>
                      handleQuestionChange(
                        question.id,
                        event.target.value
                      )
                    }
                    rows="4"
                    required
                  />
                </div>
              ))}

            </div>
          )}

          <div className="application-submit">

            <p>
              Make sure your information is correct before submitting.
            </p>

            <button
              type="submit"
              className="application-submit-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
              {!submitting && <span>→</span>}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}

export default Application;


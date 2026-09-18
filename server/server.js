const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const JWT_SECRET = "society-hub-secret-key";
//Role-Based Access Control.
// Middleware to authenticate JWT token
// ("Is this person logged in with a valid JWT?")
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }
  next();
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("MySQL connected!");
});


// HOME
app.get("/", (req, res) => {
  res.send("Society Hub backend is running!");
});

// SOCIETIES
app.get("/api/societies", (req, res) => {
  db.query("SELECT * FROM societies", (err, results) => {
    if (err) {
      console.error("Database query failed:", err);

      return res.status(500).json({
        message: "Failed to fetch societies",
      });
    }

    res.json(results);
  });
});


app.get("/api/societies/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM societies WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Database query failed:", err);

        return res.status(500).json({
          message: "Failed to fetch society",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Society not found",
        });
      }

      res.json(results[0]);
    }
  );
});


// APPLICATIONS
app.post(
  "/api/applications",
  authenticateToken,
  async (req, res) => {
    const {
      reason,
      societyId,
      answers,
    } = req.body;

    // studentId = the ID of the currently logged-in student
    // taken from the JWT token.
    const studentId = req.user.id;

    // Checking if the application reason is empty
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Application reason is required",
      });
    }

    try {
      // Ask MySQL for the society's ID AND deadline.
      // societies will contain the rows returned by MySQL.
      const [societies] = await db.promise().query(
        `SELECT id, deadline
         FROM societies
         WHERE id = ?`,
        [societyId]
      );

      if (societies.length === 0) {
        return res.status(404).json({
          message: "Society not found",
        });
      }

      // society = the first matching society returned by MySQL.
      // It contains the society's id and deadline.
      const society = societies[0];

      // If a deadline exists and the current time is past it,
      // prevent the student from submitting the application.
      if (
        society.deadline &&
        new Date(society.deadline) < new Date()
      ) {
        return res.status(400).json({
          message:
            "Application for this society is closed. Deadline has passed.",
        });
      }

      // Get the currently logged-in student's details.
      const [students] = await db.promise().query(
        `SELECT name, rollNumber, email
         FROM students
         WHERE id = ?`,
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      // student = the first matching student returned by MySQL.
      // It contains the student's name, roll number and email.
      const student = students[0];

      // Check whether this student has already applied
      // to this particular society.
      const [existingApplications] = await db.promise().query(
        `SELECT id
         FROM applications
         WHERE studentId = ? AND societyId = ?`,
        [studentId, societyId]
      );

      if (existingApplications.length > 0) {
        return res.status(400).json({
          message: "Application already submitted for this society",
        });
      }

      // Insert the main application into the applications table.
      // result contains information returned by MySQL after the insert,
      // including the newly generated application ID.
      const [result] = await db.promise().query(
        `INSERT INTO applications
         (name, rollNumber, email, reason, societyId, studentId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          student.name,
          student.rollNumber,
          student.email,
          reason,
          societyId,
          studentId,
        ]
      );

      // applicationId = the ID of the application we just created.
      // This ID connects the custom answers to this application.
      const applicationId = result.insertId;

      // If the student answered custom questions,
      // save each answer in the application_answers table.
      if (Array.isArray(answers)) {
        for (const answer of answers) {
          // Skip an answer if there is no question ID.
          if (!answer.questionId) {
            continue;
          }

          await db.promise().query(
            `INSERT INTO application_answers
             (applicationId, questionId, answer)
             VALUES (?, ?, ?)`,
            [
              applicationId,
              answer.questionId,
              answer.answer || "",
            ]
          );
        }
      }

      res.status(201).json({
        message: "Application submitted successfully",
        applicationId: applicationId,
      });

    } catch (error) {
      console.error(
        "Application submission failed:",
        error
      );

      res.status(500).json({
        message: "Failed to submit application",
      });
    }
  }
);

// GET MY APPLICATIONS
app.get(
  "/api/applications/my",
  authenticateToken,
  (req, res) => {
    const studentId = req.user.id;

    const sql = `
      SELECT
        applications.id,
        applications.reason,
        applications.status,
        applications.createdAt,
        societies.name AS societyName,
        societies.category
      FROM applications
      JOIN societies
        ON applications.societyId = societies.id
      WHERE applications.studentId = ?
      ORDER BY applications.createdAt DESC
    `;

    db.query(
      sql,
      [studentId],
      (err, results) => {
        if (err) {
          console.error(
            "Failed to fetch applications:",
            err
          );

          return res.status(500).json({
            message: "Failed to fetch applications",
          });
        }

        res.json(results);
      }
    );
  }
);

app.get(
  "/api/admin/applications",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Find the society managed by the currently logged-in admin.
      // admins contains the rows returned by MySQL.
      const [admins] = await db.promise().query(
        `SELECT societyId
         FROM students
         WHERE id = ? AND role = 'admin'`,
        [req.user.id]
      );

      if (admins.length === 0 || admins[0].societyId == null) {
        return res.status(403).json({
          message: "Admin is not assigned to a society.",
        });
      }

      // societyId = the ID of the society managed by this admin.
      const societyId = admins[0].societyId;

      const [applications] = await db.promise().query(
        `SELECT
          applications.id,
          applications.name,
          applications.rollNumber,
          applications.email,
          applications.reason,
          applications.status,
          applications.createdAt,
          societies.name AS societyName,
          societies.category,
          societies.deadline
        FROM applications
        JOIN societies
          ON applications.societyId = societies.id
        WHERE applications.societyId = ?
        ORDER BY applications.createdAt DESC`,
        [societyId]
      );
      for (const application of applications) {
        const [answers] = await db.promise().query(
          `SELECT 
            application_questions.question,
            application_answers.answer
          FROM application_answers
          JOIN application_questions
            ON application_answers.questionId = application_questions.id
          WHERE application_answers.applicationId = ?
          ORDER BY application_questions.id ASC`,
          [application.id]
        );
        application.answers = answers;
      }
      // applications contains the application rows returned by MySQL
      // for this admin's society.
      res.json(applications);

    } catch (error) {
      console.error(
        "Failed to fetch admin applications:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch applications",
      });
    }
  }
);

app.put(
  "/api/admin/applications/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (
      status !== "Pending" &&
      status !== "Accepted" &&
      status !== "Rejected"
    ) {
      return res.status(400).json({
        message: "Invalid application status.",
      });
    }

    try {
      // Find which society this admin manages
      const [admins] = await db.promise().query(
        `SELECT societyId
         FROM students
         WHERE id = ? AND role = 'admin'`,
        [req.user.id]
      );

      if (admins.length === 0 || admins[0].societyId == null) {
        return res.status(403).json({
          message: "Admin is not assigned to a society.",
        });
      }

      const societyId = admins[0].societyId;

      // Update only if the application belongs to this society
      const [result] = await db.promise().query(
        `UPDATE applications
         SET status = ?
         WHERE id = ? AND societyId = ?`,
        [status, applicationId, societyId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Application not found for your society.",
        });
      }

      res.json({
        message: "Application status updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update application status:", error);

      res.status(500).json({
        message: "Failed to update application status",
      });
    }
  }
);

// GET CURRENT SOCIETY DEADLINE
app.get(
  "/api/admin/deadline",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Find which society this admin manages.
      // admins contains the rows returned by MySQL.
      const [admins] = await db.promise().query(
        `SELECT societyId
         FROM students
         WHERE id = ? AND role = 'admin'`,
        [req.user.id]
      );

      if (
        admins.length === 0 ||
        admins[0].societyId == null
      ) {
        return res.status(403).json({
          message: "Admin is not assigned to a society.",
        });
      }

      // societyId = the ID of the society managed by this admin.
      const societyId = admins[0].societyId;

      const [societies] = await db.promise().query(
        `SELECT deadline
         FROM societies
         WHERE id = ?`,
        [societyId]
      );

      if (societies.length === 0) {
        return res.status(404).json({
          message: "Society not found.",
        });
      }

      // society = the first matching society returned by MySQL.
      // It contains the current deadline for that society.
      const society = societies[0];

      res.json({
        deadline: society.deadline,
      });
    } catch (error) {
      console.error(
        "Failed to fetch deadline:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch deadline.",
      });
    }
  }
);

// UPDATE SOCIETY DEADLINE
app.put(
  "/api/admin/deadline",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { deadline } = req.body;

    // Check that the admin actually sent a deadline.
    if (!deadline) {
      return res.status(400).json({
        message: "Deadline is required",
      });
    }

    try {
      // Find which society this admin manages.
      // admins contains the rows returned by MySQL.
      const [admins] = await db.promise().query(
        `SELECT societyId
         FROM students
         WHERE id = ? AND role = 'admin'`,
        [req.user.id]
      );

      // If no admin was found, or the admin isn't assigned
      // to a society, they cannot change a deadline.
      if (
        admins.length === 0 ||
        admins[0].societyId == null
      ) {
        return res.status(403).json({
          message: "Admin is not assigned to a society.",
        });
      }

      // societyId = the ID of the society managed by this admin.
      const societyId = admins[0].societyId;

      // Update the deadline for that society in MySQL.
      const [result] = await db.promise().query(
        `UPDATE societies
         SET deadline = ?
         WHERE id = ?`,
        [deadline, societyId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Society not found.",
        });
      }

      res.json({
        message: "Deadline updated successfully.",
        deadline: deadline,
      });
    } catch (error) {
      console.error(
        "Failed to update deadline:",
        error
      );

      res.status(500).json({
        message: "Failed to update deadline.",
      });
    }
  }
);

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const {
    name,
    rollNumber,
    email,
    password,
  } = req.body;

  try {
    const [existingStudents] = await db.promise().query(
      `SELECT id
       FROM students
       WHERE email = ? OR rollNumber = ?`,
      [email, rollNumber]
    );

    if (existingStudents.length > 0) {
      return res.status(400).json({
        message: "Email or roll number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const [result] = await db.promise().query(
      `INSERT INTO students
       (name, rollNumber, email, password)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        rollNumber,
        email,
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Registration successful",
      studentId: result.insertId,
    });

  } catch (error) {
    console.error("Registration failed:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});


// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  try {
    const [students] = await db.promise().query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const student = students[0];

    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: student.id,
        role: student.role,
      },
      JWT_SECRET,

      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",

      token: token,

      user: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        role: student.role,
      },
    });

  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

app.post(
  "/api/admin/questions",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        message: "Question is required.",
      });
    }

    try {
      // Find which society this admin manages.
      // admins contains the rows returned by MySQL.
      const [admins] = await db.promise().query(
        `SELECT societyId
         FROM students
         WHERE id = ? AND role = 'admin'`,
        [req.user.id]
      );

      if (
        admins.length === 0 ||
        admins[0].societyId == null
      ) {
        return res.status(403).json({
          message: "Admin is not assigned to a society.",
        });
      }

      // societyId = the ID of the society managed by this admin.
      const societyId = admins[0].societyId;

      const [result] = await db.promise().query(
        `INSERT INTO application_questions
         (societyId, question)
         VALUES (?, ?)`,
        [societyId, question.trim()]
      );

      res.status(201).json({
        message: "Question added successfully.",
        questionId: result.insertId,
      });
    } catch (error) {
      console.error("Failed to add question:", error);

      res.status(500).json({
        message: "Failed to add question.",
      });
    }
  }
);

app.get(
  "/api/societies/:societyId/questions",
  authenticateToken,
  async (req, res) => {
    const { societyId } = req.params;

    try {
      // questions contains all questions returned by MySQL
      // for this particular society.
      const [questions] = await db.promise().query(
        `SELECT id, question, questionType
         FROM application_questions
         WHERE societyId = ?
         ORDER BY id ASC`,
        [societyId]
      );

      res.json(questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);

      res.status(500).json({
        message: "Failed to fetch application questions.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
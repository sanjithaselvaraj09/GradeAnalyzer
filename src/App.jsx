
import { useState } from "react";
import "./App.css";

function App() {
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [marks, setMarks] = useState({
    Tamil: "",
    Mathematics: "",
    English: "",
    "Computer Science": "",
    Science: "",
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const subjects = Object.keys(marks);

  // Update student marks
  const handleMarksChange = (subject, value) => {
    setMarks((previousMarks) => ({
      ...previousMarks,
      [subject]: value,
    }));
  };

  // Analyze student performance
  const analyzeGrades = async () => {
    setError("");
    setReport(null);

    if (!studentName.trim() || !rollNumber.trim()) {
      setError("Please enter student name and roll number.");
      return;
    }

    const numericMarks = {};

    for (const subject of subjects) {
      const value = marks[subject];

      if (value === "") {
        setError(`Please enter marks for ${subject}.`);
        return;
      }

      const mark = Number(value);

      if (!Number.isFinite(mark) || mark < 0 || mark > 100) {
        setError(`${subject} marks must be between 0 and 100.`);
        return;
      }

      numericMarks[subject] = mark;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_name: studentName.trim(),
            roll_number: rollNumber.trim(),
            marks: numericMarks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze grades.");
      }

      setReport(data);

    } catch (err) {
      setError(
        err.message || "Unable to connect to Python backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Header */}

      <header className="header">

        <div className="logo">🎓</div>

        <div>
          <h2>GradePilot</h2>
          <p>Student Academic Analytics</p>
        </div>

      </header>

      <main className="container">

        {/* Student Input Form */}

        <section className="main-card">

          <h1>Student Grade Analyzer</h1>

          <p className="description">
            Enter student information and marks to generate
            a performance report.
          </p>

          <h3>Student details</h3>

          <div className="input-grid">

            <div className="input-group">

              <label>Student name</label>

              <input
                type="text"
                placeholder="Enter student name"
                value={studentName}
                onChange={(e) =>
                  setStudentName(e.target.value)
                }
              />

            </div>

            <div className="input-group">

              <label>Roll number</label>

              <input
                type="text"
                placeholder="Enter roll number"
                value={rollNumber}
                onChange={(e) =>
                  setRollNumber(e.target.value)
                }
              />

            </div>

          </div>

          <h3 className="marks-heading">Subject marks</h3>

          <div className="input-grid">

            {subjects.map((subject) => (

              <div className="input-group" key={subject}>

                <label>{subject}</label>

                <div className="mark-field">

                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter marks"
                    value={marks[subject]}
                    onChange={(e) =>
                      handleMarksChange(
                        subject,
                        e.target.value
                      )
                    }
                  />

                  <span>/ 100</span>

                </div>

              </div>

            ))}

          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="analyze-btn"
            onClick={analyzeGrades}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Grades"}
          </button>

        </section>

        {/* Performance Summary */}

        {report && (

          <>

            <section className="stats-grid">

              <div className="stat-card">

                <label>Average score</label>

                <h2 className="blue">
                  {report.average}%
                </h2>

              </div>

              <div className="stat-card">

                <label>Grade</label>

                <h2 className="green">
                  {report.grade}
                </h2>

              </div>

              <div className="stat-card">

                <label>Total marks</label>

                <h2>
                  {report.total}/{report.maximum}
                </h2>

              </div>

              <div className="stat-card">

                <label>Result</label>

                <h2 className={
                  report.result === "PASS"
                    ? "green"
                    : "red"
                }>
                  {report.result}
                </h2>

              </div>

            </section>

            {/* Subject Performance Chart */}

            <section className="chart-card">

              <h3>Subject Performance</h3>

              <div className="chart-container">

                <div className="y-axis">

                  <span>100/100</span>
                  <span>75/100</span>
                  <span>50/100</span>
                  <span>25/100</span>
                  <span>0/100</span>

                </div>

                <div className="bars">

                  {Object.entries(report.marks).map(
                    ([subject, mark]) => (

                      <div
                        className="bar-item"
                        key={subject}
                      >

                        <div className="bar-area">

                          <div
                            className="bar"
                            style={{
                              height: `${mark}%`,
                            }}
                            title={`${subject}: ${mark}/100`}
                          />

                        </div>

                        <span className="bar-label">
                          {subject === "Mathematics"
                            ? "Maths"
                            : subject === "Computer Science"
                            ? "CS"
                            : subject}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </section>

            {/* Detailed Marks Table */}

            <section className="chart-card">

              <h3>Detailed Marks Report</h3>

              <div className="table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {Object.entries(report.marks).map(
                      ([subject, mark]) => (

                        <tr key={subject}>

                          <td>{subject}</td>

                          <td>{mark}/100</td>

                          <td>
                            <span className={
                              mark >= 35 ? "green" : "red"
                            }>
                              {mark >= 35 ? "Pass" : "Fail"}
                            </span>
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </>

        )}

        <footer>
          GradePilot • Student Academic Analytics
        </footer>

      </main>

    </div>
  );
}

export default App;

import { useState } from "react";
import Login from "./Login";
import Resource from "./Resource";
import { isLoggedIn, logout } from "./api";

const age = (dob) => {
  const d = new Date(dob), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
};

const CONFIG = {
  students: {
    path: "/students/", title: "Students", singular: "student",
    columns: [
      { key: "name", label: "Name" }, { key: "email", label: "Email" },
      { key: "age", label: "Age" }, { key: "date_of_birth", label: "Date of birth" },
    ],
    fields: [
      { name: "name", label: "Full name" },
      { name: "email", label: "Email", type: "email" },
      { name: "date_of_birth", label: "Date of birth", type: "date" },
      { name: "age", label: "Age", type: "number" },
    ],
    // Fill in age automatically when the date of birth changes
    derive: (v, changed) => (changed === "date_of_birth" && v.date_of_birth ? { ...v, age: age(v.date_of_birth) } : v),
  },
  courses: {
    path: "/courses/", title: "Courses", singular: "course",
    columns: [{ key: "code", label: "Code" }, { key: "name", label: "Name" }],
    fields: [{ name: "name", label: "Course name" }, { name: "code", label: "Course code" }],
  },
  enrollments: {
    path: "/enrollments/", title: "Enrollments", singular: "enrollment",
    columns: [
      { key: "student_name", label: "Student" }, { key: "course_name", label: "Course" },
      { key: "enrollment_date", label: "Enrolled on", fmt: (v) => new Date(v).toLocaleDateString() },
    ],
    fields: [
      { name: "student", label: "Student", options: { path: "/students/", label: (s) => `${s.name} (${s.email})` } },
      { name: "course", label: "Course", options: { path: "/courses/", label: (c) => `${c.name} (${c.code})` } },
    ],
  },
};

export default function App() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [tab, setTab] = useState("students");
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="shell">
      <nav>
        <h1>Registrar</h1>
        {Object.entries(CONFIG).map(([k, c]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{c.title}</button>
        ))}
        <button className="out" onClick={logout}>Sign out</button>
      </nav>
      <main><Resource key={tab} cfg={CONFIG[tab]} /></main>
    </div>
  );
}

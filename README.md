Aspirely is a full-stack career-advisor web app for Indian Class 11–12 students. It guides users through a branching, 12+ step quiz to suggest career paths, UG courses, top colleges (with NIRF ranks), and relevant entrance exams. Users can sign up, save results to a profile, and browse trending careers.

Features

🔐 Email/password auth with JWT

🧭 Branching career quiz powered by questions_trees_updated.json

🏫 Results include career path, UG course, 5 colleges + NIRF rank, exams

⭐ Profile with last quiz results (and history if enabled)

🔎 “Trending Careers” and clean, responsive UI (React + Tailwind)

Tech Stack

Frontend: React (Vite) + Tailwind

Backend APIs: FastAPI (run with Uvicorn)

auth_server.py → authentication

career_advisor_api.py → quiz & recommendations

DB: SQLite by default; switchable to MySQL

Auth: JWT (HS256)

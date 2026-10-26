# Data Mining · Spring 2027

Course website for **STAT 6440: Data Mining** (Bowling Green State University, Spring 2027). It includes the syllabus, a week-by-week schedule with official BGSU dates, deadlines with a calendar export, and **14 interactive lecture companion pages** with code in both **R and Python**.

## What's inside

| Page | What it does |
|---|---|
| `index.html` | Home: course facts, a "coming up" panel that updates from the calendar, lecture cards with per-student progress |
| `syllabus.html` | Outcomes, materials, grading, policies (late work, AI use, accessibility), printable |
| `schedule.html` | Week-by-week list + month calendar, current week highlighted, **.ics export** |
| `assignments.html` | Every graded item with release/due dates, weights, live status, project milestones |
| `resources.html` | R and Python setup, all datasets, R ↔ Python cheat sheet |
| `lectures/*.html` | 14 companion pages: concept map, predict-then-reveal questions, an interactive demo, R/Python code walk, pitfalls, self-check quiz |

Each lecture page stores progress (sections marked done, preferred language, theme) **only in the student's browser**. Nothing is collected.

## Editing

You never need a build step. It is plain HTML, CSS and JavaScript.

- **Instructor name, email, room, office hours, course number, textbook** → `assets/js/course-config.js` (every `[TBD]` on the site comes from here)
- **Class dates, assignments, due dates, grading weights** → `assets/js/schedule-data.js` (the schedule, deadline table, home panel and `.ics` file are all generated from it)
- **Lecture content** → `lectures/NN-*.html` (demos live in `assets/js/demos/wNN.js`)
- **Styling / colours** → `assets/css/site.css` (light and dark themes via CSS variables)

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<username>.github.io/<repo-name>/`.

## Data

`data/` contains the datasets from Shmueli et al., *Data Mining for Business Analytics* (Wiley), as distributed with the textbook's companion `dmba` package. They are for teaching use with the textbook.

## Third-party libraries (vendored in `assets/vendor/`)

- [highlight.js](https://highlightjs.org/) 11.9.0 (BSD-3-Clause)
- [KaTeX](https://katex.org/) 0.16.9 (MIT)
- Fonts: Inter, Source Serif 4, JetBrains Mono via Google Fonts (OFL)

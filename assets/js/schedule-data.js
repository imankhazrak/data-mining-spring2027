/* ==========================================================================
   SCHEDULE & DEADLINES — Spring 2027 (Tue/Thu meetings).
   Every calendar, deadline table and .ics export on the site is built from
   this file. Times are local (America/New_York). Due times default to 11:59 PM.
   type: class | exam | holiday | due | project | out
   ========================================================================== */
window.SCHEDULE = {
  sessions: [
    // ---- Week 1
    { date: "2027-01-12", type: "class", lec: 1,  title: "Course overview; the data-mining process" },
    { date: "2027-01-14", type: "class", lec: 1,  title: "Data exploration & visualization lab (R / Python setup)" },
    // ---- Week 2
    { date: "2027-01-19", type: "class", lec: 2,  title: "Multiple linear regression for prediction" },
    { date: "2027-01-21", type: "class", lec: 2,  title: "Dummy variables, interpretation, residual checks (lab)" },
    // ---- Week 3
    { date: "2027-01-26", type: "class", lec: 3,  title: "Partitioning data; overfitting" },
    { date: "2027-01-28", type: "class", lec: 3,  title: "RMSE, MAE, k-fold cross-validation, lift (lab)" },
    // ---- Week 4
    { date: "2027-02-02", type: "class", lec: 4,  title: "Logistic regression: odds and the logit" },
    { date: "2027-02-04", type: "class", lec: 4,  title: "Fitting, interpreting and predicting (lab)" },
    // ---- Week 5
    { date: "2027-02-09", type: "class", lec: 5,  title: "Confusion matrix, cutoffs, sensitivity & specificity" },
    { date: "2027-02-11", type: "class", lec: 5,  title: "ROC/AUC, lift and gains charts (lab)" },
    // ---- Week 6
    { date: "2027-02-16", type: "class", lec: 6,  title: "Variable selection & regularization" },
    { date: "2027-02-18", type: "class", lec: 7,  title: "Principal component analysis" },
    // ---- Week 7
    { date: "2027-02-23", type: "class", lec: null, title: "Midterm 1 review (Lectures 1–7)" },
    { date: "2027-02-25", type: "exam",  lec: null, title: "Midterm Exam 1 — in class (Lectures 1–7)" },
    // ---- Spring break
    { date: "2027-03-02", type: "holiday", lec: null, title: "Spring break — no class" },
    { date: "2027-03-04", type: "holiday", lec: null, title: "Spring break — no class" },
    // ---- Week 8
    { date: "2027-03-09", type: "class", lec: 8,  title: "k-nearest neighbors: distance and scaling" },
    { date: "2027-03-11", type: "class", lec: 8,  title: "Choosing k by cross-validation (lab)" },
    // ---- Week 9
    { date: "2027-03-16", type: "class", lec: 9,  title: "Classification & regression trees" },
    { date: "2027-03-18", type: "class", lec: 9,  title: "Pruning and cost-complexity (lab)" },
    // ---- Week 10
    { date: "2027-03-23", type: "class", lec: 10, title: "Neural networks: architecture & backpropagation" },
    { date: "2027-03-25", type: "class", lec: 10, title: "Tuning size and decay (lab)" },
    // ---- Week 11
    { date: "2027-03-30", type: "class", lec: 11, title: "Bagging & random forests" },
    { date: "2027-04-01", type: "class", lec: 11, title: "Boosting; variable importance (lab)" },
    // ---- Week 12
    { date: "2027-04-06", type: "class", lec: 12, title: "Rare events: oversampling, costs and cutoffs" },
    { date: "2027-04-08", type: "class", lec: 13, title: "Cluster analysis I: distances & hierarchical clustering" },
    // ---- Week 13
    { date: "2027-04-13", type: "class", lec: 13, title: "Cluster analysis II: k-means and validation (lab)" },
    { date: "2027-04-15", type: "class", lec: 14, title: "Association rules & collaborative filtering" },
    // ---- Week 14
    { date: "2027-04-20", type: "exam",  lec: null, title: "Midterm Exam 2 — in class (Lectures 8–14)" },
    { date: "2027-04-22", type: "project", lec: null, title: "Project presentations — Session I" },
    // ---- Finals week
    { date: "2027-04-27", type: "project", lec: null, title: "Project presentations — Session II (scheduled final-exam slot, time TBD)" }
  ],

  /* Graded work. `out` = release date, `due` = deadline (11:59 PM unless noted). */
  assignments: [
    { id: "HW1", kind: "Homework", title: "Exploration, regression & partitioning", covers: "Lectures 1–3", out: "2027-01-14", due: "2027-01-29", points: 5 },
    { id: "HW2", kind: "Homework", title: "Logistic regression & classifier evaluation", covers: "Lectures 4–5", out: "2027-02-04", due: "2027-02-12", points: 5 },
    { id: "HW3", kind: "Homework", title: "Variable selection, regularization & PCA", covers: "Lectures 6–7", out: "2027-02-16", due: "2027-02-21", points: 5 },
    { id: "HW4", kind: "Homework", title: "kNN, trees & neural networks", covers: "Lectures 8–10", out: "2027-03-11", due: "2027-03-26", points: 5 },
    { id: "HW5", kind: "Homework", title: "Ensembles, rare events & clustering", covers: "Lectures 11–13", out: "2027-04-01", due: "2027-04-16", points: 5 },

    { id: "PQ",  kind: "Practice quizzes", title: "Weekly practice quizzes on Canvas (12; lowest 2 dropped)", covers: "Each lecture week", out: "2027-01-14", due: "2027-04-18", points: 10, recurring: "Open Thursday after class · due Sunday 11:59 PM" },

    { id: "MT1", kind: "Exam", title: "Midterm Exam 1", covers: "Lectures 1–7", due: "2027-02-25", time: "In class", points: 20 },
    { id: "MT2", kind: "Exam", title: "Midterm Exam 2", covers: "Lectures 8–14", due: "2027-04-20", time: "In class", points: 20 },

    { id: "P0", kind: "Project", title: "Team formation (3–4 students) & dataset idea", covers: "Project", due: "2027-01-31", points: 0 },
    { id: "P1", kind: "Project", title: "Project proposal (2 pages)", covers: "Project", due: "2027-02-19", points: 3 },
    { id: "P2", kind: "Project", title: "Progress report: EDA + baseline model", covers: "Project", due: "2027-04-02", points: 4 },
    { id: "P3", kind: "Project", title: "Final presentation (12 min + Q&A)", covers: "Project", due: "2027-04-22", time: "In class / final-exam slot", points: 6 },
    { id: "P4", kind: "Project", title: "Final report + reproducible code", covers: "Project", due: "2027-04-28", points: 10 },
    { id: "P5", kind: "Project", title: "Peer evaluation", covers: "Project", due: "2027-04-28", points: 2 }
  ],

  grading: [
    { item: "Homework (5 × 5%)", weight: 25 },
    { item: "Weekly practice quizzes (12, lowest 2 dropped)", weight: 10 },
    { item: "Midterm Exam 1", weight: 20 },
    { item: "Midterm Exam 2", weight: 20 },
    { item: "Team project (proposal 3, progress 4, presentation 6, report 10, peer eval 2)", weight: 25 }
  ],

  scale: [
    { grade: "A", range: "90 – 100" },
    { grade: "B", range: "80 – 89.99" },
    { grade: "C", range: "70 – 79.99" },
    { grade: "D", range: "60 – 69.99" },
    { grade: "F", range: "below 60" }
  ]
};

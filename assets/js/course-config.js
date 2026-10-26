/* ==========================================================================
   COURSE CONFIGURATION — edit this one file to update every page.
   Anything shown as [TBD] on the site comes from here.
   ========================================================================== */
window.COURSE = {
  code: "STAT 6440",                 // e.g. "STAT 6440 / CS 6440"
  title: "Data Mining",
  term: "Spring 2027",
  university: "Bowling Green State University",
  department: "[Department — TBD]",
  credits: "3 credit hours",
  format: "In person, with interactive companion pages for every lecture",

  instructor: {
    name: "[Instructor Name — TBD]",
    title: "[Title — TBD]",
    email: "[email@bgsu.edu — TBD]",
    office: "[Building & room — TBD]",
    officeHours: "[Days & times — TBD], or by appointment",
    website: "#"
  },
  ta: {
    name: "[TA Name — TBD]",
    email: "[ta-email@bgsu.edu — TBD]",
    officeHours: "[TBD]"
  },
  meeting: {
    days: "Tuesday & Thursday",       // the schedule below assumes Tue/Thu
    time: "[Time — TBD]",
    room: "[Building & room — TBD]"
  },
  lms: { name: "Canvas", url: "#" },  // link to the Canvas shell
  repo: "#",                          // link to the GitHub repo
  dataBase: "../data/",               // where lecture pages find the CSVs

  textbook: {
    main: "Shmueli, G., Bruce, P. C., Yahav, I., Patel, N. R., & Lichtendahl, K. C. Jr. (2018). <em>Data Mining for Business Analytics: Concepts, Techniques, and Applications in R</em>. Wiley.",
    python: "Shmueli, G., Bruce, P. C., Gedeck, P., & Patel, N. R. (2020). <em>Data Mining for Business Analytics: Concepts, Techniques and Applications in Python</em>. Wiley.",
    optional: "James, G., Witten, D., Hastie, T., Tibshirani, R., & Taylor, J. (2023). <em>An Introduction to Statistical Learning</em> (free PDF at statlearning.com)."
  },

  /* Official BGSU Spring 2027 dates (15-week session). Source:
     bgsu.edu/registration-records/academic-calendars/spring-academic-calendar */
  keyDates: [
    { date: "2027-01-11", label: "Classes begin" },
    { date: "2027-01-17", label: "Last day to add without college permission" },
    { date: "2027-01-18", label: "Martin Luther King Jr. Day — no classes" },
    { date: "2027-01-24", label: "Last day to drop without a W (undergraduate)" },
    { date: "2027-01-25", label: "Census date — drops from now on receive a W" },
    { date: "2027-03-01", label: "Spring break begins (Mar 1–5, no classes)" },
    { date: "2027-04-02", label: "Last day to drop with college permission (undergraduate)" },
    { date: "2027-04-23", label: "Last day of classes" },
    { date: "2027-04-26", label: "Final exam week (Apr 26–30)" }
  ],

  /* Lectures. `file` lives in /lectures. Module colours are set in CSS. */
  modules: [
    { id: "A", name: "Foundations" },
    { id: "B", name: "Classification" },
    { id: "C", name: "Dimension Reduction" },
    { id: "D", name: "Flexible Predictive Models" },
    { id: "E", name: "Imbalance & Unsupervised Learning" }
  ],
  lectures: [
    { n: 1,  module: "A", file: "01-introduction.html",          title: "Introduction & Data Exploration", blurb: "The data-mining process, supervised vs. unsupervised, data types, and visual exploration.", data: "WestRoxbury" },
    { n: 2,  module: "A", file: "02-linear-regression.html",     title: "Linear Regression for Prediction", blurb: "Least squares, dummies, interpretation, and why prediction ≠ explanation.", data: "ToyotaCorolla" },
    { n: 3,  module: "A", file: "03-partitioning-performance.html", title: "Partitioning & Predictive Performance", blurb: "Train/validation/test, overfitting, RMSE/MAE, cross-validation, lift.", data: "ToyotaCorolla" },
    { n: 4,  module: "B", file: "04-logistic-regression.html",   title: "Logistic Regression", blurb: "Odds, logit, maximum likelihood, and turning probabilities into classes.", data: "UniversalBank" },
    { n: 5,  module: "B", file: "05-classification-performance.html", title: "Evaluating Classifiers", blurb: "Confusion matrix, cutoffs, sensitivity/specificity, ROC/AUC, lift and gains.", data: "UniversalBank" },
    { n: 6,  module: "C", file: "06-variable-selection.html",    title: "Variable Selection & Regularization", blurb: "Stepwise search, ridge, lasso, elastic net, and choosing λ by CV.", data: "ToyotaCorolla" },
    { n: 7,  module: "C", file: "07-pca.html",                   title: "Principal Component Analysis", blurb: "Variance, rotation, scaling, scree plots, and PCA as a preprocessing step.", data: "Cereals" },
    { n: 8,  module: "D", file: "08-knn.html",                   title: "k-Nearest Neighbors", blurb: "Distance, scaling, choosing k, and the bias–variance trade-off made visible.", data: "RidingMowers" },
    { n: 9,  module: "D", file: "09-decision-trees.html",        title: "Classification & Regression Trees", blurb: "Recursive partitioning, impurity, pruning, and readable rules.", data: "UniversalBank" },
    { n: 10, module: "D", file: "10-neural-networks.html",       title: "Neural Networks", blurb: "Neurons, activations, backpropagation, and tuning size and decay.", data: "TinyData" },
    { n: 11, module: "D", file: "11-ensembles.html",             title: "Ensembles: Bagging, Random Forests & Boosting", blurb: "Many weak or unstable models, one strong prediction.", data: "UniversalBank" },
    { n: 12, module: "E", file: "12-rare-events.html",           title: "Rare Events & Imbalanced Data", blurb: "The accuracy trap, oversampling, cutoffs, and misclassification costs.", data: "UniversalBank" },
    { n: 13, module: "E", file: "13-clustering.html",            title: "Cluster Analysis", blurb: "Distances, hierarchical clustering, k-means, and judging a clustering.", data: "Utilities" },
    { n: 14, module: "E", file: "14-affinity-analysis.html",     title: "Association Rules & Collaborative Filtering", blurb: "Support, confidence, lift, Apriori, and recommender systems.", data: "Faceplate" }
  ]
};

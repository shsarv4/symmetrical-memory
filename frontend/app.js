// ✧⁺₊⋆✦ DATA PATH - Enhanced Feminine Aesthetic ✦⋆₊⁺✧
console.log('✅ app.js loaded - defining global functions');

// ══════════════════════════════════════
// FIREBASE CONFIG
// ══════════════════════════════════════
// IMPORTANT: Replace this config with your own Firebase project credentials!
// Get your config from Firebase Console: https://console.firebase.google.com/
// Steps: Create project → Enable Authentication (Email/Password) → Get config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = window.firebaseConfig;

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('❌ Global error caught:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

// Validate Firebase config
if (!firebaseConfig) {
  console.error('❌ Firebase configuration not loaded!');
  window.firebaseConfigError = 'Configuration missing. Backend may not be running or config.json is invalid.';
} else if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('❌ Firebase configuration incomplete!', firebaseConfig);
  window.firebaseConfigError = 'Firebase configuration is incomplete. Please check config.json.';
}

// Initialize Firebase (Authentication only - Firestore accessed via backend)
let auth = null;
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    // Configure persistence for offline support
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);
    console.log('✅ Firebase Auth initialized');
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    window.firebaseConfigError = 'Firebase failed to initialize. Check console for details.';
  }
} else {
  console.warn('Firebase SDK not loaded. Firebase features disabled.');
  window.firebaseConfigError = 'Firebase SDK not available.';
}

// ══════════════════════════════════════
// BACKEND API CLIENT
// ══════════════════════════════════════
const API_BASE_URL = window.API_BASE_URL !== undefined ? window.API_BASE_URL : 'http://localhost:3000'; // Backend URL (loaded from config)

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return token;
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  console.log(`🌐 API Request: ${method} ${endpoint}`);
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No auth token available');
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers,
    credentials: 'include'
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('  Request URL:', url);

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    console.log('  Response status:', response.status);
    console.log('  Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

// Backend API wrappers
async function loadProgressFromBackend() {
  try {
    const data = await apiRequest('/api/progress', 'GET');
    return data.progress || {};
  } catch (error) {
    console.error('Failed to load progress from backend:', error);
    return {};
  }
}

async function saveProgressToBackend() {
  if (!CFG?.uid) return;

  // Extract only progress-related keys (t_, s_, e_, notes_)
  const progress = {};
  Object.keys(STATE).forEach(key => {
    if (key.startsWith('t_') || key.startsWith('s_') || key.startsWith('e_') || key.startsWith('notes_')) {
      progress[key] = STATE[key];
    }
  });

  try {
    await apiRequest('/api/progress', 'POST', { progress });
    console.log('✅ Progress saved to backend');
    return true;
  } catch (error) {
    console.error('Failed to save progress to backend:', error);
    return false;
  }
}

// ══════════════════════════════════════
// EMBEDDED COURSE DATA (default)
// ══════════════════════════════════════
const DEFAULT_COURSE = {
  "meta": {
    "subtitle_t": "Hi Swati, We are Happy to see you here. presenting you :",
    "title": "SwatiARC: Your Personal Growth Tracker",
    "subtitle": "Aaj aap kya study krni chahengi ?",
    "version": "1.0"
  },
  "modules": [
    {
      "id": "m1",
      "title": "Python Programming",
      "subtitle": "Basics → OOP → File Handling",
      "icon": "🐍",
      "accent": "#b8a0ff",
      "topics": [
        {
          "id": "m1t1", "title": "Python Fundamentals",
          "subtopics": ["Variables & Data Types","Control Flow (if/for/while)","Functions & Scope","List Comprehensions","Lambda & Map/Filter"]
        },
        {
          "id": "m1t2", "title": "Data Structures",
          "subtopics": ["Lists, Tuples, Sets","Dictionaries & Nested Structures","Stacks & Queues","Collections Module (Counter, defaultdict, deque)"]
        },
        {
          "id": "m1t3", "title": "Object-Oriented Programming",
          "subtopics": ["Classes & Objects","Inheritance & Polymorphism","Dunder Methods","Decorators & Property","Modules & Packages"]
        },
        {
          "id": "m1t4", "title": "File Handling & APIs",
          "subtopics": ["Reading/Writing Files (csv, txt, json)","Exception Handling","Regular Expressions","Working with APIs (requests)","Virtual Environments & pip"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"Python Full Course — freeCodeCamp (4h30m)","url":"https://www.youtube.com/watch?v=rfscVS0vtbw"},
        {"type":"video","label":"OOP Deep Dive","title":"OOP in Python — Corey Schafer","url":"https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeqVm"},
        {"type":"docs","label":"Official Reference","title":"Python 3 Docs","url":"https://docs.python.org/3/"},
        {"type":"practice","label":"Interactive","title":"Python.org Beginner's Guide","url":"https://wiki.python.org/moin/BeginnersGuide"},
        {"type":"collab","label":"Colab Notebook","title":"Python Basics — Jupyter Notebook (Kaggle)","url":"https://www.kaggle.com/code/sixteenpython/machine-learning-with-iris-dataset"}
      ],
      "exercises": [
        {"title":"HackerRank Python Domain","url":"https://www.hackerrank.com/domains/python","desc":"30 Days of Code + Python-specific tracks. Start with Easy → Medium. Target: complete all Easy + 50% Medium before Module 2."},
        {"title":"Exercism Python Track","url":"https://exercism.org/tracks/python","desc":"85 exercises with mentored feedback. Especially good for clean code habits."},
        {"title":"LeetCode Easy (Python)","url":"https://leetcode.com/problemset/?difficulty=EASY&page=1&topicSlugs=array","desc":"Solve 20 Easy array/string problems in Python for interview-level fluency."}
      ]
    },
    {
      "id": "m2",
      "title": "NumPy",
      "subtitle": "Numerical Computing · Beginner → Advanced",
      "icon": "🔢",
      "accent": "#a5f3fc",
      "topics": [
        {
          "id": "m2t1","title":"Array Fundamentals",
          "subtopics": ["ndarray creation (zeros, ones, arange, linspace)","Shape, reshape, flatten","Data types & memory layout","Indexing & Slicing (1D, 2D, 3D)","Boolean Indexing & Fancy Indexing"]
        },
        {
          "id": "m2t2","title":"Operations & Math",
          "subtopics": ["Universal Functions (ufuncs)","Broadcasting Rules","Vectorization vs Loops","Linear Algebra (dot, matmul, linalg)","Statistical Functions (mean, std, percentile)"]
        },
        {
          "id": "m2t3","title":"Advanced NumPy",
          "subtopics": ["Structured Arrays","Memory Views & Strides","np.einsum","Random Module (distributions, seeds)","Performance Optimization tips"]
        }
      ],
      "resources": [
        {"type":"collab","label":"Full Tutorial Notebook","title":"NumPy Complete Tutorial — Nicolas Rougier (GitHub)","url":"https://github.com/rougier/numpy-tutorial"},
        {"type":"collab","label":"Practice Notebook","title":"100 NumPy Exercises (Colab-ready)","url":"https://github.com/rougier/numpy-100"},
        {"type":"video","label":"Primary Video","title":"NumPy Full Course — Keith Galli (2h)","url":"https://www.youtube.com/watch?v=GB9ByFAIAH4"},
        {"type":"video","label":"Broadcasting Deep Dive","title":"NumPy Broadcasting Explained — sentdex","url":"https://www.youtube.com/watch?v=oL1DjH2aTBo"},
        {"type":"docs","label":"Official Docs","title":"NumPy Official Documentation","url":"https://numpy.org/doc/stable/"},
        {"type":"mcq","label":"MCQ Practice","title":"NumPy MCQs — Sanfoundry (300+ questions)","url":"https://www.sanfoundry.com/python-questions-answers-numpy/"},
        {"type":"mcq","label":"Quiz","title":"NumPy Quiz — w3resource","url":"https://www.w3resource.com/python-exercises/numpy/index.php"}
      ],
      "exercises": [
        {"title":"100 NumPy Exercises","url":"https://github.com/rougier/numpy-100","desc":"The definitive NumPy practice set. Start from Q1, don't skip. Aim to solve without hints first, then check."},
        {"title":"HackerRank NumPy Section","url":"https://www.hackerrank.com/domains/python?filters%5Bsubdomains%5D%5B%5D=numpy","desc":"Official HackerRank NumPy challenges — well-structured and graded."}
      ]
    },
    {
      "id": "m3",
      "title": "Pandas",
      "subtitle": "Data Manipulation · Beginner → Advanced",
      "icon": "🐼",
      "accent": "#86efac",
      "topics": [
        {
          "id": "m3t1","title":"Series & DataFrame Basics",
          "subtopics": ["Creating Series & DataFrames","Reading CSV, Excel, JSON, SQL","Inspecting data (head, info, describe, dtypes)","Indexing (.loc, .iloc, chained indexing)","Filtering & Boolean Masking"]
        },
        {
          "id": "m3t2","title":"Data Cleaning & Transformation",
          "subtopics": ["Handling Missing Values (fillna, dropna, interpolate)","Duplicate Detection & Removal","String Operations (.str methods)","Apply, Map, Applymap","Type Casting & Conversions"]
        },
        {
          "id": "m3t3","title":"Aggregation & Reshaping",
          "subtopics": ["GroupBy mechanics (split-apply-combine)","Pivot Tables & Crosstabs","Merge, Join, Concat","Melt & Stack/Unstack","Window Functions (rolling, expanding, ewm)"]
        },
        {
          "id": "m3t4","title":"Advanced Pandas",
          "subtopics": ["MultiIndex & Hierarchical Data","Time Series with DatetimeIndex","Categorical Dtype optimization","Memory optimization (chunking, dtypes)","Pandas + SQL (read_sql, to_sql)"]
        }
      ],
      "resources": [
        {"type":"collab","label":"Full Tutorial Notebook","title":"Pandas Complete Tutorial — Kaggle Learn","url":"https://www.kaggle.com/learn/pandas"},
        {"type":"collab","label":"Practice Notebook","title":"Pandas Exercises — guipsamora (GitHub)","url":"https://github.com/guipsamora/pandas_exercises"},
        {"type":"video","label":"Primary Video","title":"Pandas Full Course — Keith Galli (3h40m)","url":"https://www.youtube.com/watch?v=vmEHCJofslg"},
        {"type":"video","label":"Advanced Pandas","title":"Pandas Tips & Tricks — Corey Schafer","url":"https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS"},
        {"type":"docs","label":"Official Docs","title":"Pandas Documentation","url":"https://pandas.pydata.org/docs/"},
        {"type":"mcq","label":"MCQ Practice","title":"Pandas MCQs — Sanfoundry (200+ questions)","url":"https://www.sanfoundry.com/python-questions-answers-pandas/"},
        {"type":"mcq","label":"Quiz","title":"Pandas Quiz — w3resource (exercises with solutions)","url":"https://www.w3resource.com/python-exercises/pandas/index.php"}
      ],
      "exercises": [
        {"title":"Pandas Exercises — GitHub","url":"https://github.com/guipsamora/pandas_exercises","desc":"Best real-world Pandas exercise set. Covers all topics. Each exercise uses a real dataset. Complete at least 5 datasets fully."},
        {"title":"Kaggle Pandas Course","url":"https://www.kaggle.com/learn/pandas","desc":"6 micro-exercises with instant feedback. Great for hands-on reinforcement."},
        {"title":"Real Dataset Challenge: Titanic","url":"https://www.kaggle.com/c/titanic/data","desc":"Load Titanic dataset, do full data cleaning + GroupBy analysis. Classic benchmark project."}
      ]
    },
    {
      "id": "m4",
      "title": "Data Visualization",
      "subtitle": "Matplotlib · Seaborn · Plotly",
      "icon": "📊",
      "accent": "#f9a8d4",
      "topics": [
        {
          "id": "m4t1","title":"Matplotlib Foundations",
          "subtopics": ["Figure & Axes architecture","Line, Bar, Scatter, Histogram","Subplots & GridSpec","Custom styles, colors, annotations","Saving figures (savefig, DPI, formats)"]
        },
        {
          "id": "m4t2","title":"Seaborn — Statistical Plots",
          "subtopics": ["Distribution plots (histplot, kdeplot, ecdfplot)","Categorical plots (boxplot, violinplot, swarmplot)","Relational plots (scatterplot, lineplot)","Matrix plots (heatmap, clustermap)","FacetGrid & PairGrid"]
        },
        {
          "id": "m4t3","title":"Plotly — Interactive Visuals",
          "subtopics": ["Plotly Express quickstart","Plotly Graph Objects (full control)","Interactive dashboards basics","Choropleth & Geo maps","Exporting interactive HTML charts"]
        },
        {
          "id": "m4t4","title":"Visualization Best Practices",
          "subtopics": ["Choosing the right chart type","Color theory for data viz","Accessibility (colorblind-safe palettes)","Storytelling with data","Publication-quality figures"]
        }
      ],
      "resources": [
        {"type":"collab","label":"Full Tutorial Notebook","title":"Data Visualization with Python — Jovian (Colab)","url":"https://jovian.com/aakashns/python-matplotlib-data-visualization"},
        {"type":"collab","label":"Seaborn Practice","title":"Seaborn Tutorial — Kaggle Learn","url":"https://www.kaggle.com/learn/data-visualization"},
        {"type":"video","label":"Primary Video","title":"Matplotlib Full Tutorial — Corey Schafer (Playlist)","url":"https://www.youtube.com/playlist?list=PL-osiE80TeTvipOqomVEeZ1HRrcEvtZB_"},
        {"type":"video","label":"Seaborn Deep Dive","title":"Seaborn Complete Guide — freeCodeCamp","url":"https://www.youtube.com/watch?v=6GUZXDef2U0"},
        {"type":"video","label":"Plotly","title":"Plotly Crash Course — Charming Data","url":"https://www.youtube.com/watch?v=GGL6U0k8WYA"},
        {"type":"docs","label":"Gallery","title":"Seaborn Example Gallery","url":"https://seaborn.pydata.org/examples/index.html"},
        {"type":"mcq","label":"Quiz","title":"Matplotlib MCQs — Sanfoundry","url":"https://www.sanfoundry.com/matplotlib-mcq/"}
      ],
      "exercises": [
        {"title":"Kaggle Data Visualization Course","url":"https://www.kaggle.com/learn/data-visualization","desc":"Hands-on exercises using real datasets. Complete all 7 exercises including the final project."},
        {"title":"Recreate 5 Charts from Scratch","url":"https://www.data-to-viz.com/","desc":"Pick 5 chart types from data-to-viz.com, find a dataset, and recreate each. Builds real fluency."}
      ]
    },
    {
      "id": "m5",
      "title": "Exploratory Data Analysis",
      "subtitle": "Full EDA Pipeline · Real Datasets",
      "icon": "🔍",
      "accent": "#fef3c7",
      "topics": [
        {
          "id": "m5t1","title":"Understanding Your Data",
          "subtopics": ["Data types & schema inspection","Missing value analysis & patterns","Outlier detection (IQR, Z-score, isolation forest)","Duplicate analysis","Class imbalance detection"]
        },
        {
          "id": "m5t2","title":"Univariate & Bivariate Analysis",
          "subtopics": ["Distribution analysis (skewness, kurtosis)","Categorical frequency analysis","Correlation matrices (Pearson, Spearman, Kendall)","Scatter plots & pair plots","Cross-tabulation analysis"]
        },
        {
          "id": "m5t3","title":"Automated EDA Tools",
          "subtopics": ["Pandas Profiling / ydata-profiling","SweetViz reports","D-Tale interactive EDA","Lux auto-visualization","AutoViz"]
        },
        {
          "id": "m5t4","title":"EDA Projects",
          "subtopics": ["Full EDA: Titanic dataset","Full EDA: Netflix dataset","Full EDA: COVID-19 dataset","Full EDA: custom dataset (user's choice)","Writing EDA reports & storytelling"]
        }
      ],
      "resources": [
        {"type":"collab","label":"EDA Notebook Template","title":"EDA Template — Kaggle (Ames Housing)","url":"https://www.kaggle.com/code/pmarcelino/comprehensive-data-exploration-with-python"},
        {"type":"video","label":"EDA Full Guide","title":"Exploratory Data Analysis in Python — freeCodeCamp","url":"https://www.youtube.com/watch?v=xi0vhXFPegw"},
        {"type":"docs","label":"Tool","title":"ydata-profiling (automated EDA)","url":"https://github.com/ydataai/ydata-profiling"},
        {"type":"collab","label":"Practice Dataset","title":"Kaggle Datasets for EDA Practice","url":"https://www.kaggle.com/datasets?tags=13302-EDA"}
      ],
      "exercises": [
        {"title":"Kaggle Titanic EDA","url":"https://www.kaggle.com/c/titanic","desc":"Full pipeline: load → inspect → clean → visualize → summarize findings. Write a markdown report."},
        {"title":"Netflix Dataset EDA","url":"https://www.kaggle.com/datasets/shivamb/netflix-shows","desc":"Explore trends in content, genre distributions, country analysis. Build 10+ visualizations."},
        {"title":"Custom Dataset EDA","url":"https://www.kaggle.com/datasets","desc":"Pick any dataset relevant to your interest. Complete EDA notebook + written summary."}
      ]
    },
    {
      "id": "m6",
      "title": "APIs & Streamlit",
      "subtitle": "REST APIs · Web Apps · Deployment",
      "icon": "🚀",
      "accent": "#b8a0ff",
      "topics": [
        {
          "id": "m6t1","title":"Working with APIs",
          "subtopics": ["HTTP methods (GET, POST, PUT, DELETE)","Requests library deep dive","Authentication (API keys, OAuth, JWT)","Parsing JSON responses","Rate limiting & pagination"]
        },
        {
          "id": "m6t2","title":"Building with Flask (basics)",
          "subtopics": ["Flask routing & templates","REST API endpoints","Request/Response objects","Error handling","Deploying Flask to Render/Railway"]
        },
        {
          "id": "m6t3","title":"Streamlit — Data Apps",
          "subtopics": ["Streamlit fundamentals (widgets, layout)","Displaying DataFrames & charts","Session state & interactivity","Connecting to data sources","Deploying to Streamlit Cloud (free)"]
        }
      ],
      "resources": [
        {"type":"video","label":"Streamlit Primary","title":"Streamlit Full Course — Patrick Loeber","url":"https://www.youtube.com/watch?v=VqgUkExPvLY"},
        {"type":"video","label":"APIs in Python","title":"APIs for Beginners — freeCodeCamp","url":"https://www.youtube.com/watch?v=GZvSYJDk-us"},
        {"type":"docs","label":"Official Docs","title":"Streamlit Documentation","url":"https://docs.streamlit.io/"},
        {"type":"collab","label":"Gallery","title":"Streamlit App Gallery (inspiration)","url":"https://streamlit.io/gallery"}
      ],
      "exercises": [
        {"title":"Build a Data Dashboard","url":"https://docs.streamlit.io/library/get-started","desc":"Build a Streamlit app that loads a CSV, shows EDA summary, and has interactive filters. Deploy to Streamlit Cloud."},
        {"title":"Call a Public API","url":"https://github.com/public-apis/public-apis","desc":"Pick any public API (weather, movies, finance), fetch data, analyze it, and display in Streamlit."}
      ]
    },
    {
      "id": "m7",
      "title": "SQL & Databases",
      "subtitle": "PostgreSQL · MySQL · Advanced Queries",
      "icon": "🗄️",
      "accent": "#a5f3fc",
      "topics": [
        {
          "id": "m7t1","title":"SQL Fundamentals",
          "subtopics": ["SELECT, WHERE, ORDER BY, LIMIT","Aggregate Functions (COUNT, SUM, AVG, MAX, MIN)","GROUP BY & HAVING","JOINs (INNER, LEFT, RIGHT, FULL, CROSS)","Subqueries & Nested Queries"]
        },
        {
          "id": "m7t2","title":"Intermediate SQL",
          "subtopics": ["Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD)","CTEs (Common Table Expressions)","Views & Materialized Views","Indexes & Query Optimization","EXPLAIN & Query Analysis"]
        },
        {
          "id": "m7t3","title":"Advanced SQL & Python",
          "subtopics": ["Stored Procedures & Triggers","Transactions (ACID properties)","PostgreSQL-specific features","SQLAlchemy ORM","Pandas + SQL (read_sql, to_sql)","Database design & normalization"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"SQL Full Course — freeCodeCamp (4h20m)","url":"https://www.youtube.com/watch?v=HXV3zeQKqGY"},
        {"type":"video","label":"Advanced SQL","title":"Advanced SQL — Mode Analytics Tutorial","url":"https://mode.com/sql-tutorial/"},
        {"type":"practice","label":"Interactive Practice","title":"SQLZoo — Beginner to Advanced Interactive","url":"https://sqlzoo.net/"},
        {"type":"practice","label":"Real SQL Challenges","title":"LeetCode SQL Problems (Easy → Hard)","url":"https://leetcode.com/problemset/?topicSlugs=database"},
        {"type":"docs","label":"PostgreSQL Docs","title":"PostgreSQL Official Documentation","url":"https://www.postgresql.org/docs/"},
        {"type":"mcq","label":"MCQs","title":"SQL MCQ — Sanfoundry (500+ questions)","url":"https://www.sanfoundry.com/sql-questions-answers/"}
      ],
      "exercises": [
        {"title":"LeetCode SQL Track","url":"https://leetcode.com/problemset/?topicSlugs=database","desc":"Complete all Easy SQL problems, then 50% Medium. These are the exact questions asked in data analyst interviews."},
        {"title":"SQLZoo Full Track","url":"https://sqlzoo.net/","desc":"Interactive exercises using real databases. Complete SELECT basics through Self JOIN."},
        {"title":"Mode Analytics SQL Tutorial","url":"https://mode.com/sql-tutorial/","desc":"Best advanced SQL resource. Covers Window Functions deeply with real datasets."}
      ]
    },
    {
      "id": "m8",
      "title": "Power BI & Tableau",
      "subtitle": "Business Intelligence · Dashboards",
      "icon": "📈",
      "accent": "#f9a8d4",
      "topics": [
        {
          "id": "m8t1","title":"Power BI",
          "subtopics": ["Power Query & data transformation","Data modeling & relationships","DAX fundamentals (calculated columns, measures)","Report canvas & visualizations","Publishing & sharing (Power BI Service)"]
        },
        {
          "id": "m8t2","title":"Tableau",
          "subtopics": ["Connecting to data sources","Dimensions vs Measures","Chart types (bar, line, map, scatter, treemap)","Calculated fields & LOD expressions","Building dashboards & stories","Tableau Public (free publishing)"]
        }
      ],
      "resources": [
        {"type":"video","label":"Power BI Primary","title":"Power BI Full Course — Simplilearn (4h)","url":"https://www.youtube.com/watch?v=3u7MQz1EyPY"},
        {"type":"video","label":"DAX Deep Dive","title":"DAX for Beginners — Guy in a Cube","url":"https://www.youtube.com/playlist?list=PLv2BtOtLblH1YnQAUJJ1OgdKuXK36OHG6"},
        {"type":"video","label":"Tableau Primary","title":"Tableau Full Course — Edureka","url":"https://www.youtube.com/watch?v=jj6-0cwABqE"},
        {"type":"practice","label":"Tableau Free","title":"Tableau Public (free tool + publish)","url":"https://public.tableau.com/"},
        {"type":"mcq","label":"Power BI MCQs","title":"Power BI Quiz — Sanfoundry","url":"https://www.sanfoundry.com/power-bi-questions-answers/"}
      ],
      "exercises": [
        {"title":"Power BI Challenge — Maven Analytics","url":"https://www.mavenanalytics.io/data-playground","desc":"Use Maven's free datasets to build a Power BI dashboard. Publish and share."},
        {"title":"Tableau Public Gallery Challenge","url":"https://public.tableau.com/app/discover","desc":"Recreate any top-100 Tableau Public viz. Best way to learn advanced Tableau."}
      ]
    },
    {
      "id": "m9",
      "title": "Excel & Power Query",
      "subtitle": "Advanced Excel · Power Query · Automation",
      "icon": "📋",
      "accent": "#86efac",
      "topics": [
        {
          "id": "m9t1","title":"Excel for Data Analysis",
          "subtopics": ["Advanced formulas (XLOOKUP, INDEX-MATCH, ARRAYFORMULA)","Pivot Tables & Pivot Charts","Conditional Formatting at scale","Data Validation & Dropdowns","Named Ranges & Dynamic Arrays (FILTER, SORT, UNIQUE)"]
        },
        {
          "id": "m9t2","title":"Power Query",
          "subtopics": ["Connecting to data sources (CSV, web, databases)","Transform steps (merge, append, unpivot)","M language basics","Automating data refresh","Custom functions in Power Query"]
        }
      ],
      "resources": [
        {"type":"video","label":"Excel Primary","title":"Excel for Data Analysis — Leila Gharani","url":"https://www.youtube.com/playlist?list=PLmejDGrsgFyAITHoFBFCZ26R0GRIPGopZ"},
        {"type":"video","label":"Power Query","title":"Power Query Full Course — Excel Campus","url":"https://www.youtube.com/watch?v=0aeZX1l4JT4"},
        {"type":"practice","label":"Practice","title":"Excel Practice Online","url":"https://excel-practice-online.com/"},
        {"type":"mcq","label":"MCQs","title":"Excel MCQs — Sanfoundry","url":"https://www.sanfoundry.com/ms-excel-questions-answers/"}
      ],
      "exercises": [
        {"title":"Excel Practice Online","url":"https://excel-practice-online.com/","desc":"Interactive exercises directly in the browser. Work through Functions, PivotTables, and Charts sections fully."}
      ]
    },
    {
      "id": "m10",
      "title": "Machine Learning",
      "subtitle": "Supervised · Unsupervised · Model Deployment",
      "icon": "🤖",
      "accent": "#fef3c7",
      "topics": [
        {
          "id": "m10t1","title":"ML Foundations",
          "subtopics": ["Bias-Variance tradeoff","Train/Val/Test splits & cross-validation","Feature engineering & selection","Handling imbalanced datasets (SMOTE, class weights)","Pipelines with scikit-learn"]
        },
        {
          "id": "m10t2","title":"Supervised Learning",
          "subtopics": ["Linear & Logistic Regression","Decision Trees & Random Forests","Gradient Boosting (XGBoost, LightGBM, CatBoost)","SVM & KNN","Hyperparameter tuning (GridSearch, Optuna)"]
        },
        {
          "id": "m10t3","title":"Unsupervised Learning",
          "subtopics": ["K-Means & Hierarchical Clustering","DBSCAN","PCA & t-SNE for dimensionality reduction","Anomaly detection","Association Rules (Apriori)"]
        },
        {
          "id": "m10t4","title":"Model Evaluation & Deployment",
          "subtopics": ["Classification metrics (F1, ROC-AUC, PR curve)","Regression metrics (RMSE, MAE, MAPE)","SHAP values & model explainability","Saving models (pickle, joblib)","Deploying ML with Streamlit/FastAPI"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"ML with Python — freeCodeCamp (Andrew Ng content)","url":"https://www.youtube.com/watch?v=tPYj3fFJGjk"},
        {"type":"video","label":"Hands-On ML","title":"Scikit-Learn Crash Course — Sentdex","url":"https://www.youtube.com/playlist?list=PLQVvvaa0QuDd0flgGphKCej-9jp-QdzZ3"},
        {"type":"practice","label":"Interactive","title":"Kaggle ML Course (free)","url":"https://www.kaggle.com/learn/intro-to-machine-learning"},
        {"type":"collab","label":"Practice Notebook","title":"ML From Scratch — GitHub (eriklindernoren)","url":"https://github.com/eriklindernoren/ML-From-Scratch"},
        {"type":"docs","label":"Reference","title":"Scikit-Learn User Guide","url":"https://scikit-learn.org/stable/user_guide.html"},
        {"type":"mcq","label":"MCQs","title":"ML Interview Questions — InterviewBit","url":"https://www.interviewbit.com/machine-learning-interview-questions/"}
      ],
      "exercises": [
        {"title":"Kaggle Titanic ML Competition","url":"https://www.kaggle.com/c/titanic","desc":"Classic intro project. Build a full ML pipeline: EDA → Feature Eng → Model → Submit. Target >80% accuracy."},
        {"title":"Kaggle House Prices (Regression)","url":"https://www.kaggle.com/c/house-prices-advanced-regression-techniques","desc":"Advanced regression. Use XGBoost, LightGBM. Practice hyperparameter tuning with Optuna."},
        {"title":"Build & Deploy an ML App","url":"https://docs.streamlit.io/","desc":"Take any trained model, wrap it in Streamlit, add feature inputs, show predictions. Deploy to Streamlit Cloud."}
      ]
    },
    {
      "id": "m11",
      "title": "Deep Learning",
      "subtitle": "Neural Networks · PyTorch · TensorFlow",
      "icon": "🧠",
      "accent": "#b8a0ff",
      "topics": [
        {
          "id": "m11t1","title":"Neural Network Foundations",
          "subtopics": ["Perceptrons & Multi-layer networks","Activation functions (ReLU, Sigmoid, Softmax)","Forward & Backpropagation (from scratch)","Gradient Descent variants (SGD, Adam, RMSProp)","Batch normalization & Dropout"]
        },
        {
          "id": "m11t2","title":"PyTorch Core",
          "subtopics": ["Tensors & autograd","Dataset & DataLoader","Building nn.Module models","Training loops","GPU acceleration (CUDA)"]
        },
        {
          "id": "m11t3","title":"Convolutional Neural Networks",
          "subtopics": ["Convolution, Pooling, Stride","Classic architectures (LeNet, AlexNet, VGG, ResNet)","Transfer Learning (fine-tuning pretrained models)","Data augmentation","Image classification project"]
        },
        {
          "id": "m11t4","title":"Sequence Models",
          "subtopics": ["RNN & vanishing gradient problem","LSTM & GRU","Sequence-to-sequence models","Attention mechanism intro","Text classification project"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"MIT 6.S191: Introduction to Deep Learning","url":"http://introtodeeplearning.mit.edu/"},
        {"type":"video","label":"Fast.ai (code-first)","title":"Practical Deep Learning for Coders — fast.ai","url":"https://course.fast.ai/"},
        {"type":"video","label":"PyTorch Tutorial","title":"PyTorch Full Course — Daniel Bourke","url":"https://www.youtube.com/watch?v=Z_ikDlimN6A"},
        {"type":"video","label":"Deep Learning Theory","title":"Neural Networks: Zero to Hero — Andrej Karpathy","url":"https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ"},
        {"type":"collab","label":"Practice Notebook","title":"PyTorch Examples — Official GitHub","url":"https://github.com/pytorch/examples"},
        {"type":"mcq","label":"MCQs","title":"Deep Learning MCQs — Sanfoundry","url":"https://www.sanfoundry.com/deep-learning-questions-answers/"}
      ],
      "exercises": [
        {"title":"fast.ai Lesson Projects","url":"https://course.fast.ai/","desc":"Build a pet classifier, then a custom image classifier on your own dataset. Most effective way to learn DL practically."},
        {"title":"Kaggle Digit Recognizer","url":"https://www.kaggle.com/c/digit-recognizer","desc":"MNIST CNN from scratch in PyTorch. Classic starter. Target >99% accuracy with proper CNN."},
        {"title":"Build makemore (char-level LM)","url":"https://github.com/karpathy/makemore","desc":"Follow Andrej Karpathy's makemore series. Build a character-level language model from scratch. Best neural network intuition builder."}
      ]
    },
    {
      "id": "m12",
      "title": "NLP",
      "subtitle": "Text Processing · Transformers · LLMs",
      "icon": "💬",
      "accent": "#a5f3fc",
      "topics": [
        {
          "id": "m12t1","title":"Text Preprocessing",
          "subtopics": ["Tokenization, Stemming, Lemmatization","Stop word removal","Bag of Words & TF-IDF","Regular expressions for text","spaCy fundamentals"]
        },
        {
          "id": "m12t2","title":"Classical NLP",
          "subtopics": ["Text classification (Naive Bayes, Logistic Regression)","Sentiment analysis","Named Entity Recognition","Topic modeling (LDA)","Word embeddings (Word2Vec, GloVe)"]
        },
        {
          "id": "m12t3","title":"Transformers & Modern NLP",
          "subtopics": ["Attention mechanism deep dive","BERT & its variants","Hugging Face Transformers library","Fine-tuning pretrained models","RAG (Retrieval-Augmented Generation) basics"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"NLP with Python — Udemy (Jose Portilla, free coupon available)","url":"https://www.youtube.com/watch?v=fNxaJsNG3-s"},
        {"type":"video","label":"Transformers","title":"Hugging Face NLP Course (free)","url":"https://huggingface.co/learn/nlp-course/chapter1/1"},
        {"type":"collab","label":"Practice","title":"NLP Notebooks — Kaggle NLP Getting Started","url":"https://www.kaggle.com/competitions/nlp-getting-started"},
        {"type":"docs","label":"Reference","title":"spaCy Documentation","url":"https://spacy.io/usage"},
        {"type":"mcq","label":"MCQs","title":"NLP MCQs — Sanfoundry","url":"https://www.sanfoundry.com/natural-language-processing-questions-answers/"}
      ],
      "exercises": [
        {"title":"Kaggle NLP Disaster Tweets","url":"https://www.kaggle.com/competitions/nlp-getting-started","desc":"Binary text classification. Build TF-IDF + Logistic Regression baseline, then BERT fine-tuned model. Compare both."},
        {"title":"Hugging Face NLP Course Projects","url":"https://huggingface.co/learn/nlp-course","desc":"Complete all 4 chapters including the final projects. Best free NLP education available."}
      ]
    },
    {
      "id": "m13",
      "title": "Computer Vision",
      "subtitle": "Image Processing · Object Detection · Segmentation",
      "icon": "👁️",
      "accent": "#f9a8d4",
      "topics": [
        {
          "id": "m13t1","title":"Image Processing Basics",
          "subtopics": ["OpenCV fundamentals (read, resize, crop, rotate)","Color spaces (RGB, HSV, Grayscale)","Image filtering (blur, sharpen, edge detection)","Morphological operations","Histogram analysis & equalization"]
        },
        {
          "id": "m13t2","title":"Deep Learning for CV",
          "subtopics": ["CNN architectures for vision (ResNet, EfficientNet)","Object Detection (YOLO, Faster R-CNN concepts)","Semantic Segmentation (U-Net)","Transfer Learning with torchvision","Data augmentation with Albumentations"]
        },
        {
          "id": "m13t3","title":"Modern CV",
          "subtopics": ["Vision Transformers (ViT)","CLIP (zero-shot image classification)","Stable Diffusion concepts","OCR with EasyOCR/Tesseract","Face detection & recognition"]
        }
      ],
      "resources": [
        {"type":"video","label":"Primary Course","title":"Computer Vision with Python — freeCodeCamp","url":"https://www.youtube.com/watch?v=oXlwWbU8l2o"},
        {"type":"video","label":"OpenCV","title":"OpenCV Python Tutorial — Murtaza Hassan","url":"https://www.youtube.com/watch?v=WQeoO7MI0Bs"},
        {"type":"video","label":"Advanced CV","title":"CS231n: CNN for Visual Recognition — Stanford","url":"http://cs231n.stanford.edu/"},
        {"type":"collab","label":"Practice","title":"Kaggle Computer Vision Course","url":"https://www.kaggle.com/learn/computer-vision"},
        {"type":"mcq","label":"MCQs","title":"Computer Vision MCQs — Sanfoundry","url":"https://www.sanfoundry.com/computer-vision-questions-answers/"}
      ],
      "exercises": [
        {"title":"Kaggle Plant Pathology (CV)","url":"https://www.kaggle.com/c/plant-pathology-2020-flair","desc":"Multi-class image classification. Use EfficientNet with transfer learning. Build full training pipeline."},
        {"title":"Build a Face Detection App","url":"https://docs.streamlit.io/","desc":"Use OpenCV face detection + Streamlit to build a real-time webcam face detector app."}
      ]
    }
  ]
};

// ══════════════════════════════════════
// BEAUTIFUL SVG ICONS (no emojis!)
// ══════════════════════════════════════
const MODULE_ICONS = {
  'python': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="pythonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3776ab"/>
        <stop offset="100%" style="stop-color:#ffd43b"/>
      </linearGradient>
    </defs>
    <path d="M32 8 C 20 8, 12 20, 12 32 C 12 44, 20 56, 32 56 C 44 56, 52 44, 52 32" fill="none" stroke="url(#pythonGrad)" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 20 L 32 32 L 44 20" fill="none" stroke="url(#pythonGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="6" fill="#ffd43b"/>
  </svg>`,

  'numpy': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="numpyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#013243"/>
        <stop offset="100%" style="stop-color:#4b8bbe"/>
      </linearGradient>
    </defs>
    <rect x="16" y="20" width="32" height="24" rx="2" fill="url(#numpyGrad)" opacity="0.8"/>
    <line x1="16" y1="28" x2="48" y2="28" stroke="white" stroke-width="2"/>
    <line x1="16" y1="36" x2="48" y2="36" stroke="white" stroke-width="2"/>
    <circle cx="22" cy="24" r="2" fill="white"/>
    <circle cx="28" cy="24" r="2" fill="white"/>
    <circle cx="34" cy="24" r="2" fill="white"/>
  </svg>`,

  'pandas': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="pandasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#150458"/>
        <stop offset="100%" style="stop-color:#4b8bbe"/>
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="32" rx="20" ry="16" fill="url(#pandasGrad)" opacity="0.9"/>
    <ellipse cx="24" cy="30" rx="5" ry="4" fill="white" opacity="0.8"/>
    <ellipse cx="40" cy="30" rx="5" ry="4" fill="white" opacity="0.8"/>
    <ellipse cx="32" cy="34" rx="8" ry="2" fill="white" opacity="0.3"/>
    <path d="M28 26 L 32 22 L 36 26" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  'visualization': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="vizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f9a8d4"/>
        <stop offset="100%" style="stop-color:#b8a0ff"/>
      </linearGradient>
    </defs>
    <rect x="12" y="36" width="8" height="20" fill="url(#vizGrad)" opacity="0.7"/>
    <rect x="28" y="28" width="8" height="28" fill="url(#vizGrad)" opacity="0.85"/>
    <rect x="44" y="20" width="8" height="36" fill="url(#vizGrad)"/>
    <path d="M12 36 L 16 20" stroke="#86efac" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 56 L 20 30" stroke="#fef3c7" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  'eda': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="edaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fef3c7"/>
        <stop offset="100%" style="stop-color:#fbbf24"/>
      </linearGradient>
    </defs>
    <circle cx="22" cy="28" r="10" fill="none" stroke="url(#edaGrad)" stroke-width="3"/>
    <circle cx="42" cy="44" r="14" fill="none" stroke="url(#edaGrad)" stroke-width="3"/>
    <circle cx="42" cy="44" r="6" fill="url(#edaGrad)" opacity="0.5"/>
    <path d="M28 35 L 36 37" stroke="#b8a0ff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="28" cy="35" r="2" fill="#86efac"/>
  </svg>`,

  'api': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="apiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#b8a0ff"/>
        <stop offset="100%" style="stop-color:#a5f3fc"/>
      </linearGradient>
    </defs>
    <rect x="18" y="12" width="28" height="40" rx="4" fill="url(#apiGrad)" opacity="0.8"/>
    <path d="M18 20 L 46 20" stroke="white" stroke-width="2"/>
    <path d="M18 32 L 46 32" stroke="white" stroke-width="2"/>
    <path d="M18 44 L 38 44" stroke="white" stroke-width="2"/>
    <circle cx="32" cy="52" r="3" fill="#fef3c7"/>
  </svg>`,

  'sql': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="sqlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#a5f3fc"/>
        <stop offset="100%" style="stop-color:#4ade80"/>
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="32" rx="12" ry="10" fill="url(#sqlGrad)" opacity="0.9"/>
    <ellipse cx="40" cy="32" rx="12" ry="10" fill="url(#sqlGrad)" opacity="0.7"/>
    <ellipse cx="32" cy="20" rx="10" ry="8" fill="url(#sqlGrad)" opacity="0.6"/>
    <circle cx="24" cy="32" r="3" fill="white"/>
    <circle cx="40" cy="32" r="3" fill="white"/>
  </svg>`,

  'bi': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="biGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f9a8d4"/>
        <stop offset="100%" style="stop-color:#fef3c7"/>
      </linearGradient>
    </defs>
    <rect x="14" y="20" width="36" height="24" rx="3" fill="url(#biGrad)" opacity="0.8"/>
    <path d="M14 30 L 50 30" stroke="white" stroke-width="2"/>
    <path d="M20 38 L 44 38" stroke="white" stroke-width="2"/>
    <path d="M28 46 L 36 46" stroke="white" stroke-width="2"/>
    <circle cx="24" cy="26" r="2" fill="#86efac"/>
    <circle cx="40" cy="26" r="2" fill="#a5f3fc"/>
  </svg>`,

  'excel': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="excelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#217346"/>
        <stop offset="100%" style="stop-color:#86efac"/>
      </linearGradient>
    </defs>
    <rect x="16" y="10" width="32" height="44" rx="3" fill="url(#excelGrad)" opacity="0.9"/>
    <path d="M22 20 L 42 20" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 28 L 38 28" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 36 L 42 36" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <cell x="42" cy="42" r="3" fill="white" opacity="0.7"/>
  </svg>`,

  'ml': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="mlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fbbf24"/>
        <stop offset="100%" style="stop-color:#f59e0b"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="20" r="8" fill="url(#mlGrad)" opacity="0.8"/>
    <circle cx="22" cy="36" r="7" fill="url(#mlGrad)" opacity="0.7"/>
    <circle cx="42" cy="36" r="7" fill="url(#mlGrad)" opacity="0.7"/>
    <path d="M32 28 L 22 29" stroke="#b8a0ff" stroke-width="2"/>
    <path d="M32 28 L 42 29" stroke="#b8a0ff" stroke-width="2"/>
    <path d="M22 43 L 42 43" stroke="#a5f3fc" stroke-width="2"/>
  </svg>`,

  'dl': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#b8a0ff"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="26" rx="14" ry="10" fill="url(#dlGrad)" opacity="0.9"/>
    <ellipse cx="20" cy="42" rx="8" ry="6" fill="url(#dlGrad)" opacity="0.7"/>
    <ellipse cx="44" cy="42" rx="8" ry="6" fill="url(#dlGrad)" opacity="0.7"/>
    <circle cx="32" cy="26" r="4" fill="white"/>
    <path d="M24 42 L 28 26" stroke="white" stroke-width="1.5" opacity="0.6"/>
    <path d="M40 42 L 36 26" stroke="white" stroke-width="1.5" opacity="0.6"/>
  </svg>`,

  'nlp': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="nlpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#a5f3fc"/>
        <stop offset="100%" style="stop-color:#4ade80"/>
      </linearGradient>
    </defs>
    <rect x="18" y="16" width="28" height="32" rx="4" fill="url(#nlpGrad)" opacity="0.8"/>
    <path d="M26 28 L 38 28" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M26 36 L 38 36" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 40 L 34 40" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="48" r="3" fill="#fef3c7"/>
  </svg>`,

  'cv': `<svg viewBox="0 0 64 64" width="32" height="32">
    <defs>
      <linearGradient id="cvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f9a8d4"/>
        <stop offset="100%" style="stop-color:#fbbf24"/>
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="30" rx="18" ry="14" fill="url(#cvGrad)" opacity="0.8"/>
    <circle cx="26" cy="28" r="3" fill="white"/>
    <circle cx="38" cy="28" r="3" fill="white"/>
    <ellipse cx="32" cy="36" rx="6" ry="3" fill="white" opacity="0.7"/>
    <rect x="14" y="50" width="36" height="8" rx="2" fill="url(#cvGrad)" opacity="0.6"/>
  </svg>`
};

function getModuleIconSVG(iconCode) {
  // Map emoji codes to icon names
  const iconMap = {
    '🐍': MODULE_ICONS.python,
    '🔢': MODULE_ICONS.numpy,
    '🐼': MODULE_ICONS.pandas,
    '📊': MODULE_ICONS.visualization,
    '🔍': MODULE_ICONS.eda,
    '🚀': MODULE_ICONS.api,
    '🗄️': MODULE_ICONS.sql,
    '📈': MODULE_ICONS.bi,
    '📋': MODULE_ICONS.excel,
    '🤖': MODULE_ICONS.ml,
    '🧠': MODULE_ICONS.dl,
    '💬': MODULE_ICONS.nlp,
    '👁️': MODULE_ICONS.cv
  };

  return iconMap[iconCode] || iconCode;
}

// ══════════════════════════════════════
// CONSTANTS & STATE
// ══════════════════════════════════════
const LS = {
  cfg: 'dp_cfg',    // {useFirebase, email, uid}
};

let COURSE  = null;  // loaded course data (from embedded DEFAULT_COURSE)
let STATE   = {};    // progress data (loaded from Firebase, not localStorage)
let CFG     = null;  // config
let SESSION = false; // logged in?
let saveTimer = null;
let currentView = 'overview';
let currentModuleId = null;

// ══════════════════════════════════════
// CRYPTO — SHA-256 (Web Crypto API)
// ══════════════════════════════════════
async function sha256(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ══════════════════════════════════════
// CONFIG
// ══════════════════════════════════════
function loadCfg(){ try{ return JSON.parse(localStorage.getItem(LS.cfg)||'null'); }catch(e){ return null; } }
function saveCfg(c){ localStorage.setItem(LS.cfg, JSON.stringify(c)); }

// Progress auto-save (debounced)
function scheduleProgressSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveProgressToBackend().catch(console.error);
  }, 1000);
}

// ══════════════════════════════════════
// FIRESTORE PROGRESS SYNC
// ══════════════════════════════════════
// Backend API functions (no direct Firestore access in frontend)
async function loadProgressFromBackend() {
  console.log('🔍 loadProgressFromBackend() called');
  try {
    console.log('  Making API request to /api/progress...');
    const data = await apiRequest('/api/progress', 'GET');
    console.log('✅ Progress loaded from backend:', data);
    return data.progress || {};
  } catch (error) {
    console.error('❌ Failed to load progress from backend:', error);
    console.error('  Error name:', error.name);
    console.error('  Error message:', error.message);
    // Show error to user
    alert('Failed to load progress from backend: ' + error.message + '\n\nPlease check if the backend server is running on port 3000.');
    throw error; // Re-throw so caller knows
  }
}

async function saveProgressToBackend() {
  if (!CFG?.uid) return;

  // Extract only progress-related keys (t_, s_, e_, notes_)
  const progress = {};
  Object.keys(STATE).forEach(key => {
    if (key.startsWith('t_') || key.startsWith('s_') || key.startsWith('e_') || key.startsWith('notes_')) {
      progress[key] = STATE[key];
    }
  });

  try {
    await apiRequest('/api/progress', 'POST', { progress });
    console.log('✅ Progress saved to backend');
  } catch (error) {
    console.error('Failed to save progress to backend:', error);
  }
}

// ══════════════════════════════════════
// THEME SYSTEM
// ══════════════════════════════════════
const THEMES = {
  lavender: {
    name: 'Lavender Dreams',
    bg: '#fdf6f9',
    bg2: '#f9f1ff',
    bg3: '#f5ebff',
    lavender: '#c8b6ff',
    lavender2: '#b8a0ff',
    lavender3: '#a78dff',
    pink: '#f8c8dc',
    pink2: '#f9a8d4',
    pink3: '#f78fb3',
    mint: '#b8f5e0',
    mint2: '#86efac',
    mint3: '#4ade80',
    gold: '#fef3c7',
    gold2: '#fcd34d',
    gold3: '#fbbf24',
    sky: '#a5f3fc',
    sky2: '#67e8f9',
    txt: '#5a4a7a',
    txt2: '#7a6a9a',
    txt3: '#9a8aba',
    border: '#e8dfff',
    border2: '#ddd0ff'
  },
  peach: {
    name: 'Peach Blush',
    bg: '#fff5f5',
    bg2: '#fff0e6',
    bg3: '#ffebe5',
    lavender: '#ffb8b8',
    lavender2: '#ff9999',
    lavender3: '#ff7a7a',
    pink: '#ffd6cc',
    pink2: '#ffc4b2',
    pink3: '#ffb299',
    mint: '#d4f0e0',
    mint2: '#b8e0c8',
    mint3: '#9cd0b0',
    gold: '#ffeacc',
    gold2: '#ffd699',
    gold3: '#ffc866',
    sky: '#cceeff',
    sky2: '#99ddff',
    txt: '#8b5a5a',
    txt2: '#a07878',
    txt3: '#b89898',
    border: '#ffd6cc',
    border2: '#ffc4b2'
  },
  mint: {
    name: 'Mint Fresh',
    bg: '#f0fdf9',
    bg2: '#e6fff4',
    bg3: '#dbffef',
    lavender: '#a8d8ea',
    lavender2: '#8ecae6',
    lavender3: '#74bbd1',
    pink: '#ffb8d1',
    pink2: '#ff9ab3',
    pink3: '#ff7c95',
    mint: '#86efac',
    mint2: '#4ade80',
    mint3: '#22c55e',
    gold: '#fef3c7',
    gold2: '#fcd34d',
    gold3: '#fbbf24',
    sky: '#67e8f9',
    sky2: '#22d3ee',
    txt: '#4a7a6b',
    txt2: '#6a9a8b',
    txt3: '#8abaad',
    border: '#b8f5e0',
    border2: '#86efac'
  },
  rose: {
    name: 'Rose Gold',
    bg: '#fff8f8',
    bg2: '#ffe8ec',
    bg3: '#ffd8e3',
    lavender: '#e8d4f0',
    lavender2: '#d8b8e6',
    lavender3: '#c89cdc',
    pink: '#ffd6e0',
    pink2: '#ffb8c8',
    pink3: '#ff9ab0',
    mint: '#d4f0e0',
    mint2: '#b8e0c8',
    mint3: '#9cd0b0',
    gold: '#fef3c7',
    gold2: '#fcd34d',
    gold3: '#fbbf24',
    sky: '#a5f3fc',
    sky2: '#67e8f9',
    txt: '#8a5a7a',
    txt2: '#a87898',
    txt3: '#c8a8b8',
    border: '#ffd6e0',
    border2: '#ffb8c8'
  }
};

function loadTheme() {
  return localStorage.getItem('dp_theme') || 'lavender';
}

function saveTheme(themeName) {
  localStorage.setItem('dp_theme', themeName);
  applyTheme(themeName);
}

function applyTheme(themeName) {
  const theme = THEMES[themeName];
  if(!theme) return;

  const root = document.documentElement;

  // Apply all color variables
  Object.keys(theme).forEach(key => {
    if(key !== 'name') {
      root.style.setProperty('--' + key, theme[key]);
    }
  });

  // Update active theme option in modal
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === themeName);
  });

  // Recreate particles with new colors
  createParticles();
}

window.openThemeModal = function openThemeModal(){
  const currentTheme = loadTheme();
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === currentTheme);
  });
  document.getElementById('themeMsg').style.display='none';
  document.getElementById('themeModal').classList.add('open');
}

window.closeThemeModal = function closeThemeModal(){
  document.getElementById('themeModal').classList.remove('open');
}

window.setTheme = function setTheme(themeName){
  saveTheme(themeName);

  const msgEl = document.getElementById('themeMsg');
  msgEl.style.display='none';

  const theme = THEMES[themeName];
  showMsg(msgEl, 'ok', `✨ Switched to ${theme.name} theme!`);

  // Close modal after a moment
  setTimeout(closeThemeModal, 1000);
}

// ══════════════════════════════════════
// SETUP & LOGIN (Global - called from HTML inline handlers)
// ══════════════════════════════════════
window.showSetup = function showSetup(){
  const lockScreen = document.getElementById('lockScreen');
  const setupScreen = document.getElementById('setupScreen');

  lockScreen.classList.add('fade-out');
  setTimeout(() => {
    lockScreen.style.display = 'none';
    setupScreen.style.display = 'flex';
    setupScreen.classList.add('fade-in');
  }, 500);
};

async function doSetup(){
  const email = document.getElementById('setupEmail').value.trim();
  const p1 = document.getElementById('setupPass').value;
  const p2 = document.getElementById('setupPass2').value;
  const msgEl = document.getElementById('setupMsg');
  msgEl.style.display='none';

  // Validation
  if(!email){
    showMsg(msgEl,'err','Email address is required.');
    return;
  }
  if(!email.includes('@')){
    showMsg(msgEl,'err','Please enter a valid email address.');
    return;
  }
  if(p1.length<6){
    showMsg(msgEl,'err','Password must be at least 6 characters.');
    return;
  }
  if(p1!==p2){
    showMsg(msgEl,'err','Passwords do not match.');
    return;
  }

  // Must have Firebase auth initialized
  if(!auth){
    showMsg(msgEl,'err','Firebase is not available. Check your configuration.');
    return;
  }

  try {
    // Create Firebase user
    const userCred = await auth.createUserWithEmailAndPassword(email, p1);

    // Save minimal config
    const cfg = {
      useFirebase: true,
      email: email,
      uid: userCred.user.uid
    };
    saveCfg(cfg);
    CFG = cfg;

    // Immediately show app (don't wait for auth state change)
    console.log('✅ Firebase user created, showing app...');
    SESSION = true;
    STATE = { uid: userCred.user.uid };
    showApp();
  } catch(e){
    console.error('Firebase signup error:', e);
    let errorMsg = 'Signup failed: ';

    // Provide helpful error messages
    if (e.code === 'auth/email-already-in-use') {
      errorMsg = 'This email is already registered. Please try logging in instead.';
    } else if (e.code === 'auth/invalid-email') {
      errorMsg = 'Invalid email address.';
    } else if (e.code === 'auth/weak-password') {
      errorMsg = 'Password is too weak. Use at least 6 characters.';
    } else if (e.code === 'auth/operation-not-allowed') {
      errorMsg = 'Email/Password authentication is not enabled in Firebase Console.';
    } else if (e.code === 'auth/invalid-api-key') {
      errorMsg = 'Invalid Firebase configuration. Check config.json.';
    } else {
      errorMsg = errorMsg + (e.message || 'Unknown error.');
    }

    showMsg(msgEl,'err',errorMsg);
    return;
  }
}

window.doLogin = async function doLogin(){
  const errEl = document.getElementById('lockErr');
  errEl.textContent='';

  const email = document.getElementById('lockEmail').value.trim();
  const password = document.getElementById('lockPass').value;

  if(!email || !password){
    errEl.textContent = 'Please enter both email and password.';
    return;
  }

  if(!auth){
    errEl.textContent = 'Firebase is not available. Check your configuration.';
    return;
  }

  try {
    const userCred = await auth.signInWithEmailAndPassword(email, password);
    const user = userCred.user;

    console.log('✅ Login successful, user:', user.uid);
    SESSION = true;
    STATE = { uid: user.uid };

    // Save config
    const cfg = {
      useFirebase: true,
      email: email,
      uid: user.uid
    };
    saveCfg(cfg);
    CFG = cfg;

    // Load progress from backend
    try {
      console.log('📥 Loading progress from backend...');
      const backendProgress = await loadProgressFromBackend();
      console.log('✅ Backend progress loaded:', backendProgress);
      STATE = { ...STATE, ...backendProgress };
    } catch (error) {
      console.error('❌ Failed to load progress from backend:', error);
    }

    // Show the app
    console.log('🚀 Showing app after login...');
    showApp();
  } catch(e){
    console.error('Firebase login error:', e);
    let errorMsg = e.message;

    // Provide helpful error messages
    if (e.code === 'auth/user-not-found') {
      errorMsg = 'No account found with this email. Please sign up first.';
    } else if (e.code === 'auth/wrong-password') {
      errorMsg = 'Incorrect password.';
    } else if (e.code === 'auth/invalid-email') {
      errorMsg = 'Invalid email address.';
    } else if (e.code === 'auth/user-disabled') {
      errorMsg = 'This account has been disabled.';
    } else if (e.code === 'auth/too-many-requests') {
      errorMsg = 'Too many attempts. Please wait or reset your password.';
    } else if (e.code === 'auth/operation-not-allowed') {
      errorMsg = 'Email/Password auth not enabled in Firebase Console.';
    } else if (e.code === 'auth/invalid-api-key') {
      errorMsg = 'Invalid Firebase API key. Check config.json.';
    }

    errEl.textContent = errorMsg;
  }
}

window.doLogout = function doLogout(){
  // Sign out from Firebase if using it
  if (auth && typeof firebase !== 'undefined') {
    firebase.auth().signOut().catch(console.error);
  }

  SESSION=false;

  const app = document.getElementById('app');
  const lockScreen = document.getElementById('lockScreen');
  const lockPass = document.getElementById('lockPass');
  const lockEmail = document.getElementById('lockEmail');

  app.style.display='none';
  lockScreen.style.display='flex';
  lockScreen.classList.remove('fade-out');
  lockPass.value='';
  if(lockEmail) lockEmail.value = '';
  lockPass.focus();
}

function showApp(){
  console.log('🎬 showApp() called');
  try {
    if(!COURSE) COURSE=DEFAULT_COURSE;

    const lockScreen = document.getElementById('lockScreen');
    const setupScreen = document.getElementById('setupScreen');
    const app = document.getElementById('app');

    console.log('  Elements found:', { lockScreen, setupScreen, app });

    if (lockScreen) {
      lockScreen.style.display='none';
      console.log('  Hidden lockScreen');
    }
    if (setupScreen) {
      setupScreen.style.display='none';
      console.log('  Hidden setupScreen');
    }
    if (app) {
      app.style.display='block';
      console.log('  Showing app div');
    } else {
      console.error('❌ App div not found!');
      return;
    }

    console.log('  Building sidebar...');
    buildSidebar();

    console.log('  Rendering overview...');
    renderView('overview');

    // Animate particles
    createParticles();

    console.log('✅ showApp() completed successfully');
  } catch (error) {
    console.error('❌ Error in showApp():', error);
  }
}

// ══════════════════════════════════════
// PROGRESS HELPERS
// ══════════════════════════════════════
function getModuleProgress(mod){
  let total=0,done=0;
  mod.topics.forEach(t=>{
    total++;
    if(STATE['t_'+t.id]) done++;
    t.subtopics.forEach((s,si)=>{
      total++;
      if(STATE['s_'+t.id+'_'+si]) done++;
    });
  });
  (mod.exercises||[]).forEach((e,ei)=>{
    total++;
    if(STATE['e_'+mod.id+'_'+ei]) done++;
  });
  return total>0?Math.round(done/total*100):0;
}

function getOverallProgress(){
  let total=0,done=0;
  COURSE.modules.forEach(mod=>{
    mod.topics.forEach(t=>{
      total++;
      if(STATE['t_'+t.id]) done++;
      t.subtopics.forEach((s,si)=>{ total++; if(STATE['s_'+t.id+'_'+si]) done++; });
    });
    (mod.exercises||[]).forEach((e,ei)=>{ total++; if(STATE['e_'+mod.id+'_'+ei]) done++; });
  });
  return {done,total,pct:total>0?Math.round(done/total*100):0};
}

// ══════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════
function buildSidebar(){
  const sb=document.getElementById('sidebar');
  let html=`<div class="sb-section"><div class="sb-section-title">Navigation</div>
    <div class="sb-item ${currentView==='overview'?'active':''}" onclick="renderView('overview')">
      <span class="sb-icon">✦</span><span class="sb-text">Overview</span>
    </div></div>
    <div class="sb-section"><div class="sb-section-title">Modules</div>`;

  COURSE.modules.forEach(mod=>{
    const pct=getModuleProgress(mod);
    const active=currentView==='module'&&currentModuleId===mod.id;
    html+=`<div class="sb-item ${active?'active':''}" onclick="renderView('module','${mod.id}')" style="${active?'--accent:'+(mod.accent||'var(--lavender3)')+';':''}">
      <span class="sb-icon">${getModuleIconSVG(mod.icon)}</span>
      <span class="sb-text">${mod.title}</span>
      <span class="sb-pct">${pct}%</span>
    </div>`;
  });

  html+=`</div>`;
  sb.innerHTML=html;
}

// ══════════════════════════════════════
// RENDER VIEWS
// ══════════════════════════════════════
function renderView(view, modId){
  currentView=view;
  currentModuleId=modId||null;
  buildSidebar();
  const mc=document.getElementById('mainContent');

  if(view==='overview'){
    mc.innerHTML=renderOverview();
  } else if(view==='module'){
    mc.innerHTML=renderModuleDetail(modId);
  }

  // Smooth scroll to top
  document.querySelector('.main')?.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Add entrance animation to main content
  mc.style.opacity = '0';
  mc.style.transform = 'translateY(20px)';
  setTimeout(() => {
    mc.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    mc.style.opacity = '1';
    mc.style.transform = 'translateY(0)';
  }, 50);
}

function renderOverview(){
  const {done,total,pct}=getOverallProgress();
  const completedMods=COURSE.modules.filter(m=>getModuleProgress(m)===100).length;

  let html=`<div class="page-sub"> ${COURSE.meta?.subtitle_t||'YOUR LEARNING JOURNEY'}</div>
  <div class="page-title">${COURSE.meta?.title||'Data Analysis Mastery'}</div>
  <div class="page-sub">${COURSE.meta?.subtitle||'YOUR LEARNING JOURNEY'}</div>
  <div class="stats-row">
    <div class="stat-card v"><div class="stat-num">${pct}%</div><div class="stat-label">Overall Progress</div></div>
    <div class="stat-card r"><div class="stat-num">${done}</div><div class="stat-label">Items Completed</div></div>
    <div class="stat-card g"><div class="stat-num">${completedMods}</div><div class="stat-label">Modules Done</div></div>
    <div class="stat-card y"><div class="stat-num">${COURSE.modules.length}</div><div class="stat-label">Total Modules</div></div>
  </div>
  <div class="sec-title">All Modules</div>
  <div class="modules-grid">`;

  COURSE.modules.forEach(mod=>{
    const pct=getModuleProgress(mod);
    const acc=mod.accent||'var(--lavender3)';
    html+=`<div class="mod-card" onclick="renderView('module','${mod.id}')" style="--macc:${acc}">
      <style>.mod-card[onclick*="${mod.id}"]::before{background:${acc};opacity:.6;}</style>
      <div class="mod-header">
        <div>
          <div class="mod-icon">${getModuleIconSVG(mod.icon)}</div>
        </div>
        <svg width="36" height="36" viewBox="0 0 36 36" class="mod-prog-ring">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(216,180,255,0.2)" stroke-width="3"/>
          <circle cx="18" cy="18" r="14" fill="none" stroke="${acc}" stroke-width="3"
            stroke-dasharray="88" stroke-dashoffset="${88-(88*pct/100)}"
            stroke-linecap="round" transform="rotate(-90 18 18)" style="transition:stroke-dashoffset .6s cubic-bezier(0.34, 1.56, 0.64, 1)"/>
        </svg>
      </div>
      <div class="mod-title">${mod.title}</div>
      <div class="mod-sub">${mod.subtitle||''}</div>
      <div class="mod-bar-wrap">
        <div class="mod-bar"><div class="mod-bar-fill" style="width:${pct}%;background:${acc}"></div></div>
        <div class="mod-stats">
          <span class="mod-stat-txt">${mod.topics.length} topics</span>
          <span class="mod-stat-txt" style="color:${acc}">${pct}%</span>
        </div>
      </div>
    </div>`;
  });

  html+=`</div>`;
  return html;
}

function renderModuleDetail(modId){
  const mod=COURSE.modules.find(m=>m.id===modId);
  if(!mod) return '<p>Module not found</p>';

  const pct=getModuleProgress(mod);
  const acc=mod.accent||'var(--lavender3)';

  let html=`<button class="back-btn" onclick="renderView('overview')">
    <span>←</span> Back to Overview
  </button>
  <div class="mod-detail-header">
    <div class="mdh-left">
      <div class="big-icon">${getModuleIconSVG(mod.icon)}</div>
      <div class="mdh-title">${mod.title}</div>
      <div class="mdh-sub">${mod.subtitle||''}</div>
    </div>
    <div class="mdh-right">
      <div class="mdh-pct" style="color:${acc}">${pct}%</div>
      <div class="mdh-pct-label">COMPLETE</div>
    </div>
  </div>`;

  // Topics
  html+=`<div class="sec-title">Topics & Subtopics</div>`;
  mod.topics.forEach(t=>{
    const topicDone=!!STATE['t_'+t.id];
    const subDone=t.subtopics.filter((s,si)=>STATE['s_'+t.id+'_'+si]).length;
    html+=`<div class="topic-card">
      <div class="topic-header" onclick="toggleTopic(event,'tbody_${t.id}')">
        <input type="checkbox" class="topic-cb" ${topicDone?'checked':''}
          onchange="toggleTopic_check(event,'${t.id}')" onclick="event.stopPropagation()">
        <span class="topic-title-txt ${topicDone?'done':''}" id="ttxt_${t.id}">${t.title}</span>
        <span class="topic-count" id="topic-count-${t.id}">${subDone}/${t.subtopics.length}</span>
        <span class="topic-chevron" id="chv_${t.id}">▾</span>
      </div>
      <div class="topic-body" id="tbody_${t.id}">`;
    t.subtopics.forEach((s,si)=>{
      const sDone=!!STATE['s_'+t.id+'_'+si];
      html+=`<div class="subtopic-item">
        <input type="checkbox" class="sub-cb" ${sDone?'checked':''}
          onchange="toggleSub(this,'${t.id}',${si},'${modId}')">
        <span class="sub-txt ${sDone?'done':''}" id="stxt_${t.id}_${si}">${s}</span>
      </div>`;
    });
    html+=`</div></div>`;
  });

  // Resources
  if(mod.resources&&mod.resources.length){
    html+=`<div class="sec-title" style="margin-top:28px">Learning Resources</div><div class="res-grid">`;
    mod.resources.forEach(r=>{
      const typeClass='rt-'+(r.type||'docs');
      const typeLabel=(r.type||'docs').toUpperCase();
      html+=`<a class="res-card" href="${r.url}" target="_blank" rel="noopener">
        <span class="res-type-badge ${typeClass}">${typeLabel}</span>
        <div class="res-content">
          <div class="res-label">${r.label||''}</div>
          <div class="res-title">${r.title}</div>
        </div>
      </a>`;
    });
    html+=`</div>`;
  }

  // Exercises
  if(mod.exercises&&mod.exercises.length){
    html+=`<div class="sec-title">Practice Exercises</div>`;
    mod.exercises.forEach((ex,ei)=>{
      const exDone=!!STATE['e_'+modId+'_'+ei];
      html+=`<div class="ex-card">
        <input type="checkbox" class="ex-check" ${exDone?'checked':''}
          onchange="toggleExercise(this,'${modId}',${ei})">
        <div class="ex-body">
          <div class="ex-title ${exDone?'done':''}" id="extxt_${modId}_${ei}">${ex.title}</div>
          <div class="ex-desc">${ex.desc||''}</div>
          <a class="ex-link" href="${ex.url}" target="_blank" rel="noopener">
            Open → ${ex.url.replace(/https?:\/\//,'')}
          </a>
        </div>
      </div>`;
    });
  }

  // Notes
  const notesKey='notes_'+modId;
  const notesVal=STATE[notesKey]||'';
  html+=`<div class="sec-title" style="margin-top:28px">My Notes</div>
  <textarea class="notes-area" id="notesArea_${modId}" placeholder="Add your notes, key learnings, or bookmarks for this module..."
    oninput="saveNotes('${modId}')">${notesVal}</textarea>`;

  return html;
}

// ══════════════════════════════════════
// INTERACTION HANDLERS
// ══════════════════════════════════════
function toggleTopic(e, bodyId){
  const body=document.getElementById(bodyId);
  const chevId=bodyId.replace('tbody_','chv_');
  const chev=document.getElementById(chevId);
  if(body){
    body.classList.toggle('open');
    if(chev) chev.classList.toggle('open');
  }
}

async function toggleTopic_check(e, topicId){
  e.stopPropagation();
  const cb=e.target;
  const wasCompleted = STATE['t_'+topicId];
  STATE['t_'+topicId]=cb.checked;
  const txt=document.getElementById('ttxt_'+topicId);
  if(txt) txt.classList.toggle('done',cb.checked);

  // Check if module just got completed
  if(!wasCompleted && cb.checked) {
    checkModuleCompletion();
  }

  refreshModProgress();
  scheduleSave();
  scheduleProgressSave(); // Save progress to Firebase
}

function toggleSub(cb, topicId, si, modId){
  const wasCompleted = STATE['s_'+topicId+'_'+si];
  STATE['s_'+topicId+'_'+si]=cb.checked;
  const txt=document.getElementById('stxt_'+topicId+'_'+si);
  if(txt) txt.classList.toggle('done',cb.checked);

  // Check if module just got completed
  if(!wasCompleted && cb.checked) {
    checkModuleCompletion();
  }

  const mod=COURSE.modules.find(m=>m.id===modId);
  if(mod){
    const t=mod.topics.find(t=>t.id===topicId);
    if(t){
      const subDone=t.subtopics.filter((s,i)=>STATE['s_'+topicId+'_'+i]).length;
      // Update count directly by ID
      const cntEl = document.getElementById('topic-count-'+topicId);
      if(cntEl) {
        cntEl.textContent = subDone + '/' + t.subtopics.length;
      }
    }
  }
  refreshModProgress();
  scheduleProgressSave();
}

function toggleExercise(cb, modId, ei){
  const wasCompleted = STATE['e_'+modId+'_'+ei];
  STATE['e_'+modId+'_'+ei]=cb.checked;
  const txt=document.getElementById('extxt_'+modId+'_'+ei);
  if(txt) txt.classList.toggle('done',cb.checked);

  // Check if module just got completed
  if(!wasCompleted && cb.checked) {
    checkModuleCompletion();
  }

  refreshModProgress();
  scheduleSave();
  scheduleProgressSave(); // Save progress to Firebase
}

function saveNotes(modId){
  const ta=document.getElementById('notesArea_'+modId);
  if(ta){
    STATE['notes_'+modId]=ta.value;
    scheduleSave();
    scheduleProgressSave(); // Save progress to Firebase
  }
}

function refreshModProgress(){
  if(currentView==='module'&&currentModuleId){
    const mod=COURSE.modules.find(m=>m.id===currentModuleId);
    if(mod){
      const pct=getModuleProgress(mod);
      const el=document.querySelector('.mdh-pct');
      if(el) el.textContent=pct+'%';
    }
  }
  buildSidebar();
}

// ══════════════════════════════════════
// SYNC MODAL
// ══════════════════════════════════════
// ══════════════════════════════════════
// FIREBASE SYNC
// ══════════════════════════════════════
// Progress is automatically saved to Firebase via API calls
// No manual sync needed - everything is cloud-native

// ══════════════════════════════════════
// UTILS
// ══════════════════════════════════════
function showMsg(el, type, text){
  el.className='modal-msg '+type;
  el.textContent=text;
  el.style.display='block';
}

// ══════════════════════════════════════
// PARTICLES EFFECT
// ══════════════════════════════════════
function createParticles(){
  const container = document.getElementById('particles');
  if(!container) return;

  // Clear existing particles
  container.innerHTML = '';

  const colors = ['#f9a8d4', '#b8a0ff', '#a5f3fc', '#86efac', '#fef3c7'];

  for(let i = 0; i < 30; i++){
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (5 + Math.random() * 5) + 's';
    particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`;
    particle.style.width = (3 + Math.random() * 5) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ══════════════════════════════════════
// MAGIC SPOTLIGHT EFFECT
// ══════════════════════════════════════
(function initSpotlight(){
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.appendChild(spotlight);

  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });
})();

// ══════════════════════════════════════
// RIPPLE EFFECT
// ══════════════════════════════════════
function createRipple(e, element) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';

  element.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

// ══════════════════════════════════════
// FLOATING HEARTS EFFECT
// ══════════════════════════════════════
function createFloatingHeart(x, y) {
  const hearts = ['💖', '✨', '💕', '🌸', '💝'];
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';
  heart.style.animationDuration = (2 + Math.random() * 2) + 's';

  document.body.appendChild(heart);

  setTimeout(() => heart.remove(), 4000);
}

// Create burst of hearts
function createHeartBurst(x, y, count = 5) {
  for(let i = 0; i < count; i++) {
    setTimeout(() => {
      const offsetX = x + (Math.random() - 0.5) * 100;
      const offsetY = y + (Math.random() - 0.5) * 50;
      createFloatingHeart(offsetX, offsetY);
    }, i * 100);
  }
}

// Add click listeners for heart bursts on important actions
document.addEventListener('click', (e) => {
  const target = e.target.closest('.lock-btn, .setup-btn, .modal-btn, .sb-item, .sync-badge');

  if(target) {
    createRipple(e, target);

    // Create heart burst on successful actions only
    if(target.classList.contains('lock-btn') || target.classList.contains('setup-btn')) {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createHeartBurst(centerX, centerY, 6);
    }
  }
});

// Logo click easter egg - sprinkle effect
document.querySelector('.lock-logo')?.addEventListener('click', (e) => {
  const rect = e.target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create sparkle burst
  const colors = ['#f9a8d4', '#b8a0ff', '#86efac', '#fef3c7', '#a5f3fc'];
  for(let i = 0; i < 20; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.style.position = 'fixed';
      sparkle.style.left = centerX + 'px';
      sparkle.style.top = centerY + 'px';
      sparkle.style.width = '10px';
      sparkle.style.height = '10px';
      sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.borderRadius = '50%';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.zIndex = '9999';
      sparkle.style.animation = 'sparkle-burst 1s ease-out forwards';
      sparkle.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`;
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }, i * 50);
  }
});

// Add mouse move parallax to mod-cards
document.addEventListener('DOMContentLoaded', () => {
  // Add subtle parallax to module cards
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.mod-card, .stat-card, .topic-card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const angleX = (mouseY - 0.5) * 10;
      const angleY = (mouseX - 0.5) * -10;

      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
  });

  // Reset transform on mouse leave
  document.addEventListener('mouseleave', () => {
    const cards = document.querySelectorAll('.mod-card, .stat-card, .topic-card');
    cards.forEach(card => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
});

// ══════════════════════════════════════
// SMOOTH SCROLL ANIMATION
// ══════════════════════════════════════
let isScrolling = false;
window.addEventListener('scroll', () => {
  if(!isScrolling) {
    window.requestAnimationFrame(() => {
      // Add scroll-based animations here if needed
      isScrolling = false;
    });
    isScrolling = true;
  }
});

// ══════════════════════════════════════
// CELEBRATION EFFECTS
// ══════════════════════════════════════
function checkModuleCompletion() {
  if(!currentModuleId) return;
  const mod = COURSE.modules.find(m=>m.id===currentModuleId);
  if(mod && getModuleProgress(mod) === 100) {
    // Module completed! Trigger celebration
    createCelebration();

    // Show notification
    setTimeout(() => {
      alert(`🎉 Congratulations! You've completed "${mod.title}"! 🎉\n\nKeep up the amazing work! ✨`);
    }, 500);
  }
}

function createCelebration() {
  const colors = ['#f9a8d4', '#b8a0ff', '#86efac', '#fef3c7', '#a5f3fc', '#ffd6e0'];
  const emojis = ['✨', '🌟', '💖', '🎉', '🏆', '⭐', '💫', '🌸'];

  for(let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-20px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '10000';
      confetti.style.animation = 'confetti-fall ' + (2 + Math.random() * 3) + 's linear forwards';

      const emoji = document.createElement('span');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.position = 'fixed';
      emoji.style.left = confetti.style.left;
      emoji.style.top = '-20px';
      emoji.style.fontSize = (12 + Math.random() * 16) + 'px';
      emoji.style.pointerEvents = 'none';
      emoji.style.zIndex = '10001';
      emoji.style.animation = 'confetti-fall ' + (2.5 + Math.random() * 2) + 's linear forwards';

      document.body.appendChild(confetti);
      document.body.appendChild(emoji);

      setTimeout(() => {
        confetti.remove();
        emoji.remove();
      }, 5000);
    }, i * 80);
  }
}

// Add confetti fall animation
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0.7;
    }
  }
`;
document.head.appendChild(style);

// ══════════════════════════════════════
// GEMINI AI ASSISTANT
// ══════════════════════════════════════
let geminiPanel = null;
let geminiToggle = null;
let geminiClose = null;
let geminiInput = null;
let geminiSend = null;
let geminiMessages = null;
let isGeminiLoading = false;

let geminiHistoryLoaded = false;

function initGeminiAssistant() {
  console.log('🚀 initGeminiAssistant() STARTED');
  console.log('  Gemini config:', window.geminiConfig);
  console.log('  geminiConfig.enabled:', window.geminiConfig?.enabled);

  // Check if Gemini is enabled in config
  if (!window.geminiConfig?.enabled) {
    console.log('🤖 Gemini AI is disabled in config - hiding assistant UI');
    const assistant = document.getElementById('geminiAssistant');
    if (assistant) {
      assistant.style.display = 'none';
    }
    return;
  }

  geminiPanel = document.getElementById('geminiPanel');
  geminiToggle = document.getElementById('geminiToggle');
  geminiClose = document.getElementById('geminiClose');
  geminiClear = document.getElementById('geminiClear');
  geminiInput = document.getElementById('geminiInput');
  geminiSend = document.getElementById('geminiSend');
  geminiMessages = document.getElementById('geminiMessages');

  console.log('  Gemini UI elements:', { geminiPanel, geminiToggle, geminiClose, geminiClear, geminiInput, geminiSend, geminiMessages });

  if (!geminiPanel || !geminiToggle) {
    console.warn('⚠️ Gemini UI elements not found - assistant will not work');
    console.warn('  geminiPanel:', geminiPanel);
    console.warn('  geminiToggle:', geminiToggle);
    return;
  }

  console.log('✅ Gemini UI elements found, attaching event listeners...');

  // Toggle panel
  geminiToggle.addEventListener('click', async () => {
    console.log('🔘 Gemini toggle clicked!');
    console.log('  Panel open?', geminiPanel.classList.contains('open'));
    console.log('  SESSION:', SESSION, 'CFG.uid:', CFG?.uid);

    if (geminiPanel.classList.contains('open')) {
      console.log('  → Closing panel');
      closeGeminiPanel();
    } else {
      console.log('  → Opening panel');
      await openGeminiPanel();
    }
  });

  geminiClose?.addEventListener('click', closeGeminiPanel);
  geminiClear?.addEventListener('click', clearGeminiHistory);

  // Send message
  geminiSend?.addEventListener('click', sendGeminiMessage);
  geminiInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendGeminiMessage();
    }
  });

  // Auto-resize textarea
  geminiInput?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value === '') this.style.height = 'auto';
  });
}

// Initialize Gemini Assistant immediately if DOM is ready, or wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGeminiAssistant);
} else {
  // DOM is already ready, initialize now
  initGeminiAssistant();
}

async function openGeminiPanel() {
  console.log('🖱️ openGeminiPanel() called');
  console.log('  SESSION:', SESSION, 'CFG.uid:', CFG?.uid);

  if (!SESSION || !CFG?.uid) {
    alert('Please login to use Gemini Assistant');
    console.warn('⚠️ User not logged in -阻止打开Gemini面板');
    return;
  }

  // Show loading state
  console.log('  Opening panel and showing loading...');
  geminiPanel.classList.add('open');
  geminiMessages.innerHTML = `
    <div class="gemini-msg assistant">
      <div class="gemini-avatar">AI</div>
      <div class="gemini-text">Loading your conversation history...</div>
    </div>
  `;

  if (!geminiHistoryLoaded) {
    console.log('  Loading Gemini history for first time...');
    try {
      await loadGeminiHistory();
      geminiHistoryLoaded = true;
      console.log('✅ Gemini history loaded');
    } catch (error) {
      console.error('❌ Failed to load history:', error);
      // Show error and allow user to try anyway
      geminiMessages.innerHTML = `
        <div class="gemini-msg assistant">
          <div class="gemini-avatar">AI</div>
          <div class="gemini-text">Unable to load conversation history. You can start a new conversation.</div>
        </div>
      `;
    }
  } else {
    console.log('  Gemini history already loaded, skipping fetch');
  }

  geminiInput?.focus();
}

function closeGeminiPanel() {
  geminiPanel.classList.remove('open');
}

async function appendDefaultWelcome() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'gemini-msg assistant';
  msgDiv.innerHTML = `
    <div class="gemini-avatar">AI</div>
    <div class="gemini-text">Hi! I'm your AI learning assistant. Ask me anything about your course, get help with concepts, or stay motivated! ✨</div>
  `;
  geminiMessages.appendChild(msgDiv);
}

async function loadGeminiHistory() {
  try {
    const response = await fetch('/api/gemini/conversations', {
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to load Gemini history:', response.status, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const conversations = data.conversations || [];

    // Clear current messages and load history (or show default if empty)
    geminiMessages.innerHTML = '';
    if (conversations.length === 0) {
      console.log('No Gemini history found, showing welcome message');
      appendDefaultWelcome();
    } else {
      console.log(`Loaded ${conversations.length} Gemini conversations`);
      conversations.forEach(conv => {
        appendGeminiMessage(conv.userMessage, true);
        appendGeminiMessage(conv.aiResponse, false);
      });
    }

    scrollGeminiToBottom();
  } catch (error) {
    console.error('Error loading Gemini history:', error);
    throw error; // Re-throw so openGeminiPanel can handle it
  }
}

async function clearGeminiHistory() {
  if (!confirm('Clear all conversation history? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch('/api/gemini/conversations/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to clear history');
    }

    // Reset chat to default
    geminiMessages.innerHTML = `
      <div class="gemini-msg assistant">
        <div class="gemini-avatar">AI</div>
        <div class="gemini-text">Hi! I'm your AI learning assistant. Ask me anything about your course, get help with concepts, or stay motivated! ✨</div>
      </div>
    `;
  } catch (error) {
    console.error('Error clearing Gemini history:', error);
    alert('Failed to clear history: ' + error.message);
  }
}

function appendGeminiMessage(text, isUser = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `gemini-msg ${isUser ? 'user' : 'assistant'}`;

  const avatar = document.createElement('div');
  avatar.className = 'gemini-avatar';
  avatar.textContent = isUser ? 'YOU' : 'AI';

  const textDiv = document.createElement('div');
  textDiv.className = 'gemini-text';
  textDiv.textContent = text;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(textDiv);
  geminiMessages.appendChild(msgDiv);
  scrollGeminiToBottom();
}

function showGeminiTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'gemini-msg assistant typing-msg';
  typingDiv.innerHTML = `
    <div class="gemini-avatar">AI</div>
    <div class="gemini-typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  geminiMessages.appendChild(typingDiv);
  scrollGeminiToBottom();
  return typingDiv;
}

function removeGeminiTyping(typingDiv) {
  if (typingDiv && typingDiv.parentNode) {
    typingDiv.parentNode.removeChild(typingDiv);
  }
}

function scrollGeminiToBottom() {
  geminiMessages.scrollTop = geminiMessages.scrollHeight;
}

function getGeminiContext() {
  const context = {
    currentModule: null,
    progress: null
  };

  if (currentView === 'module' && currentModuleId) {
    const mod = COURSE.modules.find(m => m.id === currentModuleId);
    if (mod) {
      context.currentModule = {
        title: mod.title,
        topics: mod.topics.length,
        exercises: mod.exercises?.length || 0
      };
    }
  }

  if (STATE) {
    const total = COURSE.modules.reduce((sum, mod) => {
      const count = mod.topics.length + (mod.exercises?.length || 0) + mod.topics.reduce((s, t) => s + t.subtopics.length, 0);
      return sum + count;
    }, 0);

    const completed = Object.keys(STATE).filter(k =>
      k.startsWith('t_') || k.startsWith('s_') || k.startsWith('e_')
    ).length;

    context.progress = total > 0 ? Math.round(completed / total * 100) : 0;
  }

  return context;
}

async function sendGeminiMessage() {
  const message = geminiInput.value.trim();
  if (!message || isGeminiLoading) return;

  if (!SESSION || !CFG?.uid) {
    alert('Please login to use Gemini Assistant');
    return;
  }

  isGeminiLoading = true;
  geminiSend.disabled = true;
  geminiInput.value = '';
  geminiInput.style.height = 'auto';

  // Add user message
  appendGeminiMessage(message, true);

  // Show typing indicator
  const typingIndicator = showGeminiTyping();

  try {
    const context = getGeminiContext();
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        message: message,
        context: context
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }

    // Remove typing indicator
    removeGeminiTyping(typingIndicator);

    // Check response body exists
    if (!response.body) {
      throw new Error('Response body is empty');
    }

    // Create new assistant message bubble for streaming
    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = 'gemini-msg assistant';
    assistantMsgDiv.innerHTML = `
      <div class="gemini-avatar">AI</div>
      <div class="gemini-text"></div>
    `;
    geminiMessages.appendChild(assistantMsgDiv);
    const textDiv = assistantMsgDiv.querySelector('.gemini-text');
    scrollGeminiToBottom();

    // Stream response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any remaining bytes
          fullResponse += decoder.decode();
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        textDiv.textContent = fullResponse;
        scrollGeminiToBottom();
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      textDiv.textContent += '\n\n[Stream interrupted]';
    }

  } catch (error) {
    console.error('Gemini chat error:', error);
    removeGeminiTyping(typingIndicator);
    alert('Failed to get response: ' + error.message);
  } finally {
    isGeminiLoading = false;
    geminiSend.disabled = false;
    geminiInput?.focus();
  }
}

// ══════════════════════════════════════
// BOOT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  console.log('🚀 DOMContentLoaded - Page loaded');

  // Check for Firebase config errors
  if (window.firebaseConfigError) {
    const errEl = document.getElementById('lockErr');
    if (errEl) {
      errEl.textContent = '⚠️ ' + window.firebaseConfigError;
      errEl.style.display = 'block';
    }
  }

  CFG=loadCfg();

  if(!CFG){
    document.getElementById('lockHint').style.display='block';
  }

  COURSE=DEFAULT_COURSE;

  // Auto-fill email if present in config
  if(CFG && CFG.email){
    const lockEmail = document.getElementById('lockEmail');
    if(lockEmail) lockEmail.value = CFG.email;
  }

  const lockPass = document.getElementById('lockPass');
  lockPass.focus();

  lockPass.addEventListener('keydown',e=>{
    if(e.key==='Enter') doLogin();
  });

  // Handle Firebase authentication state
  async function handleAuthStateChange(user) {
    console.log('🔄 Auth state changed:', user ? `User: ${user.uid}, ${user.email}` : 'No user');

    if(user){
      SESSION = true;
      STATE.uid = user.uid;

      // Store Firebase uid in config for future sync
      const cfg = loadCfg() || {};
      cfg.uid = user.uid;
      saveCfg(cfg);
      CFG = cfg;

      // For Firebase users, start fresh - Backend/Firestore is the source of truth
      STATE = { uid: user.uid };

      // Reset Gemini history cache for new user session
      if (typeof geminiHistoryLoaded !== 'undefined') {
        geminiHistoryLoaded = false;
      }

      // Load progress from backend (sync across devices)
      try {
        console.log('📥 Loading progress from backend...');
        const backendProgress = await loadProgressFromBackend();
        console.log('✅ Backend progress loaded:', backendProgress);
        STATE = { ...STATE, ...backendProgress };
        lsSaveState();
      } catch (error) {
        console.error('❌ Failed to load progress from backend:', error);
        // Continue anyway - show app with empty state
      }

      // Hide lock/setup screens and show app
      const lockScreen = document.getElementById('lockScreen');
      const setupScreen = document.getElementById('setupScreen');
      const appDiv = document.getElementById('app');

      console.log('🔍 Screen states:', {
        lockDisplay: lockScreen?.style.display,
        setupDisplay: setupScreen?.style.display,
        appDisplay: appDiv?.style.display
      });

      if (lockScreen) lockScreen.style.display = 'none';
      if (setupScreen) setupScreen.style.display = 'none';
      if (appDiv) appDiv.style.display = 'block';

      console.log('🚀 Calling showApp()...');
      showApp();
    } else {
      SESSION = false;
      console.log('👤 User signed out');
    }
  }

  // Firebase auth state listener
  if(auth && typeof firebase !== 'undefined'){
    console.log('👂 Setting up Firebase auth state listener...');

    // Check if user is already logged in (page load with existing session)
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('👤 User already logged in on page load:', currentUser.uid);
      handleAuthStateChange(currentUser);
    }

    // Listen for future auth state changes
    firebase.auth().onAuthStateChanged(handleAuthStateChange, (error) => {
      console.error('❌ Auth state listener error:', error);
    });
  } else {
    console.warn('Firebase auth not available for state listener');
  }

  // Create initial particles
  setTimeout(createParticles, 1000);

  // Fallback: If user is authenticated but app not visible after 2 seconds, force show it
  setTimeout(() => {
    if (auth && auth.currentUser && SESSION) {
      const appDiv = document.getElementById('app');
      const lockScreen = document.getElementById('lockScreen');
      const setupScreen = document.getElementById('setupScreen');

      if (appDiv && appDiv.style.display === 'none') {
        console.log('⏰ Fallback: User authenticated but app hidden - forcing showApp()');
        if (lockScreen) lockScreen.style.display = 'none';
        if (setupScreen) setupScreen.style.display = 'none';
        if (appDiv) appDiv.style.display = 'block';
        showApp();
      }
    }
  }, 2000);
});

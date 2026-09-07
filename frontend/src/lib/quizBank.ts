import type { QuizQuestion, JobRole } from './types';

export interface QuizTopic {
  id: string;
  title: string;
  domain: string;
  source: string;
  /** Roles this quiz is tailored for. If omitted, applies to all roles. */
  roles?: JobRole[];
  questions: QuizQuestion[];
}

export const QUIZ_TOPICS: QuizTopic[] = [
  // ===================== STATISTICAL ROLE QUIZZES =====================
  {
    id: 'sampling',
    title: 'Sampling Design & Survey Methodology',
    domain: 'Statistical',
    source: 'NSSTA Reference Manual — Sampling Techniques',
    roles: ['SSO', 'JSO', 'ISS Officer'],
    questions: [
      {
        id: 'q1',
        question: 'In stratified random sampling, what is the primary reason for stratifying the population?',
        options: [
          'To reduce the total number of units sampled',
          'To ensure representation of key subgroups and reduce sampling variance',
          'To simplify data collection logistics',
          'To eliminate the need for a sampling frame',
        ],
        correctIndex: 1,
        explanation: 'Stratification divides the population into homogeneous subgroups so that every important subgroup is represented, which typically lowers the overall sampling variance compared with simple random sampling.',
      },
      {
        id: 'q2',
        question: 'Which sampling method gives every possible sample of size n an equal probability of selection?',
        options: ['Systematic sampling', 'Cluster sampling', 'Simple random sampling', 'Quota sampling'],
        correctIndex: 2,
        explanation: 'In simple random sampling each possible combination of n units has the same probability of being selected, which is the defining property of the method.',
      },
      {
        id: 'q3',
        question: 'The design effect (deff) compares the variance of a complex design to which baseline?',
        options: ['A census', 'Simple random sampling of the same size', 'Stratified sampling with proportional allocation', 'Systematic sampling'],
        correctIndex: 1,
        explanation: 'The design effect is the ratio of the variance of an estimator under the actual sample design to its variance under simple random sampling with the same sample size.',
      },
      {
        id: 'q4',
        question: 'In two-phase (double) sampling, why is a large initial sample drawn first?',
        options: [
          'To collect detailed variables for every unit',
          'To estimate auxiliary information used to stratify or weight a smaller second-phase sample',
          'To replace non-respondents',
          'To reduce non-sampling errors',
        ],
        correctIndex: 1,
        explanation: 'Two-phase sampling first collects cheap auxiliary variables on a large sample, then uses that information to stratify or ratio-calibrate a smaller, more expensive second-phase subsample.',
      },
      {
        id: 'q5',
        question: 'Which allocation rule for stratified samples minimises variance for a fixed total cost when costs per unit are equal across strata?',
        options: ['Equal allocation', 'Proportional allocation', 'Neyman (optimum) allocation', 'Disproportional random allocation'],
        correctIndex: 2,
        explanation: 'Neyman allocation distributes the sample across strata in proportion to the stratum size times the stratum standard deviation, which minimises variance for a fixed cost when per-unit costs are equal.',
      },
    ],
  },
  {
    id: 'national-accounts',
    title: 'National Accounts & GDP Compilation',
    domain: 'Statistical',
    source: 'MoSPI — National Accounts Statistics Manual',
    roles: ['JSO', 'ISS Officer'],
    questions: [
      {
        id: 'na1',
        question: 'In the production approach, GDP is calculated as the sum of which component across all industries?',
        options: ['Final consumption', 'Gross value added at basic prices plus taxes less subsidies on products', 'Compensation of employees', 'Imports of goods and services'],
        correctIndex: 1,
        explanation: 'The production approach sums gross value added (output minus intermediate consumption) across industries and adds taxes less subsidies on products to arrive at GDP.',
      },
      {
        id: 'na2',
        question: 'A supply-use table (SUT) is primarily used to reconcile which three estimates of GDP?',
        options: ['Quarterly, annual and regional', 'Production, expenditure and income', 'Nominal, real and seasonal', 'Central, state and district'],
        correctIndex: 1,
        explanation: 'The SUT balances the production, expenditure and income estimates of GDP in a single consistent framework, which is why it is the cornerstone of national accounts compilation.',
      },
      {
        id: 'na3',
        question: 'Which price index is most commonly used to deflate nominal GDP to real GDP in India?',
        options: ['Consumer Price Index for Industrial Workers', 'GDP deflator derived from the SUT', 'Wholesale Price Index only', 'Sensex'],
        correctIndex: 1,
        explanation: 'India derives real GDP by deflating each component of the SUT using detailed price indices, producing the GDP deflator rather than relying on a single external price index.',
      },
      {
        id: 'na4',
        question: 'What is the main purpose of quarterly GDP advance estimates?',
        options: ['To replace the annual estimates', 'To provide timely, policy-relevant indicators using available high-frequency indicators', 'To revise the base year', 'To calculate tax revenue'],
        correctIndex: 1,
        explanation: 'Advance quarterly estimates use high-frequency indicators (IIP, CPI, government expenditure) to give an early read of GDP for policy, and are later reconciled with annual SUT-based estimates.',
      },
    ],
  },
  {
    id: 'mospi-frameworks',
    title: 'MoSPI Frameworks & Data Quality',
    domain: 'Statistical',
    source: 'MoSPI — Statistical Quality Assurance Framework',
    roles: ['SSO', 'ISS Officer'],
    questions: [
      {
        id: 'mf1',
        question: 'What does the MoSPI SQAF primarily ensure?',
        options: ['That all data is collected digitally', 'That statistical outputs meet defined quality dimensions across the production lifecycle', 'That all surveys use the same questionnaire', 'That data is published within 24 hours'],
        correctIndex: 1,
        explanation: 'The Statistical Quality Assurance Framework (SQAF) ensures that statistical outputs satisfy quality dimensions — relevance, accuracy, timeliness, accessibility, coherence and methodological soundness — throughout the production lifecycle.',
      },
      {
        id: 'mf2',
        question: 'Which core quality dimension addresses whether the statistics measure what they claim to measure?',
        options: ['Timeliness', 'Accuracy', 'Accessibility', 'Coherence'],
        correctIndex: 1,
        explanation: 'Accuracy refers to the closeness of estimates to their true values — whether the statistics actually measure what they purport to measure, including sampling and non-sampling error assessment.',
      },
      {
        id: 'mf3',
        question: 'Under the NSSO multi-stage design, what is typically the ultimate sampling stage?',
        options: ['State', 'District', 'Village / Urban Frame Survey (UFS) block', 'Household'],
        correctIndex: 3,
        explanation: 'In the NSSO multi-stage design, villages or UFS blocks are selected at the penultimate stage, and households are the ultimate stage units from which data is collected.',
      },
    ],
  },
  // ===================== FULL STACK DEVELOPER =====================
  {
    id: 'fsd-react',
    title: 'React Fundamentals & Component Architecture',
    domain: 'Technical',
    source: 'iGOT Karmayogi — Modern Web Development',
    roles: ['Full Stack Developer', 'Software Engineer'],
    questions: [
      {
        id: 'react1',
        question: 'What is the primary purpose of the useState hook in React?',
        options: ['To fetch data from an API', 'To add stateful logic to functional components', 'To define CSS styles', 'To create context providers'],
        correctIndex: 1,
        explanation: 'useState lets functional components hold and update local state between renders, returning the current value and a setter that triggers a re-render.',
      },
      {
        id: 'react2',
        question: 'Which pattern avoids unnecessary re-renders of a child component when its props have not changed?',
        options: ['useEffect with empty deps', 'React.memo', 'useReducer', 'ReactDOM.createPortal'],
        correctIndex: 1,
        explanation: 'React.memo is a higher-order component that memoises the rendered output, skipping re-renders when the incoming props are shallowly equal to the previous ones.',
      },
      {
        id: 'react3',
        question: 'In a controlled form component, where does the source of truth for input values live?',
        options: ['In the DOM', 'In React component state', 'In localStorage', 'In a CSS variable'],
        correctIndex: 1,
        explanation: 'In a controlled component the input\u2019s value is driven by React state, making React the single source of truth and enabling validation and conditional rendering.',
      },
      {
        id: 'react4',
        question: 'What problem does the key prop solve when rendering lists?',
        options: ['It styles list items', 'It helps React identify which items changed, were added, or removed', 'It encrypts list data', 'It sorts the list automatically'],
        correctIndex: 1,
        explanation: 'Keys give list items a stable identity so React\u2019s reconciler can match children across renders, avoiding unnecessary DOM mutation and state leakage.',
      },
    ],
  },
  {
    id: 'fsd-node-apis',
    title: 'Node.js & REST API Design',
    domain: 'Technical',
    source: 'NSSTA — Backend Engineering for Government Platforms',
    roles: ['Full Stack Developer', 'Software Engineer'],
    questions: [
      {
        id: 'node1',
        question: 'What does the Express middleware signature (req, res, next) enable?',
        options: ['Database connection pooling', 'Chaining request processing functions that can read/modify the request and pass control via next()', 'CSS preprocessing', 'Client-side routing'],
        correctIndex: 1,
        explanation: 'Express middleware functions receive req, res, and next, allowing them to inspect or transform the request, send a response, or call next() to pass control to the next handler in the chain.',
      },
      {
        id: 'node2',
        question: 'Which HTTP status code indicates a successful resource creation?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctIndex: 1,
        explanation: '201 Created is returned when a POST request successfully creates a new resource, often with a Location header pointing to the new resource\u2019s URI.',
      },
      {
        id: 'node3',
        question: 'What is the purpose of the async/await pattern in Node.js API handlers?',
        options: ['To block the event loop until I/O completes', 'To write asynchronous code that reads synchronously without callback nesting', 'To increase CPU usage', 'To replace all loops'],
        correctIndex: 1,
        explanation: 'async/await lets you write promise-based asynchronous code that looks sequential, avoiding deeply nested callbacks (callback hell) while still being non-blocking under the hood.',
      },
      {
        id: 'node4',
        question: 'Which REST principle states that each resource should have a unique URI?',
        options: ['Statelessness', 'Resource identification through URIs', 'Layered system', 'Code on demand'],
        correctIndex: 1,
        explanation: 'In REST, every resource is identified by a stable URI (e.g. /api/surveys/42), and interactions with that resource happen via standard HTTP verbs on that URI.',
      },
    ],
  },
  {
    id: 'fsd-system-design',
    title: 'System Design for Scalable Platforms',
    domain: 'Technical',
    source: 'iGOT Karmayogi — Architecture for e-Gov Systems',
    roles: ['Full Stack Developer', 'Software Engineer', 'Cloud & DevOps Engineer'],
    questions: [
      {
        id: 'sd1',
        question: 'What is the main benefit of a stateless API server in a horizontally scaled architecture?',
        options: ['It stores user sessions in memory', 'Any instance can handle any request, enabling easy horizontal scaling', 'It requires fewer database calls', 'It eliminates the need for caching'],
        correctIndex: 1,
        explanation: 'Stateless servers keep no per-client state in memory, so any instance can serve any request. This makes it trivial to add or remove instances behind a load balancer.',
      },
      {
        id: 'sd2',
        question: 'Which caching strategy writes data to both the cache and the database on every write?',
        options: ['Cache-aside', 'Write-through', 'Read-through', 'Write-behind'],
        correctIndex: 1,
        explanation: 'In write-through caching, every write goes to the cache and the database synchronously, ensuring strong consistency at the cost of write latency.',
      },
      {
        id: 'sd3',
        question: 'What is the primary purpose of a load balancer in a web architecture?',
        options: ['To encrypt traffic', 'To distribute incoming requests across multiple server instances', 'To store session data', 'To compile JavaScript'],
        correctIndex: 1,
        explanation: 'A load balancer sits in front of server instances and distributes incoming traffic across them, improving availability, throughput, and fault tolerance.',
      },
    ],
  },
  // ===================== AI/ML ENGINEER =====================
  {
    id: 'ml-python',
    title: 'Python for Machine Learning',
    domain: 'Technical',
    source: 'NSSTA — AI/ML for Official Statistics',
    roles: ['AI/ML Engineer', 'Data Engineer'],
    questions: [
      {
        id: 'py1',
        question: 'Which Python library is most commonly used for tensor computation and neural network training?',
        options: ['Pandas', 'Matplotlib', 'PyTorch', 'BeautifulSoup'],
        correctIndex: 2,
        explanation: 'PyTorch provides dynamic computational graphs and a rich autograd engine, making it the dominant library for research-grade deep learning and neural network training.',
      },
      {
        id: 'py2',
        question: 'What does the train_test_split function from scikit-learn do?',
        options: ['Splits features into categorical and numerical', 'Divides a dataset into training and evaluation subsets', 'Normalises features to zero mean', 'Performs cross-validation'],
        correctIndex: 1,
        explanation: 'train_test_split randomly partitions a dataset into training and testing sets so a model can be trained on one and evaluated on the other, guarding against overfitting.',
      },
      {
        id: 'py3',
        question: 'Which technique prevents overfitting by penalising large weights in a neural network?',
        options: ['Dropout', 'Weight decay (L2 regularisation)', 'Batch normalisation', 'Data augmentation'],
        correctIndex: 1,
        explanation: 'Weight decay (L2 regularisation) adds a penalty proportional to the squared magnitude of weights to the loss, discouraging overly large weights and reducing overfitting.',
      },
      {
        id: 'py4',
        question: 'What is gradient descent optimising in a supervised learning model?',
        options: ['The number of features', 'The loss function with respect to model parameters', 'The learning rate', 'The batch size'],
        correctIndex: 1,
        explanation: 'Gradient descent iteratively updates model parameters in the direction that reduces the loss function, using the gradient of the loss with respect to those parameters.',
      },
    ],
  },
  {
    id: 'ml-deployment',
    title: 'Model Deployment & MLOps',
    domain: 'Technical',
    source: 'iGOT Karmayogi — MLOps for Government AI',
    roles: ['AI/ML Engineer'],
    questions: [
      {
        id: 'mld1',
        question: 'What is model drift in production ML systems?',
        options: ['A model losing source code', 'The statistical properties of input data or the target changing over time, degrading model performance', 'A hardware failure in the GPU', 'A version control conflict'],
        correctIndex: 1,
        explanation: 'Model drift occurs when the real-world data distribution shifts from what the model was trained on (data drift) or the relationship between features and target changes (concept drift), causing performance degradation.',
      },
      {
        id: 'mld2',
        question: 'Which practice is essential for reproducible ML model deployments?',
        options: ['Hardcoding hyperparameters', 'Versioning datasets, model code, and model artefacts together', 'Using only the latest framework version', 'Deploying without testing'],
        correctIndex: 1,
        explanation: 'Reproducible deployments require versioning the data, code, hyperparameters, and resulting model artefacts (e.g. via MLflow or DVC) so any model can be traced and rebuilt.',
      },
      {
        id: 'mld3',
        question: 'What is the purpose of a feature store in an MLOps pipeline?',
        options: ['To store raw images', 'To centralise, version, and serve consistent features for training and inference', 'To replace the database', 'To generate synthetic data'],
        correctIndex: 1,
        explanation: 'A feature store centralises feature definitions, computes and stores them with versioning, and serves them consistently to both training pipelines and online inference, avoiding training/serving skew.',
      },
    ],
  },
  {
    id: 'ml-nlp-cv',
    title: 'NLP & Computer Vision Essentials',
    domain: 'Technical',
    source: 'NSSTA — Deep Learning Specialisation',
    roles: ['AI/ML Engineer'],
    questions: [
      {
        id: 'nlp1',
        question: 'What does a transformer attention mechanism compute?',
        options: ['The loss gradient', 'Weighted relevance of each token to every other token', 'The number of layers', 'The vocabulary size'],
        correctIndex: 1,
        explanation: 'Self-attention computes a weighted sum of value vectors where weights are derived from query-key similarity, letting each token attend to all others and capture long-range dependencies.',
      },
      {
        id: 'nlp2',
        question: 'Which technique is used to convert text into numerical vectors for machine learning?',
        options: ['Tokenisation only', 'Embedding (e.g. word2vec, TF-IDF, BERT embeddings)', 'Stemming', 'Lemmatisation'],
        correctIndex: 1,
        explanation: 'Embeddings map tokens or sentences to dense numerical vectors in a continuous space, capturing semantic relationships that ML models can operate on.',
      },
      {
        id: 'cv1',
        question: 'What operation does a convolutional filter perform in a CNN?',
        options: ['It pools the entire image', 'It slides over the input computing element-wise multiplications and summing the result', 'It normalises pixel values', 'It adds colour channels'],
        correctIndex: 1,
        explanation: 'A convolutional filter slides (convolves) across the input, computing the dot product of its weights with each local patch, producing a feature map that captures spatial patterns like edges and textures.',
      },
      {
        id: 'cv2',
        question: 'What does data augmentation achieve in computer vision training?',
        options: ['Reduces training time', 'Artificially increases dataset size and diversity to improve generalisation', 'Compresses images', 'Replaces the need for a validation set'],
        correctIndex: 1,
        explanation: 'Data augmentation creates modified copies of training images (flips, crops, rotations, colour jitter) so the model sees more varied data, improving robustness and generalisation.',
      },
    ],
  },
  // ===================== DATA ENGINEER =====================
  {
    id: 'de-sql',
    title: 'SQL & Relational Data Management',
    domain: 'Technical',
    source: 'NSSTA — Data Engineering Foundations',
    roles: ['Data Engineer', 'Full Stack Developer', 'Software Engineer'],
    questions: [
      {
        id: 'sql1',
        question: 'What does the SQL JOIN clause on two tables produce?',
        options: ['A union of all rows', 'A result set combining columns from both tables based on a related column', 'A difference of rows', 'A sorted list of one table'],
        correctIndex: 1,
        explanation: 'A JOIN combines rows from two or more tables based on a related column (typically a foreign key), producing a wider result set with columns from all joined tables.',
      },
      {
        id: 'sql2',
        question: 'Which SQL clause filters groups created by GROUP BY?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
        correctIndex: 1,
        explanation: 'HAVING filters groups after aggregation, whereas WHERE filters individual rows before grouping. HAVING can reference aggregate functions like COUNT() and SUM().',
      },
      {
        id: 'sql3',
        question: 'What is a CTE (Common Table Expression) used for?',
        options: ['Creating permanent tables', 'Defining a temporary named result set that improves query readability and reuse', 'Encrypting data', 'Importing CSV files'],
        correctIndex: 1,
        explanation: 'A CTE (WITH clause) defines a temporary named result set visible within a single statement, making complex queries more readable and enabling recursive queries.',
      },
      {
        id: 'sql4',
        question: 'Which normal form eliminates transitive dependencies?',
        options: ['1NF', '2NF', '3NF', '4NF'],
        correctIndex: 2,
        explanation: 'Third Normal Form (3NF) removes transitive dependencies — where a non-key attribute depends on another non-key attribute — ensuring every non-key column depends only on the primary key.',
      },
    ],
  },
  {
    id: 'de-etl-bigdata',
    title: 'ETL Pipelines & Big Data Processing',
    domain: 'Technical',
    source: 'iGOT Karmayogi — Big Data for Government',
    roles: ['Data Engineer', 'AI/ML Engineer'],
    questions: [
      {
        id: 'etl1',
        question: 'In an ETL pipeline, what does the Transform stage do?',
        options: ['Extracts data from source systems', 'Cleans, validates, and reshapes extracted data into the target schema', 'Loads data into the warehouse', 'Backs up the source database'],
        correctIndex: 1,
        explanation: 'The Transform stage applies cleaning, validation, deduplication, type conversion, and business logic to convert raw extracted data into the structure required by the target.',
      },
      {
        id: 'etl2',
        question: 'What is the primary advantage of Apache Spark over Hadoop MapReduce?',
        options: ['It uses disk-based processing exclusively', 'In-memory computation that dramatically speeds up iterative and batch workloads', 'It does not support SQL', 'It requires fewer nodes'],
        correctIndex: 1,
        explanation: 'Spark processes data in-memory using RDDs/DataFrames, avoiding the disk I/O bottleneck of MapReduce and enabling much faster iterative, batch, and streaming workloads.',
      },
      {
        id: 'etl3',
        question: 'What is idempotency in the context of a data pipeline?',
        options: ['The pipeline runs only once', 'Running the pipeline multiple times produces the same result without duplicating data', 'The pipeline uses a single thread', 'The pipeline has no dependencies'],
        correctIndex: 1,
        explanation: 'An idempotent pipeline can be re-run safely — re-executing a task with the same inputs yields the same output without creating duplicates or corrupting existing data, which is essential for recovery.',
      },
      {
        id: 'etl4',
        question: 'What is a data lake primarily designed to store?',
        options: ['Only structured data', 'Raw, unstructured, and semi-structured data at scale, often in its native format', 'Only metadata', 'Only aggregated reports'],
        correctIndex: 1,
        explanation: 'A data lake stores raw data in its native format (structured, semi-structured, unstructured) at scale, enabling flexible downstream processing and analytics without upfront schema enforcement.',
      },
    ],
  },
  {
    id: 'de-warehousing',
    title: 'Data Warehousing & Dimensional Modelling',
    domain: 'Technical',
    source: 'NSSTA — Data Warehouse Design',
    roles: ['Data Engineer'],
    questions: [
      {
        id: 'dw1',
        question: 'In a star schema, what does a fact table contain?',
        options: ['Descriptive attributes about entities', 'Quantitative measures and foreign keys to dimension tables', 'Only primary keys', 'Only metadata'],
        correctIndex: 1,
        explanation: 'The fact table holds measurable, numeric facts (e.g. survey response counts) and foreign keys referencing dimension tables, forming the centre of a star schema.',
      },
      {
        id: 'dw2',
        question: 'What is a slowly changing dimension (SCD) Type 2?',
        options: ['Deleting old values', 'Preserving historical attribute changes by adding new rows with effective dates', 'Ignoring changes', 'Overwriting values in place'],
        correctIndex: 1,
        explanation: 'SCD Type 2 tracks historical changes by inserting a new row with updated attribute values and effective/from-to dates, preserving full history for time-based analysis.',
      },
      {
        id: 'dw3',
        question: 'What is the purpose of a staging area in a data warehouse?',
        options: ['To serve dashboards directly', 'To temporarily hold and clean extracted data before loading into the warehouse', 'To encrypt the database', 'To replace ETL'],
        correctIndex: 1,
        explanation: 'The staging area is an intermediate storage zone where extracted source data is held, cleaned, and transformed before being loaded into the warehouse proper, isolating source systems from the warehouse.',
      },
    ],
  },
  // ===================== CLOUD & DEVOPS / CYBERSECURITY =====================
  {
    id: 'cloud-infra',
    title: 'Cloud Infrastructure & Services',
    domain: 'Technical',
    source: 'iGOT Karmayogi — Cloud for e-Governance',
    roles: ['Cloud & DevOps Engineer', 'Software Engineer'],
    questions: [
      {
        id: 'ci1',
        question: 'What is the key difference between IaaS and PaaS cloud service models?',
        options: ['IaaS is free; PaaS is paid', 'IaaS provides virtualised infrastructure; PaaS provides a managed platform for deploying applications', 'IaaS is for databases only; PaaS is for networking', 'There is no difference'],
        correctIndex: 1,
        explanation: 'IaaS (e.g. EC2 VMs) gives you virtualised compute/network/storage you manage yourself. PaaS (e.g. App Engine) provides a managed runtime where you deploy code and the provider handles the OS, scaling, and patching.',
      },
      {
        id: 'ci2',
        question: 'What does Infrastructure as Code (IaC) enable?',
        options: ['Writing application code in Python', 'Provisioning and managing cloud resources through declarative configuration files', 'Compiling C code', 'Writing documentation'],
        correctIndex: 1,
        explanation: 'IaC tools like Terraform let you define cloud infrastructure in declarative files that are versioned, reviewed, and reproducibly applied, replacing manual console provisioning.',
      },
      {
        id: 'ci3',
        question: 'What is the purpose of a CI/CD pipeline?',
        options: ['To manually deploy code to production', 'To automate building, testing, and deploying code changes through to production', 'To monitor server CPU', 'To write unit tests'],
        correctIndex: 1,
        explanation: 'A CI/CD pipeline automatically builds, runs tests, and deploys code changes, ensuring that every change is validated and delivered consistently, reducing manual errors and release risk.',
      },
      {
        id: 'ci4',
        question: 'Which Kubernetes object manages a desired number of identical pod replicas?',
        options: ['ConfigMap', 'Deployment', 'Namespace', 'Ingress'],
        correctIndex: 1,
        explanation: 'A Deployment declares a desired replica count and pod template; the controller continuously reconciles actual pods to match, handling scaling and rollouts.',
      },
    ],
  },
  {
    id: 'cloud-security',
    title: 'Network Security & Data Privacy',
    domain: 'Digital Governance',
    source: 'iGOT Karmayogi — Cybersecurity for Government Systems',
    roles: ['Cloud & DevOps Engineer', 'Software Engineer'],
    questions: [
      {
        id: 'sec1',
        question: 'What is the principle of least privilege in access control?',
        options: ['Giving every user admin access', 'Granting users only the minimum permissions needed to perform their role', 'Sharing passwords among team members', 'Disabling all authentication'],
        correctIndex: 1,
        explanation: 'Least privilege limits each user or service to only the access they need, reducing the blast radius of compromised credentials and preventing accidental or malicious misuse.',
      },
      {
        id: 'sec2',
        question: 'What does the Indian Digital Personal Data Protection (DPDP) Act primarily regulate?',
        options: ['Software licensing', 'The processing of personal data, establishing duties for data fiduciaries and rights for data principals', 'Cloud pricing', 'Government procurement'],
        correctIndex: 1,
        explanation: 'The DPDP Act 2023 regulates how personal data is collected, processed, and stored in India, imposing obligations on data fiduciaries (organisations) and granting rights to data principals (individuals).',
      },
      {
        id: 'sec3',
        question: 'Which attack does HTTPS protect against by encrypting traffic in transit?',
        options: ['SQL injection', 'Man-in-the-middle (MITM) eavesdropping', 'Brute force password attacks', 'Cross-site scripting (XSS)'],
        correctIndex: 1,
        explanation: 'HTTPS encrypts the communication channel, preventing a man-in-the-middle from reading or tampering with data in transit between client and server.',
      },
      {
        id: 'sec4',
        question: 'What is the purpose of a Web Application Firewall (WAF)?',
        options: ['To speed up web pages', 'To filter and monitor HTTP traffic, blocking common web exploits like SQL injection and XSS', 'To compress images', 'To manage DNS records'],
        correctIndex: 1,
        explanation: 'A WAF inspects incoming HTTP traffic and blocks malicious requests — such as SQL injection, XSS, and CSRF — before they reach the application, operating at layer 7.',
      },
    ],
  },
  // ===================== GIS SPECIALIST =====================
  {
    id: 'gis-spatial',
    title: 'GIS & Spatial Data Engineering',
    domain: 'Technical',
    source: 'NSSTA — Spatial Data for Administrators',
    roles: ['GIS Specialist', 'Data Engineer'],
    questions: [
      {
        id: 'gis1',
        question: 'What does PostGIS add to PostgreSQL?',
        options: ['Full-text search', 'Spatial data types, spatial indexes, and spatial query functions', 'Replication', 'JSON storage'],
        correctIndex: 1,
        explanation: 'PostGIS extends PostgreSQL with geometry/geography types, spatial indexes (GiST), and hundreds of spatial functions (ST_Within, ST_Distance, ST_Buffer), turning it into a spatial database.',
      },
      {
        id: 'gis2',
        question: 'What is the difference between vector and raster spatial data?',
        options: ['Vector is 3D; raster is 2D', 'Vector uses points, lines, and polygons; raster uses a grid of cells with values', 'Vector is faster; raster is slower', 'They are the same'],
        correctIndex: 1,
        explanation: 'Vector data represents features as discrete geometries (points, lines, polygons), while raster data represents continuous surfaces as a grid of cells (pixels), each holding a value such as temperature or elevation.',
      },
      {
        id: 'gis3',
        question: 'What is geocoding?',
        options: ['Encrypting geographic data', 'Converting addresses or place names into geographic coordinates (latitude/longitude)', 'Compressing map images', 'Styling map layers'],
        correctIndex: 1,
        explanation: 'Geocoding transforms human-readable addresses into geographic coordinates, enabling them to be placed on a map and used in spatial analysis.',
      },
      {
        id: 'gis4',
        question: 'Which spatial join finds all points within a polygon?',
        options: ['ST_Union', 'ST_Within (or ST_Intersects)', 'ST_Distance', 'ST_Area'],
        correctIndex: 1,
        explanation: 'ST_Within returns true when a geometry is completely inside another, and ST_Intersects returns true when they share any space — both are commonly used in spatial joins to find points within polygons.',
      },
    ],
  },
  // ===================== SHARED / ALL ROLES =====================
  {
    id: 'digital-governance',
    title: 'Digital Governance & Data Portals',
    domain: 'Digital Governance',
    source: 'iGOT Karmayogi — e-Governance Fundamentals',
    questions: [
      {
        id: 'dg1',
        question: 'What is the role of API Setu in India\u2019s digital governance ecosystem?',
        options: ['A payment gateway', 'A unified open API platform enabling interoperability across government systems', 'A data storage service', 'A citizen grievance portal'],
        correctIndex: 1,
        explanation: 'API Setu is the Government of India\u2019s open API platform that publishes and manages APIs so that different departmental systems can interoperate in a standardised way.',
      },
      {
        id: 'dg2',
        question: 'Which standard describes the SDMX data exchange format used by national statistical offices?',
        options: ['Statistical Data and Metadata eXchange', 'Simple Data Markup XML', 'Systematic Data Model eXtension', 'Standard Data Management eXchange'],
        correctIndex: 0,
        explanation: 'SDMX stands for Statistical Data and Metadata eXchange, an ISO standard (ISO 17369) for exchanging statistical data and metadata between organisations.',
      },
      {
        id: 'dg3',
        question: 'In the India Stack, which component provides a digital identity that underpins many statistical and governance use-cases?',
        options: ['UPI', 'Aadhaar', 'DigiLocker', 'e-Sanjeevani'],
        correctIndex: 1,
        explanation: 'Aadhaar provides a unique 12-digit digital identity and is the foundational identity layer of the India Stack that many other services build on.',
      },
    ],
  },
  {
    id: 'ethics',
    title: 'Ethics & Communication of Statistics',
    domain: 'Behavioural',
    source: 'UN Fundamental Principles of Official Statistics',
    questions: [
      {
        id: 'e1',
        question: 'How many Fundamental Principles of Official Statistics were adopted by the UN Statistical Commission?',
        options: ['5', '7', '10', '12'],
        correctIndex: 2,
        explanation: 'The UN Statistical Commission adopted 10 Fundamental Principles of Official Statistics in 1994, covering relevance, impartiality, professionalism, prevention of misuse, sources, confidentiality, legislation, coordination, standards and international cooperation.',
      },
      {
        id: 'e2',
        question: 'Under the principle of confidentiality, statistical agencies may release identifiable individual data only when?',
        options: ['When requested by another ministry', 'When consent is obtained or when data are aggregated so no unit is identifiable', 'Never under any circumstance', 'When the media requests it'],
        correctIndex: 1,
        explanation: 'Confidentiality allows release of individual data only with explicit consent or in aggregate form that prevents identification of any statistical unit.',
      },
      {
        id: 'e3',
        question: 'What does the principle of impartiality require of official statisticians?',
        options: ['To prioritise data that supports government policy', 'To compile and release statistics on an objective and professional basis, free from political influence', 'To withhold data that may be unfavourable', 'To release data only after ministerial approval'],
        correctIndex: 1,
        explanation: 'Impartiality requires that statistics are produced and disseminated objectively and professionally, independent of political or other external influence.',
      },
    ],
  },
];

// ===================== PDF / TEXT-BASED QUIZ GENERATION =====================

/**
 * Generate a quiz from raw document text. Extracts key sentences, then
 * creates fill-in-the-blank style multiple-choice questions by removing a
 * key term from each sentence and offering it alongside distractors drawn
 * from other terms in the document.
 */
export function generateQuizFromText(
  text: string,
  sourceName: string,
  count = 5,
): QuizTopic {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 300 && /\b(is|are|was|were|means|refers|defined|involves|includes|consists|requires|uses|provides|ensures|describes)\b/i.test(s));

  // Collect candidate "key terms" — capitalized phrases or technical terms
  const termRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g;
  const allTerms = new Set<string>();
  for (const s of sentences) {
    const matches = s.match(termRegex);
    if (matches) matches.forEach((m) => { if (m.length > 3) allTerms.add(m); });
  }
  const termPool = [...allTerms];

  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<string>();

  for (const sentence of sentences) {
    if (questions.length >= count) break;
    if (usedSentences.has(sentence)) continue;

    // Find a key term in this sentence to blank out
    const termsInSentence = sentence.match(termRegex);
    if (!termsInSentence || termsInSentence.length === 0) continue;

    const answer = termsInSentence[0];
    if (answer.length < 4) continue;

    // Build the question by replacing the first occurrence of the answer
    const blanked = sentence.replace(answer, '_____');

    // Build distractors from other terms
    const distractors = termPool
      .filter((t) => t !== answer && !termsInSentence.includes(t))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(answer);

    usedSentences.add(sentence);
    questions.push({
      id: `pdf-q${questions.length + 1}`,
      question: `Fill in the blank: "${blanked}"`,
      options,
      correctIndex,
      explanation: `The correct answer is "${answer}". Based on the uploaded document: "${sentence}"`,
    });
  }

  // If we couldn't extract enough questions, pad with role-based practice
  if (questions.length === 0) {
    return {
      id: `pdf-${Date.now()}`,
      title: `Quiz from ${sourceName}`,
      domain: 'Document-Based',
      source: sourceName,
      questions: [{
        id: 'pdf-fallback',
        question: 'The uploaded document did not contain enough extractable text to generate quiz questions. Try uploading a text-based PDF or try the practice quiz instead.',
        options: ['Try the practice quiz', 'Upload a different file', 'Use role-based quizzes', 'All of the above'],
        correctIndex: 0,
        explanation: 'Text-heavy PDFs work best for auto-generating quiz questions. Scanned image PDFs cannot be parsed without OCR.',
      }],
    };
  }

  return {
    id: `pdf-${Date.now()}`,
    title: `Quiz from ${sourceName}`,
    domain: 'Document-Based',
    source: sourceName,
    questions,
  };
}

// ===================== ROLE-DRIVEN HELPERS =====================

/** Return quizzes tailored to a given job role. */
export function getQuizzesForRole(role: JobRole): QuizTopic[] {
  return QUIZ_TOPICS.filter(
    (t) => !t.roles || t.roles.includes(role),
  );
}

/**
 * Generate a practice quiz for a role by pulling a configurable number of
 * questions from the role's quiz pool. If the pool is too small, questions
 * are repeated. This simulates an AI-generated quiz without a PDF upload.
 */
export function generatePracticeQuiz(role: JobRole, count = 5): QuizTopic {
  const pool = getQuizzesForRole(role);
  // Flatten all questions from role-relevant quizzes
  const allQs = pool.flatMap((t) => t.questions);
  // Shuffle and take `count` questions (or all if fewer)
  const shuffled = [...allQs].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return {
    id: `practice-${role}-${Date.now()}`,
    title: `Practice Quiz for ${role}`,
    domain: 'Role-Generated',
    source: `Auto-generated from ${pool.length} role-specific quiz topics`,
    roles: [role],
    questions: selected,
  };
}

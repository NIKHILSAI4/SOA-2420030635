"""
Tech Skill Taxonomy & Ontology
Comprehensive mapping of canonical skill names, synonyms/aliases, categories, and related terms.
"""

SKILL_TAXONOMY = {
    # Programming Languages
    "java": {
        "canonical": "Java",
        "aliases": ["java 8", "java 11", "java 17", "java 21", "core java", "j2se", "j2ee"],
        "category": "LANGUAGE",
        "related": ["Spring Boot", "JVM", "Hibernate", "Kotlin", "Maven", "Gradle"]
    },
    "python": {
        "canonical": "Python",
        "aliases": ["python3", "python 3", "py"],
        "category": "LANGUAGE",
        "related": ["Django", "FastAPI", "Flask", "Pandas", "NumPy", "PyTorch", "TensorFlow"]
    },
    "javascript": {
        "canonical": "JavaScript",
        "aliases": ["js", "es6", "ecmascript", "vanilla js"],
        "category": "LANGUAGE",
        "related": ["TypeScript", "Node.js", "React", "Vue", "Angular", "HTML", "CSS"]
    },
    "typescript": {
        "canonical": "TypeScript",
        "aliases": ["ts"],
        "category": "LANGUAGE",
        "related": ["JavaScript", "React", "Angular", "Node.js", "NestJS"]
    },
    "c++": {
        "canonical": "C++",
        "aliases": ["cpp", "c plus plus"],
        "category": "LANGUAGE",
        "related": ["C", "C#", "STL", "Data Structures"]
    },
    "c#": {
        "canonical": "C#",
        "aliases": ["csharp", "c sharp", ".net c#"],
        "category": "LANGUAGE",
        "related": [".NET", ".NET Core", "ASP.NET", "Entity Framework"]
    },
    "go": {
        "canonical": "Go",
        "aliases": ["golang"],
        "category": "LANGUAGE",
        "related": ["Docker", "Kubernetes", "Microservices", "gRPC"]
    },
    "rust": {
        "canonical": "Rust",
        "aliases": ["rust-lang"],
        "category": "LANGUAGE",
        "related": ["WebAssembly", "C++", "Systems Programming"]
    },
    "sql": {
        "canonical": "SQL",
        "aliases": ["structured query language", "ansi sql"],
        "category": "LANGUAGE",
        "related": ["PostgreSQL", "MySQL", "Oracle", "Database Management"]
    },

    # Frameworks & Backend
    "spring boot": {
        "canonical": "Spring Boot",
        "aliases": ["spring", "spring framework", "spring cloud", "spring security", "spring data"],
        "category": "BACKEND_FRAMEWORK",
        "related": ["Java", "Hibernate", "Microservices", "REST API", "Eureka", "Gateway"]
    },
    "django": {
        "canonical": "Django",
        "aliases": ["django rest framework", "drf"],
        "category": "BACKEND_FRAMEWORK",
        "related": ["Python", "PostgreSQL", "REST API", "FastAPI"]
    },
    "fastapi": {
        "canonical": "FastAPI",
        "aliases": ["fast api"],
        "category": "BACKEND_FRAMEWORK",
        "related": ["Python", "Pydantic", "Uvicorn", "AsyncIO", "REST API"]
    },
    "nodejs": {
        "canonical": "Node.js",
        "aliases": ["node", "node js", "nodejs"],
        "category": "BACKEND_FRAMEWORK",
        "related": ["Express.js", "JavaScript", "TypeScript", "NPM", "NestJS"]
    },
    "expressjs": {
        "canonical": "Express.js",
        "aliases": ["express", "express js"],
        "category": "BACKEND_FRAMEWORK",
        "related": ["Node.js", "REST API", "JavaScript", "MongoDB"]
    },
    "react": {
        "canonical": "React",
        "aliases": ["react.js", "reactjs", "react js"],
        "category": "FRONTEND_FRAMEWORK",
        "related": ["JavaScript", "TypeScript", "Redux", "Next.js", "HTML", "CSS", "Vite"]
    },
    "angular": {
        "canonical": "Angular",
        "aliases": ["angular.js", "angularjs", "angular 2+", "angular io"],
        "category": "FRONTEND_FRAMEWORK",
        "related": ["TypeScript", "RxJS", "HTML", "CSS"]
    },
    "vue": {
        "canonical": "Vue.js",
        "aliases": ["vue", "vuejs", "vue js", "vue 3"],
        "category": "FRONTEND_FRAMEWORK",
        "related": ["JavaScript", "Nuxt.js", "HTML", "CSS"]
    },
    "nextjs": {
        "canonical": "Next.js",
        "aliases": ["next.js", "nextjs", "next js"],
        "category": "FRONTEND_FRAMEWORK",
        "related": ["React", "SSR", "TypeScript", "Node.js"]
    },

    # Databases
    "postgresql": {
        "canonical": "PostgreSQL",
        "aliases": ["postgres", "psql", "pgsql", "postgres db"],
        "category": "DATABASE",
        "related": ["SQL", "Relational Database", "MySQL", "Database Indexing"]
    },
    "mysql": {
        "canonical": "MySQL",
        "aliases": ["my sql", "mariadb"],
        "category": "DATABASE",
        "related": ["SQL", "PostgreSQL", "Relational Database"]
    },
    "mongodb": {
        "canonical": "MongoDB",
        "aliases": ["mongo", "mongo db", "nosql mongodb"],
        "category": "DATABASE",
        "related": ["NoSQL", "Document DB", "Mongoose", "Express.js"]
    },
    "redis": {
        "canonical": "Redis",
        "aliases": ["redis cache"],
        "category": "DATABASE",
        "related": ["Caching", "In-Memory Database", "Session Management"]
    },

    # Cloud & DevOps
    "docker": {
        "canonical": "Docker",
        "aliases": ["dockerfile", "docker compose", "containerization"],
        "category": "DEVOPS",
        "related": ["Kubernetes", "Microservices", "CI/CD", "Linux", "DevOps"]
    },
    "kubernetes": {
        "canonical": "Kubernetes",
        "aliases": ["k8s", "kube", "k8s cluster", "kubernetes cluster"],
        "category": "DEVOPS",
        "related": ["Docker", "Container Orchestration", "Helm", "Cloud Computing"]
    },
    "aws": {
        "canonical": "AWS",
        "aliases": ["amazon web services", "ec2", "s3", "lambda", "aws cloud"],
        "category": "CLOUD",
        "related": ["Cloud Computing", "DevOps", "GCP", "Azure", "Serverless"]
    },
    "azure": {
        "canonical": "Azure",
        "aliases": ["microsoft azure", "azure cloud"],
        "category": "CLOUD",
        "related": ["Cloud Computing", "AWS", "DevOps", "Active Directory"]
    },
    "gcp": {
        "canonical": "GCP",
        "aliases": ["google cloud", "google cloud platform"],
        "category": "CLOUD",
        "related": ["Cloud Computing", "AWS", "Kubernetes", "BigQuery"]
    },
    "ci/cd": {
        "canonical": "CI/CD",
        "aliases": ["continuous integration", "continuous deployment", "github actions", "jenkins", "gitlab ci"],
        "category": "DEVOPS",
        "related": ["Git", "Docker", "DevOps", "Automated Testing"]
    },
    "git": {
        "canonical": "Git",
        "aliases": ["github", "gitlab", "version control", "bitbucket"],
        "category": "TOOL",
        "related": ["CI/CD", "DevOps", "Software Engineering"]
    },

    # Messaging & Architecture
    "microservices": {
        "canonical": "Microservices",
        "aliases": ["microservice architecture", "soa", "service-oriented architecture", "distributed systems"],
        "category": "ARCHITECTURE",
        "related": ["Spring Boot", "Docker", "REST API", "Kafka", "Eureka", "API Gateway"]
    },
    "kafka": {
        "canonical": "Apache Kafka",
        "aliases": ["kafka", "event streaming", "message queue", "rabbitmq"],
        "category": "MESSAGING",
        "related": ["Event-Driven Architecture", "Microservices", "Distributed Systems"]
    },
    "rest api": {
        "canonical": "REST API",
        "aliases": ["restful api", "rest", "web api", "http api", "json api"],
        "category": "ARCHITECTURE",
        "related": ["HTTP", "Microservices", "Spring Boot", "FastAPI", "Swagger"]
    },

    # AI / ML
    "machine learning": {
        "canonical": "Machine Learning",
        "aliases": ["ml", "deep learning", "ai", "artificial intelligence"],
        "category": "AI_ML",
        "related": ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP"]
    },
    "nlp": {
        "canonical": "NLP",
        "aliases": ["natural language processing", "text mining", "spacy", "huggingface", "llm"],
        "category": "AI_ML",
        "related": ["Python", "Machine Learning", "Transformers", "BERT"]
    }
}

# Build inverse alias index for fast lookups
ALIAS_TO_CANONICAL = {}
for key, data in SKILL_TAXONOMY.items():
    canonical = data["canonical"]
    ALIAS_TO_CANONICAL[key] = canonical
    ALIAS_TO_CANONICAL[canonical.lower()] = canonical
    for alias in data.get("aliases", []):
        ALIAS_TO_CANONICAL[alias.lower()] = canonical

def get_canonical_skill(skill_str: str) -> str:
    cleaned = skill_str.strip().lower()
    return ALIAS_TO_CANONICAL.get(cleaned, skill_str.strip())

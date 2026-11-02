# AI-Powered Skill Matching Recruitment System

**Course:** Service-Oriented Architecture (SOA) — Review-2  
**Institution:** KLH CSE Bowrampet Campus, KL University  
**Batch:** 17  
**Team Members:**
- **K. Nikhil Sai** (2420030635)
- **Santosh** (2420030198)
- **Pranav Itharaju** (2420030538)  
**Guide:** Dr. Neelima Gogineni, Associate Professor, Department of CSE

---

## 🚀 Architecture Overview

This project implements an end-to-end, service-oriented recruitment platform featuring:
- **Service Discovery**: Spring Cloud Netflix Eureka Server (`:8761`)
- **API Gateway**: Spring Cloud Gateway (`:8080`) with centralized JWT validation filter & CORS
- **Authentication Service**: Spring Security 6, BCrypt, JWT, Role-Based Access Control (`:8081`)
- **Resume Ingestion Service**: Apache PDFBox text extraction, multipart uploads, async status tracking (`:8082`)
- **Job Specification Service**: Job description management, required/preferred skill weightings (`:8083`)
- **Matching & Ranking Service**: Explainable multi-factor scoring engine, OpenFeign clients, candidate ranking leaderboard (`:8084`)
- **NLP Intelligence Service**: Python FastAPI, 3,000+ technology skill ontology, named entity recognition, and vector cosine similarity scoring (`:8000`)
- **Frontend Dashboard**: React 18 + Vite, modern dark mode glassmorphism UI, interactive score breakdown drawers, candidate career portal, and recruiter control center (`:5173`)

---

## 🛠️ Quick Start

### Option 1: One-Click Docker Compose
Ensure Docker Desktop or Docker Engine is running:
```bash
docker compose up --build
```

### Option 2: Run Locally (Standalone / Development)

#### 1. Start Python NLP Service
```bash
cd nlp-service
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --port 8000 --reload
```

#### 2. Start Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```
*Access dashboard at:* `http://localhost:8761`

#### 3. Start API Gateway
```bash
cd api-gateway
mvn spring-boot:run
```
*Gateway running at:* `http://localhost:8080`

#### 4. Start Core Business Services
In separate terminal tabs:
```bash
# Auth Service (:8081)
cd auth-service && mvn spring-boot:run

# Job Service (:8083)
cd job-service && mvn spring-boot:run

# Resume Service (:8082)
cd resume-service && mvn spring-boot:run

# Matching Service (:8084)
cd matching-service && mvn spring-boot:run
```

#### 5. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open web application at:* `http://localhost:5173`

---

## 🧪 Testing & Verification

### Test NLP Service
```bash
cd nlp-service
pytest
```

### Build & Verify All Java Services
```bash
mvn clean test-compile
```

---

## 📋 Course Outcomes (CO) Demonstration
- **CO1 (Architecture)**: 6 independently deployable microservices with isolated database schemas (`auth_db`, `resume_db`, `job_db`, `match_db`).
- **CO2 (Security & Observability)**: Gateway JWT authentication filter, stateless security, Spring Boot Actuator `/actuator/health` endpoints.
- **CO3 (Discovery & Routing)**: Eureka Service Discovery with `lb://` routing, OpenFeign inter-service HTTP interfaces.
- **CO4 (Testing & CI/CD)**: GitHub Actions workflow (`.github/workflows/ci.yml`) and Docker Compose configuration.

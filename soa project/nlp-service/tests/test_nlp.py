from app.extractor import extract_skills_from_text, extract_experience_years
from app.similarity import find_best_skill_match, compute_overall_similarity

def test_skill_extraction_and_alias():
    text = "Proficient in Java 17, Spring Boot, K8s, and Postgres. Experienced in Docker and AWS."
    skills = extract_skills_from_text(text)
    assert "Java" in skills
    assert "Spring Boot" in skills
    assert "Kubernetes" in skills  # K8s mapped to Kubernetes
    assert "PostgreSQL" in skills  # Postgres mapped to PostgreSQL
    assert "Docker" in skills
    assert "AWS" in skills

def test_experience_extraction():
    text = "Senior Software Engineer with 4.5 years of experience in distributed systems."
    years = extract_experience_years(text)
    assert years == 4.5

def test_semantic_matching():
    # Candidate has Docker, job asks for Kubernetes -> related semantic match
    match = find_best_skill_match("Kubernetes", ["Docker", "Java", "PostgreSQL"])
    assert match["score"] >= 0.80
    assert match["matchType"] in ["EXACT", "SEMANTIC"]

def test_overall_similarity():
    job_skills = ["Java", "Spring Boot", "Kubernetes", "AWS"]
    candidate_skills = ["Java", "Spring Boot", "K8s"]
    result = compute_overall_similarity(job_skills, candidate_skills)
    assert result["overallSkillScore"] > 70.0
    assert "AWS" in result["missingSkills"]

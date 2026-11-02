import re
from typing import List, Dict, Set
from .taxonomy import SKILL_TAXONOMY, ALIAS_TO_CANONICAL, get_canonical_skill

DEGREE_PATTERNS = [
    r"\bB\.?Tech\b|\bBachelor of Technology\b",
    r"\bB\.?E\.?\b|\bBachelor of Engineering\b",
    r"\bM\.?Tech\b|\bMaster of Technology\b",
    r"\bM\.?S\.?\b|\bMaster of Science\b",
    r"\bB\.?S\.?c?\b|\bBachelor of Science\b",
    r"\bB\.?C\.?A\.?\b|\bM\.?C\.?A\.?\b",
    r"\bPh\.?D\.?\b|\bDoctor of Philosophy\b",
    r"\bComputer Science\b|\bInformation Technology\b|\bSoftware Engineering\b"
]

CERT_PATTERNS = [
    r"\bAWS Certified\s?[A-Za-z\s]*",
    r"\bGoogle Cloud Certified\s?[A-Za-z\s]*",
    r"\bAzure Certified\s?[A-Za-z\s]*",
    r"\bCertified Kubernetes Administrator\b|\bCKA\b",
    r"\bCertified Kubernetes Application Developer\b|\bCKAD\b",
    r"\bOracle Certified\s?[A-Za-z\s]*",
    r"\bCompTIA\s?[A-Za-z\+]*"
]

def clean_text(text: str) -> str:
    """Normalize whitespace and remove unwanted characters."""
    if not text:
        return ""
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()

def extract_experience_years(text: str) -> float:
    """Extract years of experience from textual indicators."""
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience",
        r"experience\s*:\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+in\s+software"
    ]
    max_exp = 0.0
    for pat in patterns:
        matches = re.finditer(pat, text, re.IGNORECASE)
        for m in matches:
            try:
                val = float(m.group(1))
                if 0.5 <= val <= 40.0 and val > max_exp:
                    max_exp = val
            except ValueError:
                pass

    # If no explicit "X years" phrase, search for year ranges (e.g. 2020 - 2024)
    if max_exp == 0.0:
        year_ranges = re.findall(r"\b(20[012]\d)\s*[-–to]+\s*(20[012]\d|present|current)\b", text, re.IGNORECASE)
        total_months = 0
        current_year = 2026
        for start_str, end_str in year_ranges:
            try:
                start = int(start_str)
                end = current_year if end_str.lower() in ["present", "current"] else int(end_str)
                if end >= start and (end - start) <= 30:
                    total_months += (end - start) * 12
            except ValueError:
                pass
        if total_months > 0:
            max_exp = round(total_months / 12.0, 1)

    return max_exp

def extract_skills_from_text(text: str) -> List[str]:
    """Scan text against skill taxonomy aliases with word boundary checks."""
    found_skills: Set[str] = set()
    lower_text = text.lower()

    # Sort aliases by length descending to match multi-word phrases first
    sorted_aliases = sorted(ALIAS_TO_CANONICAL.keys(), key=len, reverse=True)

    for alias in sorted_aliases:
        # Check boundary matching
        pattern = r"(?<![a-zA-Z0-9#+])" + re.escape(alias) + r"(?![a-zA-Z0-9#+]|\.[a-zA-Z])"
        if re.search(pattern, lower_text):
            canonical = ALIAS_TO_CANONICAL[alias]
            found_skills.add(canonical)

    return sorted(list(found_skills))

def extract_education(text: str) -> List[str]:
    """Identify degrees and university education mentions."""
    found = set()
    for pat in DEGREE_PATTERNS:
        matches = re.findall(pat, text, re.IGNORECASE)
        for m in matches:
            if isinstance(m, str) and m.strip():
                found.add(m.strip())
    return sorted(list(found))

def extract_certifications(text: str) -> List[str]:
    """Identify professional tech certifications."""
    found = set()
    for pat in CERT_PATTERNS:
        matches = re.findall(pat, text, re.IGNORECASE)
        for m in matches:
            if isinstance(m, str) and m.strip():
                found.add(m.strip())
    return sorted(list(found))

def categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    """Group extracted skills by category."""
    categories: Dict[str, List[str]] = {}
    for skill in skills:
        key = skill.lower()
        cat = "OTHER"
        if key in SKILL_TAXONOMY:
            cat = SKILL_TAXONOMY[key]["category"]
        else:
            for s_key, data in SKILL_TAXONOMY.items():
                if data["canonical"].lower() == key:
                    cat = data["category"]
                    break
        categories.setdefault(cat, []).append(skill)
    return categories

def parse_full_profile(raw_text: str) -> Dict:
    """Full parsing orchestration."""
    text = clean_text(raw_text)
    skills = extract_skills_from_text(text)
    exp = extract_experience_years(text)
    edu = extract_education(text)
    certs = extract_certifications(text)
    categories = categorize_skills(skills)

    return {
        "skills": skills,
        "skillCategories": categories,
        "experienceYears": exp,
        "education": edu,
        "certifications": certs,
        "projects": []
    }

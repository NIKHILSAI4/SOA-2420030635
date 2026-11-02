from typing import List, Dict
from .taxonomy import SKILL_TAXONOMY, get_canonical_skill

def compute_token_similarity(s1: str, s2: str) -> float:
    """Jaccard character 3-gram similarity for fuzzy matching."""
    s1_clean = s1.lower().replace(" ", "").replace(".", "").replace("-", "")
    s2_clean = s2.lower().replace(" ", "").replace(".", "").replace("-", "")

    if s1_clean == s2_clean:
        return 1.0

    if len(s1_clean) < 3 or len(s2_clean) < 3:
        return 1.0 if s1_clean == s2_clean else 0.0

    grams1 = set(s1_clean[i:i+3] for i in range(len(s1_clean) - 2))
    grams2 = set(s2_clean[i:i+3] for i in range(len(s2_clean) - 2))

    intersection = len(grams1 & grams2)
    union = len(grams1 | grams2)
    return round(intersection / union, 3) if union > 0 else 0.0

def find_best_skill_match(required_skill: str, candidate_skills: List[str]) -> Dict:
    """Find the best match for a required skill in candidate skills."""
    req_canonical = get_canonical_skill(required_skill)
    req_lower = req_canonical.lower()

    # 1. Check Exact Match
    for cand in candidate_skills:
        cand_canonical = get_canonical_skill(cand)
        if req_canonical.lower() == cand_canonical.lower():
            return {
                "matchedWith": cand_canonical,
                "score": 1.0,
                "matchType": "EXACT",
                "explanation": f"Exact match on {req_canonical}"
            }

    # 2. Check Taxonomy Related / Category Match
    req_data = SKILL_TAXONOMY.get(req_lower)
    if not req_data:
        # Try finding canonical in taxonomy
        for k, v in SKILL_TAXONOMY.items():
            if v["canonical"].lower() == req_lower:
                req_data = v
                break

    best_match = None
    best_score = 0.0
    best_type = "MISSING"
    best_explanation = f"Missing required skill: {req_canonical}"

    if req_data:
        related_skills = [r.lower() for r in req_data.get("related", [])]
        req_category = req_data.get("category")

        for cand in candidate_skills:
            cand_canonical = get_canonical_skill(cand)
            cand_lower = cand_canonical.lower()

            # Direct related tech (e.g. AWS -> Cloud Computing, Docker -> Kubernetes)
            if cand_lower in related_skills or cand_canonical in req_data.get("related", []):
                score = 0.88
                if score > best_score:
                    best_score = score
                    best_match = cand_canonical
                    best_type = "SEMANTIC"
                    best_explanation = f"Semantically related: candidate knows {cand_canonical} (related to {req_canonical})"

            # Same Category partial match
            cand_data = SKILL_TAXONOMY.get(cand_lower)
            if not cand_data:
                for k, v in SKILL_TAXONOMY.items():
                    if v["canonical"].lower() == cand_lower:
                        cand_data = v
                        break

            if cand_data and cand_data.get("category") == req_category and req_category not in ["LANGUAGE", "OTHER"]:
                score = 0.82
                if score > best_score:
                    best_score = score
                    best_match = cand_canonical
                    best_type = "SEMANTIC"
                    best_explanation = f"Domain equivalent: both belong to {req_category}"

    # 3. Fuzzy n-gram match
    for cand in candidate_skills:
        cand_canonical = get_canonical_skill(cand)
        sim = compute_token_similarity(req_canonical, cand_canonical)
        if sim > 0.80 and sim > best_score:
            best_score = sim
            best_match = cand_canonical
            best_type = "SEMANTIC"
            best_explanation = f"Morphological/spelling match ({cand_canonical} ≈ {req_canonical})"

    if best_score >= 0.80:
        return {
            "matchedWith": best_match,
            "score": round(best_score, 2),
            "matchType": best_type,
            "explanation": best_explanation
        }

    return {
        "matchedWith": None,
        "score": 0.0,
        "matchType": "MISSING",
        "explanation": f"Missing required skill: {req_canonical}"
    }

def compute_overall_similarity(job_skills: List[str], candidate_skills: List[str]) -> Dict:
    """Calculate the pairwise similarity matrix and aggregate metrics."""
    if not job_skills:
        return {
            "similarityMatrix": {},
            "overallSkillScore": 100.0,
            "matchedSkills": candidate_skills,
            "missingSkills": []
        }

    matrix = {}
    total_score = 0.0
    matched = []
    missing = []

    for req in job_skills:
        res = find_best_skill_match(req, candidate_skills)
        matrix[req] = res
        total_score += res["score"]
        if res["score"] >= 0.80:
            matched.append(req)
        else:
            missing.append(req)

    overall_skill_score = round((total_score / len(job_skills)) * 100.0, 1)

    return {
        "similarityMatrix": matrix,
        "overallSkillScore": overall_skill_score,
        "matchedSkills": matched,
        "missingSkills": missing
    }

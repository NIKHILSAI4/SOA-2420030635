from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import ExtractRequest, ExtractedProfile, SimilarityRequest, SimilarityResponse
from .extractor import parse_full_profile
from .similarity import compute_overall_similarity
from .taxonomy import SKILL_TAXONOMY

app = FastAPI(
    title="Recruitment NLP Intelligence Service",
    description="Skill extraction, ontology parsing, and semantic similarity scoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/nlp/health")
def health_check():
    return {
        "status": "UP",
        "service": "nlp-service",
        "taxonomyTerms": len(SKILL_TAXONOMY)
    }

@app.post("/nlp/extract", response_model=ExtractedProfile)
def extract_profile(request: ExtractRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty")
    return parse_full_profile(request.text)

@app.post("/nlp/similarity", response_model=SimilarityResponse)
def compute_similarity(request: SimilarityRequest):
    return compute_overall_similarity(request.jobSkills, request.candidateSkills)

@app.get("/nlp/taxonomy")
def get_taxonomy():
    return {
        "total": len(SKILL_TAXONOMY),
        "taxonomy": SKILL_TAXONOMY
    }

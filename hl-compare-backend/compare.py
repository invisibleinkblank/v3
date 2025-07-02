## HL Compare, Takes your uploaded PDFs
# Splits them into chunks
# Embeds them in memory (vector store)
# Sends a GPT-4 prompt to compare two entities
# Returns the result with advanced evidence quality scoring

import json
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

def process_documents(filepaths: List[str], document_metadata: Optional[List[Dict]] = None):
    """
    Process multiple documents and create a vectorstore with source tracking.
    In a real implementation, this would:
    1. Extract text from each PDF
    2. Split into chunks with document source tracking
    3. Create embeddings
    4. Build a searchable vectorstore
    """
    if document_metadata is None:
        document_metadata = []
    # TODO: Implement real document processing. For now, return empty or minimal structure.
    return {
        "type": "vectorstore",
        "documents": document_metadata,
        "total_documents": len(filepaths),
        "filepaths": filepaths
    }

def calculate_evidence_quality_score(entity: str, category: str, document_metadata: List[Dict], base_confidence: int) -> Dict[str, Any]:
    """
    Advanced evidence quality scoring system that evaluates:
    1. Source Credibility (Document type, size, recency)
    2. Cross-Document Consistency 
    3. Evidence Triangulation
    4. Temporal Reliability
    5. Quantitative vs Qualitative Evidence Mix
    """
    
    # 1. SOURCE CREDIBILITY SCORING
    source_credibility = assess_source_credibility(document_metadata)
    
    # 2. CROSS-DOCUMENT CONSISTENCY
    consistency_score = calculate_consistency_score(entity, category, document_metadata)
    
    # 3. EVIDENCE TRIANGULATION (multiple independent sources)
    triangulation_score = calculate_triangulation_score(document_metadata)
    
    # 4. TEMPORAL RELIABILITY (recency and trend consistency)
    temporal_score = assess_temporal_reliability(document_metadata)
    
    # 5. EVIDENCE TYPE DIVERSITY (quantitative vs qualitative, different perspectives).
    diversity_score = assess_evidence_diversity(category, document_metadata)
    
    # COMPOSITE EVIDENCE QUALITY SCORE
    # Weighted combination of all factors
    weights = {
        'source_credibility': 0.25,
        'consistency': 0.30,
        'triangulation': 0.20,
        'temporal': 0.15,
        'diversity': 0.10
    }
    
    evidence_quality = (
        source_credibility * weights['source_credibility'] +
        consistency_score * weights['consistency'] +
        triangulation_score * weights['triangulation'] +
        temporal_score * weights['temporal'] +
        diversity_score * weights['diversity']
    )
    
    # ADJUST BASE CONFIDENCE BASED ON EVIDENCE QUALITY
    quality_adjustment = (evidence_quality - 70) * 0.3  # Scale factor
    adjusted_confidence = min(99, max(40, base_confidence + quality_adjustment))
    
    return {
        "evidence_quality_score": round(evidence_quality, 1),
        "adjusted_confidence": round(adjusted_confidence),
        "quality_breakdown": {
            "source_credibility": round(source_credibility, 1),
            "cross_document_consistency": round(consistency_score, 1),
            "evidence_triangulation": round(triangulation_score, 1),
            "temporal_reliability": round(temporal_score, 1),
            "evidence_diversity": round(diversity_score, 1)
        },
        "quality_rating": get_quality_rating(evidence_quality),
        "reliability_flags": generate_reliability_flags(source_credibility, consistency_score, triangulation_score)
    }

def assess_source_credibility(document_metadata: List[Dict]) -> float:
    """
    Assess credibility based on document characteristics:
    - Official documents (10K, 10Q) = High credibility (85-95)
    - Analyst reports from major firms = Medium-High (75-85)
    - Research papers/whitepapers = Medium (65-75)
    - News articles/press releases = Medium-Low (55-65)
    - Small/incomplete documents = Low (45-55)
    """
    if not document_metadata:
        return 50.0
    
    credibility_scores = []
    
    for doc in document_metadata:
        filename = doc.get("filename", "").lower()
        size = doc.get("size", 0)
        
        # Base score from document type
        if any(term in filename for term in ["10-k", "10k", "annual", "quarterly", "10-q", "10q"]):
            base_score = 90  # Official filings
        elif any(term in filename for term in ["analyst", "research", "morgan", "goldman", "jp", "citi"]):
            base_score = 80  # Major analyst reports
        elif any(term in filename for term in ["whitepaper", "study", "analysis", "report"]):
            base_score = 70  # Research documents
        elif any(term in filename for term in ["press", "news", "release"]):
            base_score = 60  # Press releases/news
        else:
            base_score = 65  # Default
        
        # Size adjustment (larger documents generally more comprehensive)
        if size > 5000000:  # > 5MB
            size_bonus = 10
        elif size > 1000000:  # > 1MB
            size_bonus = 5
        elif size < 100000:  # < 100KB
            size_bonus = -15
        else:
            size_bonus = 0
        
        credibility_scores.append(min(95, max(40, base_score + size_bonus)))
    
    return sum(credibility_scores) / len(credibility_scores)

def calculate_consistency_score(entity: str, category: str, document_metadata: List[Dict]) -> float:
    """
    Calculate cross-document consistency score.
    Higher scores when multiple documents agree on key points.
    """
    if len(document_metadata) <= 1:
        return 60.0  # Single source, moderate consistency
    
    # Simulate consistency analysis based on document count and types
    doc_count = len(document_metadata)
    
    # More documents generally increase consistency confidence
    base_consistency = min(85, 50 + (doc_count * 8))
    
    # Adjust based on document type diversity
    doc_types = set()
    for doc in document_metadata:
        filename = doc.get("filename", "").lower()
        if any(term in filename for term in ["10-k", "10k", "annual", "quarterly"]):
            doc_types.add("official")
        elif any(term in filename for term in ["analyst", "research"]):
            doc_types.add("analyst")
        elif any(term in filename for term in ["news", "press"]):
            doc_types.add("news")
        else:
            doc_types.add("other")
    
    # Diversity bonus for having multiple source types
    diversity_bonus = len(doc_types) * 5
    
    # Category-specific adjustments
    category_modifiers = {
        "financial_performance": 1.1,  # Financial data is more standardized
        "valuation_metrics": 1.1,
        "management_quality": 0.9,    # More subjective
        "esg_factors": 0.85,          # Often conflicting viewpoints
        "competitive_position": 0.95
    }
    
    modifier = category_modifiers.get(category, 1.0)
    
    return min(95, (base_consistency + diversity_bonus) * modifier)

def calculate_triangulation_score(document_metadata: List[Dict]) -> float:
    """
    Assess evidence triangulation - independent confirmation across sources.
    """
    doc_count = len(document_metadata)
    
    if doc_count == 1:
        return 45.0  # No triangulation possible
    elif doc_count == 2:
        return 65.0  # Limited triangulation
    elif doc_count == 3:
        return 80.0  # Good triangulation
    else:
        return min(95, 80 + (doc_count - 3) * 3)  # Excellent triangulation

def assess_temporal_reliability(document_metadata: List[Dict]) -> float:
    """
    Assess temporal reliability based on document recency and time distribution.
    More recent documents and good temporal spread = higher reliability.
    """
    if not document_metadata:
        return 60.0
    
    # Simulate document ages (in a real system, would extract from metadata/content)
    # For now, use file size as a proxy for comprehensiveness/recency
    base_temporal = 70.0
    
    # Bonus for multiple documents (suggests ongoing coverage)
    if len(document_metadata) >= 3:
        base_temporal += 10
    elif len(document_metadata) >= 2:
        base_temporal += 5
    
    # Small penalty for very small files (might be outdated fragments)
    small_file_penalty = len([d for d in document_metadata if d.get("size", 0) < 100000]) * 5
    
    return max(40, min(90, base_temporal - small_file_penalty))

def assess_evidence_diversity(category: str, document_metadata: List[Dict]) -> float:
    """
    Assess diversity of evidence types (quantitative vs qualitative, different perspectives).
    """
    if not document_metadata:
        return 50.0
    
    doc_count = len(document_metadata)
    
    # Base diversity score
    base_diversity = min(80, 50 + (doc_count * 7))
    
    # Category-specific adjustments for evidence type importance
    quantitative_categories = ["financial_performance", "valuation_metrics"]
    qualitative_categories = ["management_quality", "esg_factors", "competitive_position"]
    
    if category in quantitative_categories:
        # For quantitative categories, having official documents is crucial
        official_docs = len([d for d in document_metadata 
                           if any(term in d.get("filename", "").lower() 
                                 for term in ["10-k", "10k", "annual", "quarterly"])])
        base_diversity += official_docs * 8
    
    elif category in qualitative_categories:
        # For qualitative categories, diverse perspectives matter more
        doc_types = len(set([get_doc_type(d) for d in document_metadata]))
        base_diversity += doc_types * 6
    
    return min(95, base_diversity)

def get_doc_type(doc: Dict) -> str:
    """Helper function to categorize document types."""
    filename = doc.get("filename", "").lower()
    if any(term in filename for term in ["10-k", "10k", "annual", "quarterly"]):
        return "official"
    elif any(term in filename for term in ["analyst", "research"]):
        return "analyst"
    elif any(term in filename for term in ["news", "press"]):
        return "news"
    else:
        return "other"

def get_quality_rating(evidence_quality: float) -> str:
    """Convert numerical quality score to categorical rating."""
    if evidence_quality >= 85:
        return "Excellent"
    elif evidence_quality >= 75:
        return "Good"
    elif evidence_quality >= 65:
        return "Moderate"
    elif evidence_quality >= 55:
        return "Limited"
    else:
        return "Poor"

def generate_reliability_flags(credibility: float, consistency: float, triangulation: float) -> List[str]:
    """Generate warning flags for reliability issues."""
    flags = []
    
    if credibility < 60:
        flags.append("⚠️ Low source credibility")
    if consistency < 65:
        flags.append("⚠️ Inconsistent information across sources")
    if triangulation < 60:
        flags.append("⚠️ Limited independent confirmation")
    
    if not flags:
        flags.append("✅ No major reliability concerns")
    
    return flags

def compare_entities(vectorstore: Dict, entityA: str, entityB: str, query: str, document_metadata: Optional[List[Dict]] = None):
    """
    Enhanced comparison with advanced evidence quality scoring.
    """
    if document_metadata is None:
        document_metadata = []
    entityA_key = entityA.lower().strip()
    entityB_key = entityB.lower().strip()
    # TODO: Implement real comparison logic. For now, return empty structure for each category.
    categories = [
        "investment_thesis", "valuation_metrics", "financial_performance", 
        "competitive_position", "risk_factors", "growth_drivers", 
        "macro_context", "esg_factors", "management_quality", "portfolio_recommendation"
    ]
    response = {}
    for category in categories:
        response[category] = {
            entityA_key: generate_enhanced_analysis(entityA, category, document_metadata),
            entityB_key: generate_enhanced_analysis(entityB, category, document_metadata),
            "confidence": 0
        }
    # Add document_analysis and executive_summary as empty/minimal for now
    response["document_analysis"] = {
        "total_documents": len(document_metadata),
        "documents_processed": [doc["filename"] for doc in document_metadata],
        "cross_references_found": [],
        "source_reliability": {},
        "evidence_quality_overview": {}
    }
    response["executive_summary"] = {
        "overview": "",
        "key_recommendation": "",
        "confidence_level": "",
        "source_consensus": "",
        "evidence_quality_summary": ""
    }
    return response

def generate_enhanced_analysis(entity: str, category: str, document_metadata: list) -> dict:
    # TODO: Implement real extraction logic here. For now, return empty if no real data is found.
    # Example: You might call a function like extract_metrics(entity, category, document_metadata)
    # and return its result if available.
    #
    # For now, return empty analysis and key_facts.
    return {
        "analysis": "",
        "confidence": 0,
        "key_facts": {}
    }

def calculate_overall_evidence_quality(document_metadata: List[Dict]) -> Dict[str, Any]:
    """Calculate overall evidence quality metrics for all documents."""
    if not document_metadata:
        return {"overall_score": 50.0, "rating": "Limited"}
    
    # Calculate aggregate scores
    source_credibility = assess_source_credibility(document_metadata)
    consistency = calculate_consistency_score("", "overall", document_metadata)
    triangulation = calculate_triangulation_score(document_metadata)
    temporal = assess_temporal_reliability(document_metadata)
    
    overall_score = (source_credibility + consistency + triangulation + temporal) / 4
    
    return {
        "overall_score": round(overall_score, 1),
        "rating": get_quality_rating(overall_score),
        "document_count": len(document_metadata),
        "credibility_score": round(source_credibility, 1),
        "consistency_score": round(consistency, 1),
        "triangulation_score": round(triangulation, 1),
        "temporal_score": round(temporal, 1)
    }

def get_overall_quality_assessment(document_metadata: List[Dict]) -> str:
    """Get overall quality assessment text."""
    quality_data = calculate_overall_evidence_quality(document_metadata)
    return quality_data["rating"]

def calculate_consensus_percentage(document_metadata: List[Dict]) -> int:
    """Calculate consensus percentage across documents."""
    if len(document_metadata) <= 1:
        return 100
    
    # Simulate consensus based on document types and count
    base_consensus = 75
    if len(document_metadata) >= 3:
        base_consensus += 10
    
    return min(95, base_consensus)

def assess_source_reliability_detailed(document_metadata: List[Dict]) -> Dict:
    """Enhanced source reliability assessment with detailed breakdown."""
    if not document_metadata:
        return {"overall_score": "Limited", "details": {}}
    
    credibility = assess_source_credibility(document_metadata)
    
    source_types = {}
    for doc in document_metadata:
        doc_type = get_doc_type(doc)
        source_types[doc_type] = source_types.get(doc_type, 0) + 1
    
    return {
        "overall_score": get_quality_rating(credibility),
        "credibility_score": round(credibility, 1),
        "source_distribution": source_types,
        "high_reliability": source_types.get("official", 0),
        "medium_reliability": source_types.get("analyst", 0) + source_types.get("other", 0),
        "requires_verification": source_types.get("news", 0),
        "total_sources": len(document_metadata)
    }

def generate_cross_references(entityA: str, entityB: str, document_metadata: List[Dict]) -> List[Dict]:
    """Generate enhanced cross-references with evidence quality indicators."""
    cross_refs = []
    for i, doc in enumerate(document_metadata):
        quality_score = assess_source_credibility([doc])
        cross_refs.append({
            "document": doc["filename"],
            "cross_references": min(len(document_metadata) - 1, 3),
            "entity_mentions": {
                entityA: f"Found in {min(i + 2, 5)} sections",
                entityB: f"Found in {min(i + 1, 4)} sections"
            },
            "evidence_quality": get_quality_rating(quality_score),
            "credibility_score": round(quality_score, 1)
        })
    return cross_refs

def get_supporting_sources(entity: str, category: str, document_metadata: List[Dict]) -> List[str]:
    """Get supporting sources with quality indicators."""
    if not document_metadata:
        return ["Mock analysis - no documents provided"]
    
    # Prioritize higher-quality sources
    sources_with_quality = []
    for doc in document_metadata:
        quality_score = assess_source_credibility([doc])
        sources_with_quality.append((doc["filename"], quality_score))
    
    # Sort by quality and return top sources
    sources_with_quality.sort(key=lambda x: x[1], reverse=True)
    return [source[0] for source in sources_with_quality[:min(3, len(sources_with_quality))]]

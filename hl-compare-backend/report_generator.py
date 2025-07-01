"""
HL Compare - Professional Report Generation
Generates PDF reports, executive summaries, and email-ready investment memos
"""

import io
import base64
import os
from datetime import datetime
from typing import Dict, Any, List
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, BaseDocTemplate, PageTemplate, Frame
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus.doctemplate import PageTemplate
from reportlab.platypus.frames import Frame
from reportlab.lib.utils import ImageReader
from jinja2 import Template

class NumberedCanvas:
    """Custom canvas to add HL logo and page numbers"""
    def __init__(self, canvas, doc):
        self.canvas = canvas
        self.doc = doc
        
    def draw(self):
        """Add HL logo to bottom left on pages after the first"""
        canvas = self.canvas
        
        # Skip logo on first page (title page)
        if canvas.getPageNumber() > 1:
            # Try to add HL logo in bottom left
            try:
                # Check if logo file exists in public folder (for frontend access)
                logo_path = "../hl-compare-frontend/public/harding-loevner-logo.png"
                if os.path.exists(logo_path):
                    canvas.drawImage(logo_path, 72, 30, width=80, height=25, preserveAspectRatio=True)
                else:
                    # Fallback text if logo not found
                    canvas.setFont("Helvetica", 8)
                    canvas.setFillColor(colors.HexColor('#666666'))
                    canvas.drawString(72, 40, "HARDING LOEVNER")
            except Exception:
                # Fallback text if image loading fails
                canvas.setFont("Helvetica", 8)
                canvas.setFillColor(colors.HexColor('#666666'))
                canvas.drawString(72, 40, "HARDING LOEVNER")
        
        # Add page number in bottom right
        if canvas.getPageNumber() > 1:
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(colors.HexColor('#666666'))
            canvas.drawRightString(A4[0] - 72, 40, f"Page {canvas.getPageNumber() - 1}")

def generate_comparison_pdf(comparison_data: Dict[str, Any], entityA: str, entityB: str) -> bytes:
    """Generate a professional PDF report for entity comparison."""
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4, 
        rightMargin=72, 
        leftMargin=72,
        topMargin=72, 
        bottomMargin=60  # Increased bottom margin for logo
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#0077cc'),
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'], 
        fontSize=16,
        spaceAfter=12,
        textColor=colors.HexColor('#0077cc')
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        alignment=TA_JUSTIFY
    )
    
    # Build content
    story = []
    
    # Title page
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("HARDING LOEVNER", title_style))
    story.append(Paragraph("INVESTMENT COMPARISON ANALYSIS", heading_style))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"{entityA} vs {entityB}", body_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", body_style))
    story.append(Spacer(1, 1*inch))
    
    # Executive Summary
    story.append(Paragraph("EXECUTIVE SUMMARY", heading_style))
    exec_summary = comparison_data.get('executive_summary', {})
    story.append(Paragraph(f"Overview: {exec_summary.get('overview', 'N/A')}", body_style))
    story.append(Paragraph(f"Key Recommendation: {exec_summary.get('key_recommendation', 'N/A')}", body_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Analysis Categories
    categories = [
        ("Investment Thesis", "investment_thesis"),
        ("Valuation Metrics", "valuation_metrics"), 
        ("Financial Performance", "financial_performance"),
        ("Competitive Position", "competitive_position"),
        ("Risk Factors", "risk_factors"),
        ("Growth Drivers", "growth_drivers"),
        ("Portfolio Recommendation", "portfolio_recommendation")
    ]
    
    for category_name, category_key in categories:
        story.append(PageBreak())
        story.append(Paragraph(category_name.upper(), heading_style))
        
        category_data = comparison_data.get(category_key, {})
        
        # Entity A Analysis
        story.append(Paragraph(f"{entityA} Analysis", heading_style))
        entityA_data = category_data.get(entityA, {})
        analysis_text = entityA_data.get('analysis', 'No analysis available')
        confidence = entityA_data.get('confidence_score', 'N/A')
        
        story.append(Paragraph(analysis_text, body_style))
        story.append(Paragraph(f"Confidence Score: {confidence}%", body_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Entity B Analysis  
        story.append(Paragraph(f"{entityB} Analysis", heading_style))
        entityB_data = category_data.get(entityB, {})
        analysis_text = entityB_data.get('analysis', 'No analysis available')
        confidence = entityB_data.get('confidence_score', 'N/A')
        
        story.append(Paragraph(analysis_text, body_style))
        story.append(Paragraph(f"Confidence Score: {confidence}%", body_style))
        story.append(Spacer(1, 0.3*inch))
    
    # Build PDF with custom canvas for logo
    def add_page_elements(canvas, doc):
        numbered_canvas = NumberedCanvas(canvas, doc)
        numbered_canvas.draw()
    
    doc.build(story, onFirstPage=add_page_elements, onLaterPages=add_page_elements)
    buffer.seek(0)
    return buffer.getvalue()

def generate_executive_summary(comparison_data: Dict[str, Any], entityA: str, entityB: str) -> Dict[str, Any]:
    """Generate an enhanced executive summary with key metrics and insights."""
    
    categories = [
        "investment_thesis", "valuation_metrics", "financial_performance",
        "competitive_position", "risk_factors", "growth_drivers",
        "portfolio_recommendation"
    ]
    
    entityA_scores = []
    entityB_scores = []
    
    for category in categories:
        category_data = comparison_data.get(category, {})
        entityA_score = category_data.get(entityA, {}).get('confidence_score', 0)
        entityB_score = category_data.get(entityB, {}).get('confidence_score', 0)
        entityA_scores.append(entityA_score)
        entityB_scores.append(entityB_score)
    
    # Calculate overall scores
    entityA_avg = sum(entityA_scores) / len(entityA_scores) if entityA_scores else 0
    entityB_avg = sum(entityB_scores) / len(entityB_scores) if entityB_scores else 0
    
    # Determine recommendation
    if entityA_avg > entityB_avg + 5:
        recommendation = f"OVERWEIGHT {entityA}"
    elif entityB_avg > entityA_avg + 5:
        recommendation = f"OVERWEIGHT {entityB}" 
    else:
        recommendation = "NEUTRAL WEIGHTING"
    
    return {
        "overview": f"Comprehensive analysis of {entityA} versus {entityB} across investment criteria.",
        "key_recommendation": recommendation,
        "entityA_overall_score": round(entityA_avg, 1),
        "entityB_overall_score": round(entityB_avg, 1),
        "analysis_date": datetime.now().strftime('%B %d, %Y')
    }

def generate_email_memo(comparison_data: Dict[str, Any], entityA: str, entityB: str) -> str:
    """Generate an email-ready investment memo."""
    
    exec_summary = generate_executive_summary(comparison_data, entityA, entityB)
    
    memo = f"""Subject: Investment Analysis - {entityA} vs {entityB} Comparison

Dear Team,

Please find below our comprehensive investment analysis comparing {entityA} and {entityB}.

EXECUTIVE SUMMARY
=================
{exec_summary['overview']}

RECOMMENDATION: {exec_summary['key_recommendation']}

OVERALL SCORES
==============
• {entityA}: {exec_summary['entityA_overall_score']}% confidence
• {entityB}: {exec_summary['entityB_overall_score']}% confidence

This analysis was generated on {exec_summary['analysis_date']} using our HL Compare platform.

Best regards,
Harding Loevner Investment Team

---
This analysis is for institutional use only.
"""
    
    return memo

def generate_confidence_chart(comparison_data: Dict[str, Any], entityA: str, entityB: str) -> str:
    """Generate a confidence score comparison chart and return as base64 encoded image."""
    
    categories = [
        "Investment", "Valuation", "Financial", "Competitive", "Risk", "Growth", "Portfolio"
    ]
    
    category_keys = [
        "investment_thesis", "valuation_metrics", "financial_performance",
        "competitive_position", "risk_factors", "growth_drivers", "portfolio_recommendation"
    ]
    
    entityA_scores = []
    entityB_scores = []
    
    for key in category_keys:
        category_data = comparison_data.get(key, {})
        entityA_score = category_data.get(entityA, {}).get('confidence_score', 0)
        entityB_score = category_data.get(entityB, {}).get('confidence_score', 0)
        entityA_scores.append(entityA_score)
        entityB_scores.append(entityB_score)
    
    # Create chart
    fig, ax = plt.subplots(figsize=(10, 6))
    x = range(len(categories))
    width = 0.35
    
    bars1 = ax.bar([i - width/2 for i in x], entityA_scores, width, 
                   label=entityA, color='#0077cc', alpha=0.8)
    bars2 = ax.bar([i + width/2 for i in x], entityB_scores, width,
                   label=entityB, color='#28a745', alpha=0.8)
    
    ax.set_xlabel('Analysis Categories')
    ax.set_ylabel('Confidence Score (%)')
    ax.set_title(f'Investment Analysis: {entityA} vs {entityB}')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, rotation=45)
    ax.legend()
    ax.set_ylim(0, 100)
    
    plt.tight_layout()
    
    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    return base64.b64encode(image_data).decode('utf-8') 
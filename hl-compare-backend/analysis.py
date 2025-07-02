import os
from typing import List, Dict, Any
from extractors.pdf_extractor import extract_pdf_text
from extractors.excel_extractor import extract_excel_text
from extractors.txt_extractor import extract_txt_text
from extractors.csv_extractor import extract_csv_text
import json

# --- Entity & Metric Extraction (Stub) ---
def extract_entities_and_metrics(text: str, entities: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Given raw text and a list of entities, extract metrics for each entity.
    This version returns a robust set of financial metrics for demo purposes.
    Returns: { entity: { category: {metric: {value, unit, definition}, ...}, ... }, ... }
    """
    categories = [
        'investment_thesis', 'valuation_metrics', 'financial_performance',
        'competitive_position', 'risk_factors', 'growth_drivers',
        'macro_context', 'esg_factors', 'management_quality', 'portfolio_recommendation'
    ]
    # Demo data for each entity and category
    demo_metrics = {
        'apple': {
            'investment_thesis': {
                'analysis': "Apple's strong brand and integrated ecosystem drive long-term growth and customer loyalty.",
                'confidence': 95,
                'key_facts': {}
            },
            'valuation_metrics': {
                "Sector": {'value': "Technology", 'unit': '', 'definition': "The sector the company operates in."},
                "Current Price": {'value': 204.23, 'unit': '$', 'definition': "The latest trading price of the company's stock."},
                "Market Cap": {'value': 3.00, 'unit': 'T', 'definition': "The total market value of a company's outstanding shares."},
                "P/E Ratio": {'value': 31.38, 'unit': '', 'definition': 'Price-to-Earnings Ratio.'},
                "Dividend Yield": {'value': 0.53, 'unit': '%', 'definition': 'Dividend yield as a percent.'},
                "52 Week High": {'value': 260.10, 'unit': '$', 'definition': '52 week high price.'},
                "52 Week Low": {'value': 169.21, 'unit': '$', 'definition': '52 week low price.'},
            },
            'financial_performance': {
                'Revenue': {'value': 394.33, 'unit': 'B', 'definition': 'Total revenue.'},
                'Net Income': {'value': 99.80, 'unit': 'B', 'definition': 'Net profit.'},
                'EPS': {'value': 6.11, 'unit': '$', 'definition': 'Earnings per share.'},
                'Operating Margin': {'value': 29.8, 'unit': '%', 'definition': 'Operating margin.'},
                'Free Cash Flow': {'value': 111.44, 'unit': 'B', 'definition': 'Free cash flow.'},
                'Total Return (Trailing 12M)': {'value': -5.64, 'unit': '%', 'definition': 'Total return last 12 months.'},
                'Total Return (5 Years)': {'value': 128.71, 'unit': '%', 'definition': 'Total return last 5 years.'},
                'Current Ratio': {'value': 0.80, 'unit': '', 'definition': 'Current ratio.'},
            },
            'competitive_position': {
                'Market Share': {'value': 23, 'unit': '%', 'definition': 'Estimated global market share.'},
                'Key Competitors': {'value': 'Samsung, Huawei', 'unit': '', 'definition': 'Major competitors.'},
                'Moat Strength': {'value': 9, 'unit': '/10', 'definition': 'Competitive moat strength.'},
                'Brand Value': {'value': 516, 'unit': 'B', 'definition': 'Estimated brand value.'},
            },
            'risk_factors': {
                'Regulatory Risk': {'value': 7, 'unit': '/10', 'definition': 'Risk from regulations.'},
                'Supply Chain Risk': {'value': 6, 'unit': '/10', 'definition': 'Risk from supply chain disruptions.'},
                'Market Volatility': {'value': 4, 'unit': '/10', 'definition': 'Exposure to market swings.'},
                'Litigation Risk': {'value': 5, 'unit': '/10', 'definition': 'Risk from lawsuits.'},
            },
            'growth_drivers': {
                'R&D Spend': {'value': 27.67, 'unit': 'B', 'definition': 'Annual R&D expenditure.'},
                'New Markets': {'value': 3, 'unit': '', 'definition': 'Number of new markets entered.'},
                'Product Pipeline': {'value': 5, 'unit': '', 'definition': 'Major products in pipeline.'},
                'User Growth': {'value': 8, 'unit': '%', 'definition': 'Annual user growth.'},
            },
            'macro_context': {
                'GDP Exposure': {'value': 40, 'unit': '%', 'definition': 'Revenue from international markets.'},
                'FX Sensitivity': {'value': 2, 'unit': '/10', 'definition': 'Sensitivity to currency changes.'},
                'Interest Rate Sensitivity': {'value': 3, 'unit': '/10', 'definition': 'Impact of interest rates.'},
                'Inflation Impact': {'value': 4, 'unit': '/10', 'definition': 'Impact of inflation.'},
            },
            'esg_factors': {
                'Carbon Footprint': {'value': 18, 'unit': 'MT', 'definition': 'Annual CO2 emissions (millions of tons).'},
                'Board Diversity': {'value': 45, 'unit': '%', 'definition': 'Percent of diverse board members.'},
                'ESG Rating': {'value': 'AA', 'unit': '', 'definition': 'Third-party ESG rating.'},
                'Sustainability Initiatives': {'value': 12, 'unit': '', 'definition': 'Number of major initiatives.'},
            },
            'management_quality': {
                'CEO Tenure': {'value': 13, 'unit': 'years', 'definition': 'Years current CEO has served.'},
                'Management Score': {'value': 9, 'unit': '/10', 'definition': 'Internal management quality score.'},
                'Insider Ownership': {'value': 0.07, 'unit': '%', 'definition': 'Percent of shares owned by insiders.'},
                'Succession Plan': {'value': 'Yes', 'unit': '', 'definition': 'Is there a clear succession plan?'},
            },
            'portfolio_recommendation': {
                'Portfolio Fit': {'value': 'Core Growth', 'unit': '', 'definition': 'Suggested portfolio role.'},
                'Risk Level': {'value': 'Medium', 'unit': '', 'definition': 'Risk assessment.'},
                'Suggested Allocation': {'value': 8, 'unit': '%', 'definition': 'Suggested portfolio allocation.'},
                'Investment Horizon': {'value': 'Long-term', 'unit': '', 'definition': 'Recommended holding period.'},
            },
        },
        'meta': {
            'investment_thesis': {
                'analysis': "Meta's focus on social platforms and the metaverse positions it for future digital growth.",
                'confidence': 90,
                'key_facts': {}
            },
            'valuation_metrics': {
                "Sector": {'value': "Communication Services", 'unit': '', 'definition': "The sector the company operates in."},
                "Current Price": {'value': 698.00, 'unit': '$', 'definition': "The latest trading price of the company's stock."},
                "Market Cap": {'value': 1.72, 'unit': 'T', 'definition': "The total market value of a company's outstanding shares."},
                "P/E Ratio": {'value': 28.66, 'unit': '', 'definition': 'Price-to-Earnings Ratio.'},
                "Dividend Yield": {'value': 0.30, 'unit': '%', 'definition': 'Dividend yield as a percent.'},
                "52 Week High": {'value': 740.91, 'unit': '$', 'definition': '52 week high price.'},
                "52 Week Low": {'value': 442.65, 'unit': '$', 'definition': '52 week low price.'},
            },
            'financial_performance': {
                'Revenue': {'value': 134.90, 'unit': 'B', 'definition': 'Total revenue.'},
                'Net Income': {'value': 39.10, 'unit': 'B', 'definition': 'Net profit.'},
                'EPS': {'value': 14.87, 'unit': '$', 'definition': 'Earnings per share.'},
                'Operating Margin': {'value': 40.1, 'unit': '%', 'definition': 'Operating margin.'},
                'Free Cash Flow': {'value': 44.00, 'unit': 'B', 'definition': 'Free cash flow.'},
                'Total Return (Trailing 12M)': {'value': 41.69, 'unit': '%', 'definition': 'Total return last 12 months.'},
                'Total Return (5 Years)': {'value': 234.33, 'unit': '%', 'definition': 'Total return last 5 years.'},
                'Current Ratio': {'value': 2.66, 'unit': '', 'definition': 'Current ratio.'},
            },
            'competitive_position': {
                'Market Share': {'value': 62, 'unit': '%', 'definition': 'Share of global social media users.'},
                'Key Competitors': {'value': 'TikTok, Snapchat', 'unit': '', 'definition': 'Major competitors.'},
                'Moat Strength': {'value': 8, 'unit': '/10', 'definition': 'Competitive moat strength.'},
                'Brand Value': {'value': 101, 'unit': 'B', 'definition': 'Estimated brand value.'},
            },
            'risk_factors': {
                'Regulatory Risk': {'value': 9, 'unit': '/10', 'definition': 'Risk from regulations.'},
                'Supply Chain Risk': {'value': 2, 'unit': '/10', 'definition': 'Risk from supply chain disruptions.'},
                'Market Volatility': {'value': 7, 'unit': '/10', 'definition': 'Exposure to market swings.'},
                'Litigation Risk': {'value': 8, 'unit': '/10', 'definition': 'Risk from lawsuits.'},
            },
            'growth_drivers': {
                'R&D Spend': {'value': 35.34, 'unit': 'B', 'definition': 'Annual R&D expenditure.'},
                'New Markets': {'value': 5, 'unit': '', 'definition': 'Number of new markets entered.'},
                'Product Pipeline': {'value': 7, 'unit': '', 'definition': 'Major products in pipeline.'},
                'User Growth': {'value': 12, 'unit': '%', 'definition': 'Annual user growth.'},
            },
            'macro_context': {
                'GDP Exposure': {'value': 55, 'unit': '%', 'definition': 'Revenue from international markets.'},
                'FX Sensitivity': {'value': 4, 'unit': '/10', 'definition': 'Sensitivity to currency changes.'},
                'Interest Rate Sensitivity': {'value': 2, 'unit': '/10', 'definition': 'Impact of interest rates.'},
                'Inflation Impact': {'value': 5, 'unit': '/10', 'definition': 'Impact of inflation.'},
            },
            'esg_factors': {
                'Carbon Footprint': {'value': 10, 'unit': 'MT', 'definition': 'Annual CO2 emissions (millions of tons).'},
                'Board Diversity': {'value': 38, 'unit': '%', 'definition': 'Percent of diverse board members.'},
                'ESG Rating': {'value': 'A', 'unit': '', 'definition': 'Third-party ESG rating.'},
                'Sustainability Initiatives': {'value': 8, 'unit': '', 'definition': 'Number of major initiatives.'},
            },
            'management_quality': {
                'CEO Tenure': {'value': 19, 'unit': 'years', 'definition': 'Years current CEO has served.'},
                'Management Score': {'value': 8, 'unit': '/10', 'definition': 'Internal management quality score.'},
                'Insider Ownership': {'value': 13.2, 'unit': '%', 'definition': 'Percent of shares owned by insiders.'},
                'Succession Plan': {'value': 'No', 'unit': '', 'definition': 'Is there a clear succession plan?'},
            },
            'portfolio_recommendation': {
                'Portfolio Fit': {'value': 'Growth', 'unit': '', 'definition': 'Suggested portfolio role.'},
                'Risk Level': {'value': 'High', 'unit': '', 'definition': 'Risk assessment.'},
                'Suggested Allocation': {'value': 5, 'unit': '%', 'definition': 'Suggested portfolio allocation.'},
                'Investment Horizon': {'value': 'Long-term', 'unit': '', 'definition': 'Recommended holding period.'},
            },
        },
        'microsoft': {
            'investment_thesis': {
                'analysis': "Microsoft's cloud leadership and diversified business model support consistent growth.",
                'confidence': 97,
                'key_facts': {}
            },
            'valuation_metrics': {
                "Sector": {'value': "Technology", 'unit': '', 'definition': "The sector the company operates in."},
                "Current Price": {'value': 446.25, 'unit': '$', 'definition': "The latest trading price of the company's stock."},
                "Market Cap": {'value': 3.33, 'unit': 'T', 'definition': "The total market value of a company's outstanding shares."},
                "P/E Ratio": {'value': 36.74, 'unit': '', 'definition': 'Price-to-Earnings Ratio.'},
                "Dividend Yield": {'value': 0.74, 'unit': '%', 'definition': 'Dividend yield as a percent.'},
                "52 Week High": {'value': 456.38, 'unit': '$', 'definition': '52 week high price.'},
                "52 Week Low": {'value': 308.14, 'unit': '$', 'definition': '52 week low price.'},
            },
            'financial_performance': {
                'Revenue': {'value': 211.92, 'unit': 'B', 'definition': 'Total revenue.'},
                'Net Income': {'value': 72.36, 'unit': 'B', 'definition': 'Net profit.'},
                'EPS': {'value': 9.65, 'unit': '$', 'definition': 'Earnings per share.'},
                'Operating Margin': {'value': 45.6, 'unit': '%', 'definition': 'Operating margin.'},
                'Free Cash Flow': {'value': 65.15, 'unit': 'B', 'definition': 'Free cash flow.'},
                'Total Return (Trailing 12M)': {'value': 36.44, 'unit': '%', 'definition': 'Total return last 12 months.'},
                'Total Return (5 Years)': {'value': 216.52, 'unit': '%', 'definition': 'Total return last 5 years.'},
                'Current Ratio': {'value': 1.90, 'unit': '', 'definition': 'Current ratio.'},
            },
            'competitive_position': {
                'Market Share': {'value': 16, 'unit': '%', 'definition': 'Share of global OS market.'},
                'Key Competitors': {'value': 'Google, Amazon', 'unit': '', 'definition': 'Major competitors.'},
                'Moat Strength': {'value': 10, 'unit': '/10', 'definition': 'Competitive moat strength.'},
                'Brand Value': {'value': 340, 'unit': 'B', 'definition': 'Estimated brand value.'},
            },
            'risk_factors': {
                'Regulatory Risk': {'value': 8, 'unit': '/10', 'definition': 'Risk from regulations.'},
                'Supply Chain Risk': {'value': 3, 'unit': '/10', 'definition': 'Risk from supply chain disruptions.'},
                'Market Volatility': {'value': 5, 'unit': '/10', 'definition': 'Exposure to market swings.'},
                'Litigation Risk': {'value': 6, 'unit': '/10', 'definition': 'Risk from lawsuits.'},
            },
            'growth_drivers': {
                'R&D Spend': {'value': 26.6, 'unit': 'B', 'definition': 'Annual R&D expenditure.'},
                'New Markets': {'value': 2, 'unit': '', 'definition': 'Number of new markets entered.'},
                'Product Pipeline': {'value': 6, 'unit': '', 'definition': 'Major products in pipeline.'},
                'User Growth': {'value': 5, 'unit': '%', 'definition': 'Annual user growth.'},
            },
            'macro_context': {
                'GDP Exposure': {'value': 60, 'unit': '%', 'definition': 'Revenue from international markets.'},
                'FX Sensitivity': {'value': 3, 'unit': '/10', 'definition': 'Sensitivity to currency changes.'},
                'Interest Rate Sensitivity': {'value': 4, 'unit': '/10', 'definition': 'Impact of interest rates.'},
                'Inflation Impact': {'value': 3, 'unit': '/10', 'definition': 'Impact of inflation.'},
            },
            'esg_factors': {
                'Carbon Footprint': {'value': 14, 'unit': 'MT', 'definition': 'Annual CO2 emissions (millions of tons).'},
                'Board Diversity': {'value': 50, 'unit': '%', 'definition': 'Percent of diverse board members.'},
                'ESG Rating': {'value': 'AAA', 'unit': '', 'definition': 'Third-party ESG rating.'},
                'Sustainability Initiatives': {'value': 15, 'unit': '', 'definition': 'Number of major initiatives.'},
            },
            'management_quality': {
                'CEO Tenure': {'value': 10, 'unit': 'years', 'definition': 'Years current CEO has served.'},
                'Management Score': {'value': 10, 'unit': '/10', 'definition': 'Internal management quality score.'},
                'Insider Ownership': {'value': 0.02, 'unit': '%', 'definition': 'Percent of shares owned by insiders.'},
                'Succession Plan': {'value': 'Yes', 'unit': '', 'definition': 'Is there a clear succession plan?'},
            },
            'portfolio_recommendation': {
                'Portfolio Fit': {'value': 'Defensive Growth', 'unit': '', 'definition': 'Suggested portfolio role.'},
                'Risk Level': {'value': 'Low', 'unit': '', 'definition': 'Risk assessment.'},
                'Suggested Allocation': {'value': 10, 'unit': '%', 'definition': 'Suggested portfolio allocation.'},
                'Investment Horizon': {'value': 'Long-term', 'unit': '', 'definition': 'Recommended holding period.'},
            },
        },
    }
    # Build the result for each entity and category
    result = {}
    categories = [
        'investment_thesis', 'valuation_metrics', 'financial_performance',
        'competitive_position', 'risk_factors', 'growth_drivers',
        'macro_context', 'esg_factors', 'management_quality', 'portfolio_recommendation'
    ]
    for category in categories:
        result[category] = {}
        for entity in entities:
            entity_key = entity.lower().strip()
            demo_key = entity.lower().strip()
            if category in demo_metrics.get(demo_key, {}):
                result[category][entity_key] = { 'key_facts': demo_metrics[demo_key][category] }
    # Add detailed, CIO-ready conclusions for each category
    result['investment_thesis']['conclusion'] = (
        "All three companies present compelling investment theses, but Apple's unmatched brand loyalty and integrated ecosystem provide a durable competitive advantage. "
        "Microsoft's cloud leadership and enterprise focus position it for sustained growth, while Meta's pivot to the metaverse is bold but carries higher execution risk. "
        "Investors should weigh the stability of Apple and Microsoft against the higher potential upside—but also greater volatility—of Meta."
    )
    result['valuation_metrics']['conclusion'] = (
        "Apple and Microsoft command the largest market capitalizations in the sector, reflecting their dominant positions and investor confidence. "
        "Meta, while smaller, trades at a lower P/E ratio, suggesting the market is pricing in more uncertainty but also potential for multiple expansion. "
        "Dividend yields remain modest across the board, with all three companies prioritizing reinvestment over payouts."
    )
    result['financial_performance']['conclusion'] = (
        "Apple leads in both revenue and net income, demonstrating operational excellence and pricing power. "
        "Microsoft's margins are the highest, driven by its software and cloud businesses, while Meta's recent growth in free cash flow and EPS is notable. "
        "Total returns over five years have been strong for all, but Meta's recent volatility has impacted its trailing 12-month performance."
    )
    result['competitive_position']['conclusion'] = (
        "Microsoft's wide moat is underpinned by its enterprise relationships and cloud infrastructure, while Apple's brand value and ecosystem lock-in are unmatched in consumer tech. "
        "Meta remains the leader in social media market share but faces intensifying competition from emerging platforms. "
        "All three companies benefit from significant network effects, but their competitive threats differ by segment."
    )
    result['risk_factors']['conclusion'] = (
        "Regulatory scrutiny is the most acute for Meta, given its data practices and market dominance in social media. "
        "Apple and Microsoft face supply chain and macroeconomic risks, but their diversified revenue streams provide resilience. "
        "Litigation and market volatility are persistent risks, but all three maintain strong balance sheets to weather disruptions."
    )
    result['growth_drivers']['conclusion'] = (
        "Meta's aggressive R&D investment in the metaverse and new markets could yield outsized returns if successful, but execution risk is high. "
        "Apple's product pipeline and expansion into services continue to drive user growth, while Microsoft leverages cloud and AI to enter new verticals. "
        "Sustained innovation and global expansion remain critical for all three to maintain their growth trajectories."
    )
    result['macro_context']['conclusion'] = (
        "All three companies generate a significant portion of revenue internationally, exposing them to currency and macroeconomic fluctuations. "
        "Interest rate and inflation sensitivity are moderate, but global economic slowdowns could impact demand for discretionary tech products and services. "
        "Geopolitical risks and regulatory changes in key markets are important watchpoints for investors."
    )
    result['esg_factors']['conclusion'] = (
        "Microsoft leads in ESG ratings, reflecting its commitment to sustainability and diversity. "
        "Apple has made significant strides in reducing its carbon footprint and improving board diversity, while Meta is catching up but still faces reputational challenges. "
        "Sustainability initiatives and transparent reporting are increasingly important for long-term investors."
    )
    result['management_quality']['conclusion'] = (
        "All three companies are led by experienced CEOs with strong track records. "
        "Microsoft's management team scores highest on internal assessments, while Apple's succession planning and Meta's founder-led culture are notable. "
        "Insider ownership is highest at Meta, aligning management with shareholder interests."
    )
    result['portfolio_recommendation']['conclusion'] = (
        "Apple and Microsoft are recommended as core growth holdings for diversified portfolios, offering stability and consistent returns. "
        "Meta is best suited for investors seeking higher growth and willing to accept greater risk. "
        "Suggested allocations should reflect individual risk tolerance and investment horizon."
    )
    return result

# --- Main Comparison Logic ---
def compare_entities(filepaths: List[str], entities: List[str]) -> Dict[str, Any]:
    """
    Processes all files, extracts text, aggregates metrics by entity.
    Returns a structured JSON for the frontend.
    """
    all_text = ''
    for fp in filepaths:
        ext = os.path.splitext(fp)[1].lower()
        if ext == '.pdf':
            all_text += extract_pdf_text(fp) + '\n'
        elif ext in ['.xls', '.xlsx']:
            all_text += extract_excel_text(fp) + '\n'
        elif ext in ['.csv', '.tsv']:
            all_text += extract_csv_text(fp) + '\n'
        elif ext in ['.txt', '.md']:
            all_text += extract_txt_text(fp) + '\n'
        else:
            continue  # skip unsupported
    entity_metrics = extract_entities_and_metrics(all_text, entities)
    # Structure response for frontend
    response = {
        'comparison': entity_metrics,
        'documents_analyzed': len(filepaths),
        'entities': entities
    }
    print("[DEBUG] Backend response to frontend:\n", json.dumps(response, indent=2))
    return response 
import React, { useState } from 'react';
import './App.css';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement);

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#10b981';
  if (confidence >= 60) return '#f59e0b';
  return '#ef4444';
};

const categories = [
  { key: 'investment_thesis', name: 'Investment Thesis', icon: '🏢' },
  { key: 'valuation_metrics', name: 'Valuation Metrics', icon: '📊' },
  { key: 'financial_performance', name: 'Financial Performance', icon: '💰' },
  { key: 'competitive_position', name: 'Competitive Position', icon: '🏆' },
  { key: 'risk_factors', name: 'Risk Factors', icon: '⚠️' },
  { key: 'growth_drivers', name: 'Growth Drivers', icon: '📈' },
  { key: 'macro_context', name: 'Macro Context', icon: '🌍' },
  { key: 'esg_factors', name: 'ESG Factors', icon: '🌱' },
  { key: 'management_quality', name: 'Management Quality', icon: '👥' },
  { key: 'portfolio_recommendation', name: 'Portfolio Recommendation', icon: '📋' }
];

// Add this after categories definition
const categoryMetrics = {
  valuation_metrics: [
    { key: 'Sector', label: 'Sector' },
    { key: 'Current Price', label: 'Current Price' },
    { key: 'Market Cap', label: 'Market Cap' },
    { key: 'P/E Ratio', label: 'P/E Ratio' },
    { key: 'Dividend Yield', label: 'Dividend Yield' },
    { key: '52 Week High', label: '52 Week High' },
    { key: '52 Week Low', label: '52 Week Low' },
  ],
  financial_performance: [
    { key: 'Revenue', label: 'Revenue' },
    { key: 'Net Income', label: 'Net Income' },
    { key: 'EPS', label: 'EPS' },
    { key: 'Operating Margin', label: 'Operating Margin' },
    { key: 'Free Cash Flow', label: 'Free Cash Flow' },
    { key: 'Total Return (Trailing 12M)', label: 'Total Return (Trailing 12M)' },
    { key: 'Total Return (5 Years)', label: 'Total Return (5 Years)' },
    { key: 'Current Ratio', label: 'Current Ratio' },
  ],
  competitive_position: [
    { key: 'Market Share', label: 'Market Share' },
    { key: 'Key Competitors', label: 'Key Competitors' },
    { key: 'Moat Strength', label: 'Moat Strength' },
    { key: 'Brand Value', label: 'Brand Value' },
  ],
  risk_factors: [
    { key: 'Regulatory Risk', label: 'Regulatory Risk' },
    { key: 'Supply Chain Risk', label: 'Supply Chain Risk' },
    { key: 'Market Volatility', label: 'Market Volatility' },
    { key: 'Litigation Risk', label: 'Litigation Risk' },
  ],
  growth_drivers: [
    { key: 'R&D Spend', label: 'R&D Spend' },
    { key: 'New Markets', label: 'New Markets' },
    { key: 'Product Pipeline', label: 'Product Pipeline' },
    { key: 'User Growth', label: 'User Growth' },
  ],
  macro_context: [
    { key: 'GDP Exposure', label: 'GDP Exposure' },
    { key: 'FX Sensitivity', label: 'FX Sensitivity' },
    { key: 'Interest Rate Sensitivity', label: 'Interest Rate Sensitivity' },
    { key: 'Inflation Impact', label: 'Inflation Impact' },
  ],
  esg_factors: [
    { key: 'Carbon Footprint', label: 'Carbon Footprint' },
    { key: 'Board Diversity', label: 'Board Diversity' },
    { key: 'ESG Rating', label: 'ESG Rating' },
    { key: 'Sustainability Initiatives', label: 'Sustainability Initiatives' },
  ],
  management_quality: [
    { key: 'CEO Tenure', label: 'CEO Tenure' },
    { key: 'Management Score', label: 'Management Score' },
    { key: 'Insider Ownership', label: 'Insider Ownership' },
    { key: 'Succession Plan', label: 'Succession Plan' },
  ],
  portfolio_recommendation: [
    { key: 'Portfolio Fit', label: 'Portfolio Fit' },
    { key: 'Risk Level', label: 'Risk Level' },
    { key: 'Suggested Allocation', label: 'Suggested Allocation' },
    { key: 'Investment Horizon', label: 'Investment Horizon' },
  ],
};

// Refactor Accordion to accept entities, results, and formatMetricValue as props
function Accordion({ items, entities, results, formatMetricValue }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="accordion">
      {items.map((item, idx) => (
        <div className="accordion-item" key={item.key}>
          <button
            className="accordion-header"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
          >
            <span className="category-icon">{item.icon}</span>
            <span className="category-title">{item.name}</span>
            <span className="accordion-arrow">{openIndex === idx ? '▲' : '▼'}</span>
          </button>
          {openIndex === idx && (
            <div className="accordion-content">
              {/* Show metrics table if available */}
              {item.metrics && item.metrics.length > 0 && (
                <table className="key-metrics-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {entities.map(entity => (
                        <th key={entity}>{entity}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.metrics.map(({ key, label }) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 600, position: 'relative' }}>
                          <span className="metric-label has-definition" tabIndex={0}>
                            {label}
                            {/* Tooltip for metric definition */}
                            <span className="info-icon" tabIndex={-1} style={{ background: 'none', boxShadow: 'none', width: 18, height: 18, marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                              <span className="metric-tooltip">
                                {(() => {
                                  // Try to get definition from first entity's key_facts
                                  const def = results[item.key]?.[entities[0].toLowerCase().trim()]?.key_facts?.[key]?.definition;
                                  return def || 'No definition available.';
                                })()}
                              </span>
                            </span>
                          </span>
                        </td>
                        {entities.map(entity => {
                          const valueObj = results[item.key]?.[entity.toLowerCase().trim()]?.key_facts?.[key];
                          return (
                            <td key={entity}>
                              {valueObj && valueObj.value !== undefined && valueObj.value !== null
                                ? formatMetricValue(key, valueObj.value)
                                : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Show analysis text if present (e.g., Investment Thesis) */}
              {item.showAnalysis && (
                <div style={{ display: 'flex', gap: '2rem', marginTop: 24 }}>
                  {entities.map(entity => {
                    const thesisFacts = results[item.key]?.[entity.toLowerCase().trim()]?.key_facts || {};
                    return (
                      <div key={entity} style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 24, minHeight: 80, boxShadow: '0 1px 4px rgba(102,126,234,0.06)' }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#374151', marginBottom: 8 }}>{entity}</div>
                        <div style={{ fontSize: 16, color: '#374151', marginBottom: 12 }}>{thesisFacts.analysis || 'No analysis available.'}</div>
                        <div style={{ fontSize: 14, color: '#64748b' }}>Confidence: <span style={{ fontWeight: 600 }}>{thesisFacts.confidence !== undefined ? thesisFacts.confidence + '%' : '-'}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Deeper Insight/Conclusion paragraph - now always uses backend conclusion if present */}
              <div style={{
                marginTop: 32,
                background: '#e0e7ff',
                borderRadius: 10,
                padding: 20,
                fontSize: 17,
                color: '#1e293b',
                fontStyle: 'italic',
                boxShadow: '0 2px 8px rgba(102,126,234,0.08)'
              }}>
                <b>Deeper Insight:</b> {results[item.key]?.conclusion || 'This is where a summary or key takeaway for this category will appear.'}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EvidenceSidebar({ open, onClose, evidence }) {
  if (!open || !evidence) return null;
  const { filename, page, excerpt, confidence, quality_rating, reliability_flags, download_url } = evidence;
  const isPdf = download_url && download_url.toLowerCase().endsWith('.pdf');
  // For <embed>, we can't jump to a page, but we can show the PDF inline
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 400,
      height: '100vh',
      background: '#fff',
      boxShadow: '-4px 0 16px rgba(25, 118, 210, 0.13)',
      zIndex: 2000,
      padding: '32px 28px',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '2px solid #e5e7eb',
      transition: 'transform 0.2s',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      overflowY: 'auto',
    }}>
      <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b', marginBottom: 16 }}>×</button>
      <h2 style={{ color: '#1976d2', fontSize: 22, marginBottom: 12 }}>Evidence Details</h2>
      <div style={{ marginBottom: 12 }}><b>Document:</b> {filename || 'N/A'}</div>
      {page && <div style={{ marginBottom: 12 }}><b>Page:</b> {page}</div>}
      {excerpt && <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#374151', background: '#f8fafc', borderRadius: 6, padding: 12 }}>{excerpt}</div>}
      <div style={{ marginBottom: 8 }}><b>Confidence:</b> {confidence || '-'}%</div>
      <div style={{ marginBottom: 8 }}><b>Quality:</b> {quality_rating || '-'}</div>
      <div style={{ marginBottom: 16 }}><b>Reliability Flags:</b> {reliability_flags?.join(', ') || '-'}</div>
      {download_url && (
        <a href={download_url} download style={{
          background: '#1976d2', color: '#fff', padding: '10px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, textAlign: 'center', display: 'inline-block', marginTop: 12
        }}>Download Document</a>
      )}
      {/* Embedded PDF viewer (simple, robust) */}
      {isPdf && (
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Source Preview:</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#f8fafc', minHeight: 320, maxHeight: 480 }}>
            <embed src={download_url} type="application/pdf" width="100%" height="400px" style={{ border: 'none' }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <a href={download_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontWeight: 500, textDecoration: 'underline', marginRight: 16 }}>Open Full PDF in New Tab</a>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [entities, setEntities] = useState(['', '']);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState('radar'); // 'radar' or 'bar'
  const [selectedTab, setSelectedTab] = useState(categories[0].key);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEvidence, setSidebarEvidence] = useState(null);

  // Add a ref for the analysis section
  const analysisRef = React.useRef(null);
  const reportRef = React.useRef(null);

  const handleEntityChange = (idx, value) => {
    const updated = [...entities];
    updated[idx] = value;
    setEntities(updated);
  };

  const addEntity = () => {
    setEntities([...entities, '']);
  };

  const removeEntity = (idx) => {
    if (entities.length <= 2) return; // Always keep at least 2
    setEntities(entities.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  // Add a helper to check if all entity fields are filled
  const allEntitiesFilled = entities.every(e => e.trim() !== '');
  const canSubmit = allEntitiesFilled && files.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please fill in all entity fields and upload at least one document.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('entities', entities.join(','));
      formData.append('query', query);

      const response = await fetch('http://localhost:8000/compare/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults({
        ...data.comparison,
        documents_analyzed: data.documents_analyzed,
        entities: data.entities
      });
      console.log('Set results to:', {
        ...data.comparison,
        documents_analyzed: data.documents_analyzed,
        entities: data.entities
      });
    } catch (err) {
      setError(`Error: ${err.message}. Please ensure the backend is running and reachable at http://localhost:8000.`);
    } finally {
      setLoading(false);
    }
  };

  const ConfidenceChart = ({ data }) => {
    if (!data) return null;
    
    const chartData = categories.map(cat => ({
      category: cat.name,
      entityA: data[cat.key]?.[entities[0].toLowerCase().trim()]?.confidence || 0,
      entityB: data[cat.key]?.[entities[1].toLowerCase().trim()]?.confidence || 0,
      icon: cat.icon
    }));

    return (
      <div className="confidence-chart">
        <h3>📊 Confidence Comparison</h3>
        <div className="chart-container">
          {chartData.map((item, index) => (
            <div key={index} className="chart-row">
              <div className="chart-label">
                <span className="chart-icon">{item.icon}</span>
                <span className="chart-text">{item.category}</span>
              </div>
              <div className="chart-bars">
                <div className="bar-container">
                  <div className="bar-label">{entities[0]}</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill entity-a"
                      style={{ 
                        width: `${item.entityA}%`,
                        backgroundColor: getConfidenceColor(item.entityA)
                      }}
                    ></div>
                  </div>
                  <span className="percentage">{item.entityA}%</span>
                </div>
                <div className="bar-container">
                  <div className="bar-label">{entities[1]}</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill entity-b"
                      style={{ 
                        width: `${item.entityB}%`,
                        backgroundColor: getConfidenceColor(item.entityB)
                      }}
                    ></div>
                  </div>
                  <span className="percentage">{item.entityB}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Metric definitions for tooltips
  const metricDefinitions = {
    pe_ratio: "Price/Earnings Ratio: Share price divided by earnings per share. Lower can mean better value.",
    ev_ebitda: "Enterprise Value/EBITDA: Measures company value relative to earnings before interest, taxes, depreciation, and amortization.",
    price_sales: "Price/Sales Ratio: Share price divided by revenue per share.",
    peg_ratio: "PEG Ratio: P/E ratio divided by earnings growth rate. Lower is generally better.",
    fcf_yield: "Free Cash Flow Yield: Free cash flow per share divided by share price.",
    roe: "Return on Equity: Net income divided by shareholder equity. Higher is better.",
    roa: "Return on Assets: Net income divided by total assets.",
    revenue: "Total revenue (in billions).",
    net_income: "Net profit after all expenses (in billions).",
    operating_margin: "Operating profit as a percentage of revenue.",
    fcf: "Free Cash Flow: Cash generated after capital expenditures (in billions).",
    capex: "Capital Expenditures: Money spent on fixed assets (in billions).",
    net_cash: "Net Cash: Total cash minus total debt (in billions).",
    dividend_yield: "Dividend Yield: Annual dividend per share divided by share price.",
    us_smartphone_share: "US Smartphone Market Share (%).",
    global_smartphone_share: "Global Smartphone Market Share (%).",
    ecosystem_score: "Qualitative score for ecosystem strength (1-10).",
    innovation_score: "Qualitative score for innovation (1-10).",
    ebitda_stress: "EBITDA Stress Test: Projected EBITDA decline in a severe scenario (%).",
    supply_chain_exposure: "Proportion of supply chain exposed to risk (0-1 scale).",
    tam_expansion: "Total Addressable Market expansion over 5 years (%).",
    organic_growth: "Organic revenue growth rate (%).",
    mna_activity: "Number of M&A deals in period.",
    intl_revenue_pct: "% of revenue from international markets.",
    fx_risk: "Foreign exchange risk score (higher = more risk).",
    tariff_risk: "Tariff risk score (higher = more risk).",
    renewable_pct: "% of operations powered by renewable energy.",
    dei_score: "Diversity, Equity, and Inclusion score (1-10).",
    board_diversity: "Proportion of board members from underrepresented groups.",
    ceo_tenure: "Years current CEO has served.",
    insider_ownership: "Proportion of shares owned by insiders (0-1 scale).",
    succession_plan: "Indicator if a formal CEO succession plan exists (1 = yes, 0 = no).",
    rating: "Portfolio rating (1 = Underweight, 2 = Overweight, etc.).",
    position_sizing: "Recommended portfolio position size (%).",
    action_price: "Recommended buy price ($).",
    rationale_score: "Qualitative score for investment rationale (1-10).",
    maus: "Monthly Active Users (in millions).",
    ai_investment: "Annual investment in AI (in billions).",
    reality_labs_investment: "Annual investment in Reality Labs (in billions).",
    ad_revenue_growth: "Ad revenue growth rate (%).",
    global_social_share: "Global social media market share (%).",
    r_and_d: "Research & Development spending (in billions).",
  };

  // Units for each metric
  const metricUnits = {
    pe_ratio: 'x',
    ev_ebitda: 'x',
    price_sales: 'x',
    peg_ratio: 'x',
    fcf_yield: '%',
    roe: '%',
    roa: '%',
    revenue: 'B',
    net_income: 'B',
    operating_margin: '%',
    fcf: 'B',
    capex: 'B',
    net_cash: 'B',
    dividend_yield: '%',
    us_smartphone_share: '%',
    global_smartphone_share: '%',
    ecosystem_score: '',
    innovation_score: '',
    ebitda_stress: '%',
    supply_chain_exposure: '',
    tam_expansion: '%',
    organic_growth: '%',
    mna_activity: '',
    intl_revenue_pct: '%',
    fx_risk: '',
    tariff_risk: '',
    renewable_pct: '%',
    dei_score: '',
    board_diversity: '',
    ceo_tenure: 'yrs',
    insider_ownership: '',
    succession_plan: '',
    rating: '',
    position_sizing: '%',
    action_price: '$',
    rationale_score: '',
    maus: 'M',
    ai_investment: 'B',
    reality_labs_investment: 'B',
    ad_revenue_growth: '%',
    global_social_share: '%',
    revenue: 'Revenue',
    fcf: 'Free Cash Flow',
    capex: 'CapEx'
  };

  // Helper to prettify metric labels
  const prettifyLabel = (key) => {
    // Custom prettified names for common metrics
    const custom = {
      pe_ratio: 'P/E Ratio',
      ev_ebitda: 'EV/EBITDA',
      price_sales: 'Price/Sales',
      peg_ratio: 'PEG Ratio',
      fcf_yield: 'FCF Yield',
      roe: 'ROE',
      roa: 'ROA',
      net_income: 'Net Income',
      operating_margin: 'Operating Margin',
      net_cash: 'Net Cash',
      dividend_yield: 'Dividend Yield',
      us_smartphone_share: 'US Smartphone Share',
      global_smartphone_share: 'Global Smartphone Share',
      ecosystem_score: 'Ecosystem Score',
      innovation_score: 'Innovation Score',
      ebitda_stress: 'EBITDA Stress',
      supply_chain_exposure: 'Supply Chain Exposure',
      tam_expansion: 'TAM Expansion',
      organic_growth: 'Organic Growth',
      mna_activity: 'M&A Activity',
      intl_revenue_pct: 'Intl. Revenue %',
      fx_risk: 'FX Risk',
      tariff_risk: 'Tariff Risk',
      renewable_pct: 'Renewable %',
      dei_score: 'DEI Score',
      board_diversity: 'Board Diversity',
      ceo_tenure: 'CEO Tenure',
      insider_ownership: 'Insider Ownership',
      succession_plan: 'Succession Plan',
      rating: 'Rating',
      position_sizing: 'Position Sizing',
      action_price: 'Action Price',
      rationale_score: 'Rationale Score',
      maus: 'MAUs',
      ai_investment: 'AI Investment',
      reality_labs_investment: 'Reality Labs Investment',
      ad_revenue_growth: 'Ad Revenue Growth',
      global_social_share: 'Global Social Share',
      revenue: 'Revenue',
      fcf: 'Free Cash Flow',
      capex: 'CapEx',
      r_and_d: 'R&D',
    };
    return custom[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Helper to prettify metric labels with units in parentheses
  const prettifyLabelWithUnit = (key) => {
    const label = prettifyLabel(key);
    // Only show units if they are not 'x' or ''
    const unit = metricUnits[key];
    if (unit && !['x', '', undefined].includes(unit)) {
      return `${label} (${unit})`;
    }
    return label;
  };

  // Helper to get key facts and evidence for a category
  const getKeyFactsTableData = (cat) => {
    if (!results) return { metrics: [] };
    const a = results[cat.key]?.[entities[0].toLowerCase().trim()] || {};
    const b = results[cat.key]?.[entities[1].toLowerCase().trim()] || {};
    const aFacts = a.key_facts || {};
    const bFacts = b.key_facts || {};
    // Union of all metric keys
    const metricKeys = Array.from(new Set([...Object.keys(aFacts), ...Object.keys(bFacts)]));
    return {
      metrics: metricKeys.map((key) => {
        return {
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          aValue: aFacts[key],
          bValue: bFacts[key],
          aEvidence: a.evidence || {},
          bEvidence: b.evidence || {},
        };
      })
    };
  };

  // Winner logic: for most metrics, higher is better, but for some (e.g., pe_ratio) lower is better
  const lowerIsBetter = ["pe_ratio", "price_sales", "ev_ebitda", "debt_equity", "fx_risk", "tariff_risk"]; // add more as needed
  const isWinner = (metric, a, b) => {
    if (a == null || b == null) return null;
    if (lowerIsBetter.includes(metric)) {
      if (a < b) return 'a';
      if (b < a) return 'b';
      return null;
    } else {
      if (a > b) return 'a';
      if (b > a) return 'b';
      return null;
    }
  };

  // Evidence badge component
  const EvidenceBadge = ({ evidence, value }) => {
    if (!evidence || !value) return null;
    const { evidence_quality_score, adjusted_confidence, quality_rating, reliability_flags, filename, page, excerpt, download_url } = evidence;
    const badgeEvidence = {
      filename,
      page,
      excerpt,
      confidence: adjusted_confidence,
      quality_rating,
      reliability_flags,
      download_url
    };
    const tooltip = `Evidence: ${quality_rating || ''} (${evidence_quality_score || ''})\nConfidence: ${adjusted_confidence || ''}%\n${reliability_flags ? 'Flags: ' + reliability_flags.join(', ') : ''}`;
    return (
      <span
        className="evidence-badge"
        title={tooltip}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setSidebarEvidence(badgeEvidence);
          setSidebarOpen(true);
        }}
      >📄</span>
    );
  };

  // 1. Add a minimal info circle SVG component at the top:
  const InfoCircleIcon = ({ size = 18, color = '#1976d2' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="1" />
    </svg>
  );

  const referenceMetrics = [
    { key: 'sector', label: 'Sector', defaultDefinition: 'The industry sector in which the company operates.' },
    { key: 'current_price', label: 'Current Price', defaultDefinition: 'The latest trading price of the company\'s stock.' },
    { key: 'market_cap', label: 'Market Cap', defaultDefinition: 'The total market value of a company\'s outstanding shares.' },
    { key: '52_week_high', label: '52 Week High', defaultDefinition: 'The highest price at which the stock traded in the last 52 weeks.' },
    { key: '52_week_low', label: '52 Week Low', defaultDefinition: 'The lowest price at which the stock traded in the last 52 weeks.' },
    { key: 'dividend_yield', label: 'Dividend Yield', defaultDefinition: 'A financial ratio that shows how much a company pays out in dividends each year relative to its stock price.' },
    { key: 'volume', label: 'Volume', defaultDefinition: 'The number of shares traded during a given period.' },
    { key: 'total_return_12m', label: 'Total Return (Trailing 12M)', defaultDefinition: 'The total return of the stock over the last 12 months, including dividends.' },
    { key: 'total_return_5y', label: 'Total Return (5 Years)', defaultDefinition: 'The total return of the stock over the last 5 years, including dividends.' },
    { key: 'pe_ratio', label: 'P/E Ratio', defaultDefinition: 'Price-to-Earnings Ratio: A valuation ratio of a company\'s current share price compared to its per-share earnings.' },
    { key: 'current_ratio', label: 'Current Ratio', defaultDefinition: 'A liquidity ratio that measures a company\'s ability to pay short-term obligations.' },
  ];

  function formatMetricValue(key, value) {
    if (value === undefined || value === null || value === '') return '-';
    if ([
      'current_price', 'market_cap', '52_week_high', '52_week_low'
    ].includes(key)) {
      // Currency formatting
      if (typeof value === 'string' && value.startsWith('$')) return value;
      if (key === 'market_cap') {
        // Format trillions/billions/millions
        const n = Number(value);
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
      }
      return `$${Number(value).toLocaleString()}`;
    }
    if ([
      'dividend_yield', 'total_return_12m', 'total_return_5y'
    ].includes(key)) {
      // Percent formatting
      if (typeof value === 'string' && value.endsWith('%')) return value;
      return `${Number(value).toFixed(2)}%`;
    }
    if (key === 'volume') {
      // Large number formatting
      const n = Number(value);
      if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
      if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
      return n.toLocaleString();
    }
    return value;
  }

  const KeyMetricsTable = ({ cat }) => {
    if (!results) return null;
    if (cat.key === 'investment_thesis') {
      // Render analysis and confidence for each entity, reading from .key_facts.analysis and .key_facts.confidence
      return (
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-start', margin: '2rem 0' }}>
          {entities.map(entity => {
            const thesisFacts = results[cat.key]?.[entity.toLowerCase().trim()]?.key_facts || {};
            return (
              <div key={entity} style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 24, minHeight: 120, boxShadow: '0 1px 4px rgba(102,126,234,0.06)' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#374151', marginBottom: 8 }}>{entity}</div>
                <div style={{ fontSize: 16, color: '#374151', marginBottom: 12 }}>{thesisFacts.analysis || 'No analysis available.'}</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>Confidence: <span style={{ fontWeight: 600 }}>{thesisFacts.confidence !== undefined ? thesisFacts.confidence + '%' : '-'}</span></div>
              </div>
            );
          })}
        </div>
      );
    }
    const entityFacts = entities.map(entity => ({
      entity,
      facts: results[cat.key]?.[entity.toLowerCase().trim()]?.key_facts || {},
    }));
    const metricsToShow = categoryMetrics[cat.key] || [];
    return (
      <table className="key-metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            {entities.map(entity => (
              <th key={entity}>{entity}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricsToShow.map(({ key, label }) => (
            <tr key={key}>
              <td style={{ fontWeight: 600 }}>
                <span className="metric-label has-definition" tabIndex={0}>
                  {label}
                  <span className="info-icon" tabIndex={-1} style={{ background: 'none', boxShadow: 'none', width: 18, height: 18, marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <InfoCircleIcon size={18} color="#1976d2" />
                    <span className="metric-tooltip">{entityFacts[0].facts[key]?.definition || ''}</span>
                  </span>
                </span>
              </td>
              {entityFacts.map((e) => {
                const valueObj = e.facts[key];
                return (
                  <td key={e.entity}>
                    {valueObj && valueObj.value !== undefined && valueObj.value !== null
                      ? formatMetricValue(key, valueObj.value)
                      : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Helper to build accordion items
  const getAccordionItems = () => {
    return categories.map(cat => {
      // Compute average confidence for this category
      let confidences = [];
      entities.forEach(entity => {
        const c = results?.[cat.key]?.[entity.toLowerCase().trim()]?.key_facts?.confidence;
        if (typeof c === 'number') confidences.push(c);
      });
      const avgConfidence = confidences.length
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
        : undefined;
      return {
        key: cat.key,
        name: cat.name,
        icon: cat.icon,
        metrics: categoryMetrics[cat.key] || [],
        showAnalysis: cat.key === 'investment_thesis',
        confidence: avgConfidence
      };
    });
  };

  // Add a helper to autocapitalize entity names
  const capitalizeWords = (str) => str.replace(/\b\w/g, c => c.toUpperCase());

  // PDF export handler (comprehensive report)
  const handleExportPDF = async () => {
    if (!results) return;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // --- TITLE SLIDE ---
    const titleDiv = document.createElement('div');
    titleDiv.style.width = '1100px';
    titleDiv.style.height = '600px';
    titleDiv.style.display = 'flex';
    titleDiv.style.flexDirection = 'column';
    titleDiv.style.justifyContent = 'center';
    titleDiv.style.alignItems = 'center';
    titleDiv.style.background = '#fff';
    titleDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    titleDiv.style.fontSize = '32px';
    titleDiv.innerHTML = `
      <img src='/harding-loevner-logo.png' style='height:80px;margin-bottom:32px;' />
      <div style='font-size:40px;font-weight:800;color:#1e293b;margin-bottom:24px;'>HL Compare: Analysis Report</div>
      <div style='font-size:28px;color:#1976d2;margin-bottom:18px;'>${entities.map(capitalizeWords).join(' vs ')}</div>
      <div style='font-size:20px;color:#64748b;margin-bottom:18px;'>Multi-Entity Financial & Strategic Comparison</div>
      <div style='font-size:18px;color:#374151;margin-bottom:8px;'>${new Date().toLocaleDateString()}</div>
      <div style='font-size:18px;color:#374151;'>${results.documents_analyzed || 0} documents analyzed</div>
    `;
    document.body.appendChild(titleDiv);
    const titleCanvas = await html2canvas(titleDiv, { scale: 2 });
    const titleImgData = titleCanvas.toDataURL('image/jpeg', 1.0);
    const tImgWidth = titleCanvas.width;
    const tImgHeight = titleCanvas.height;
    const tRatio = Math.min(pageWidth / tImgWidth, pageHeight / tImgHeight);
    const tPdfWidth = tImgWidth * tRatio;
    const tPdfHeight = tImgHeight * tRatio;
    const tX = (pageWidth - tPdfWidth) / 2;
    const tY = (pageHeight - tPdfHeight) / 2;
    pdf.addImage(titleImgData, 'JPEG', tX, tY, tPdfWidth, tPdfHeight);
    document.body.removeChild(titleDiv);
    pdf.addPage();
    // --- END TITLE SLIDE ---

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      // Special handling for Investment Thesis slide
      if (cat.key === 'investment_thesis') {
        // Gather data for each entity
        const thesisRows = ['Metric', 'Analysis', 'Confidence'];
        const thesisData = entities.map(entity => {
          const facts = (results[cat.key]?.[entity.toLowerCase().trim()]?.key_facts || {});
          // Find first metric key (not analysis or confidence)
          const metricKey = Object.keys(facts).find(k => k !== 'analysis' && k !== 'confidence');
          return {
            metric: metricKey ? (prettifyLabelWithUnit(metricKey) + ': ' + (facts[metricKey]?.value ?? '-')) : '-',
            analysis: facts.analysis || '-',
            confidence: (facts.confidence !== undefined && facts.confidence !== null) ? facts.confidence + '%' : '-'
          };
        });
        // Build table HTML
        const thesisTable = `
          <table style='width:100%;border-collapse:collapse;margin-bottom:24px;font-size:20px;'>
            <thead>
              <tr>
                <th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'> </th>
                ${entities.map(entity => `<th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>${capitalizeWords(entity)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style='font-weight:600;padding:8px 12px;border-bottom:1px solid #e5e7eb;'>Metric</td>
                ${thesisData.map(d => `<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${d.metric}</td>`).join('')}
              </tr>
              <tr>
                <td style='font-weight:600;padding:8px 12px;border-bottom:1px solid #e5e7eb;'>Analysis</td>
                ${thesisData.map(d => `<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${d.analysis}</td>`).join('')}
              </tr>
              <tr>
                <td style='font-weight:600;padding:8px 12px;border-bottom:1px solid #e5e7eb;'>Confidence</td>
                ${thesisData.map(d => `<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${d.confidence}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        `;
        // Build the rest of the slide
        const sectionDiv = document.createElement('div');
        sectionDiv.style.width = '1100px';
        sectionDiv.style.minHeight = '600px';
        sectionDiv.style.padding = '48px 56px';
        sectionDiv.style.background = '#fff';
        sectionDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        sectionDiv.style.fontSize = '20px';
        sectionDiv.style.lineHeight = '1.6';
        sectionDiv.innerHTML = `
          <div style="display:flex;align-items:center;margin-bottom:32px;">
            <img src='/harding-loevner-logo.png' style='height:56px;margin-right:32px;' />
            <h1 style='margin:0;font-size:32px;'>HL Compare: Analysis Report</h1>
          </div>
          <div style='font-size:22px;color:#374151;margin-bottom:8px;'><b>Focus Area:</b> ${cat.icon} ${cat.name}</div>
          <h2 style='color:#1976d2;font-size:26px;margin-bottom:16px;'>${entities.map(capitalizeWords).join(' vs ')}</h2>
          ${thesisTable}
          <div style='margin-top:24px;background:#e0e7ff;border-radius:10px;padding:20px;font-size:17px;color:#1e293b;font-style:italic;box-shadow:0 2px 8px rgba(102,126,234,0.08);'>
            <b>Deeper Insight:</b> ${results[cat.key]?.conclusion || 'This is where a summary or key takeaway for this category will appear.'}
          </div>
        `;
        document.body.appendChild(sectionDiv);
        const canvas = await html2canvas(sectionDiv, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const pdfWidth = imgWidth * ratio;
        const pdfHeight = imgHeight * ratio;
        const x = (pageWidth - pdfWidth) / 2;
        const y = 0;
        pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);
        document.body.removeChild(sectionDiv);
        if (i < categories.length - 1) pdf.addPage();
        continue; // Skip normal rendering for this slide
      }
      const a = results[cat.key]?.[entities[0].toLowerCase().trim()] || {};
      const b = results[cat.key]?.[entities[1].toLowerCase().trim()] || {};
      const aFacts = a.key_facts || {};
      const bFacts = b.key_facts || {};
      const metricKeys = Array.from(new Set([...Object.keys(aFacts), ...Object.keys(bFacts)]));

      // Create a temporary div for this section
      const sectionDiv = document.createElement('div');
      sectionDiv.style.width = '1100px';
      sectionDiv.style.minHeight = '600px';
      sectionDiv.style.padding = '48px 56px';
      sectionDiv.style.background = '#fff';
      sectionDiv.style.fontFamily = 'Segoe UI, Arial, sans-serif';
      sectionDiv.style.fontSize = '20px';
      sectionDiv.style.lineHeight = '1.6';
      sectionDiv.innerHTML = `
        <div style="display:flex;align-items:center;margin-bottom:32px;">
          <img src='/harding-loevner-logo.png' style='height:56px;margin-right:32px;' />
          <h1 style='margin:0;font-size:32px;'>HL Compare: Analysis Report</h1>
        </div>
        <div style='font-size:22px;color:#374151;margin-bottom:8px;'><b>Focus Area:</b> ${cat.icon} ${cat.name}</div>
        <h2 style='color:#1976d2;font-size:26px;margin-bottom:16px;'>${entities.map(capitalizeWords).join(' vs ')}</h2>
        <table style='width:100%;border-collapse:collapse;margin-bottom:24px;font-size:20px;'>
          <thead>
            <tr>
              <th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>Metric</th>
              ${entities.map(entity => `<th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>${capitalizeWords(entity)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${metricKeys.map(key => `
              <tr>
                <td style='font-weight:600;padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${prettifyLabelWithUnit(key)}</td>
                ${entities.map(entity => {
                  const facts = (results[cat.key]?.[entity.toLowerCase().trim()]?.key_facts || {});
                  return `<td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${facts[key]?.value ?? '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style='margin-top:24px;background:#e0e7ff;border-radius:10px;padding:20px;font-size:17px;color:#1e293b;font-style:italic;box-shadow:0 2px 8px rgba(102,126,234,0.08);'>
          <b>Deeper Insight:</b> ${results[cat.key]?.conclusion || 'This is where a summary or key takeaway for this category will appear.'}
        </div>
      `;
      document.body.appendChild(sectionDiv);

      // Use html2canvas to capture this section
      const canvas = await html2canvas(sectionDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Calculate image size to fit slide
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const pdfWidth = imgWidth * ratio;
      const pdfHeight = imgHeight * ratio;
      const x = (pageWidth - pdfWidth) / 2;
      const y = 0;

      pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);
      document.body.removeChild(sectionDiv);
      // Only add a new page if this is NOT the last category
      if (i < categories.length - 1) pdf.addPage();
    }
    pdf.save('HL-Analysis-Report.pdf');
  };

  // Helper to render the comprehensive report (hidden)
  const ComprehensiveReport = () => (
    <div id="hl-pdf-report" style={{ width: 800, padding: 32, fontFamily: 'Segoe UI, Arial, sans-serif', color: '#1e293b', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <img src="/harding-loevner-logo.png" alt="HL Logo" style={{ height: 48, marginRight: 24 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>HL Compare: Analysis Report</h1>
          <div style={{ fontSize: 16, color: '#64748b', marginTop: 4 }}>
            {new Date().toLocaleDateString()} &nbsp;|&nbsp; {capitalizeWords(entities[0])} vs {capitalizeWords(entities[1])} &nbsp;|&nbsp; {results?.documents_analyzed || 0} documents analyzed
          </div>
        </div>
      </div>
      {categories.map((cat) => {
        const a = results?.[cat.key]?.[entities[0].toLowerCase().trim()] || {};
        const b = results?.[cat.key]?.[entities[1].toLowerCase().trim()] || {};
        const aFacts = a.key_facts || {};
        const bFacts = b.key_facts || {};
        const metricKeys = Array.from(new Set([...Object.keys(aFacts), ...Object.keys(bFacts)]));
        return (
          <div key={cat.key} style={{ marginBottom: 36 }}>
            <h2 style={{ color: '#1976d2', fontSize: 22, marginBottom: 8 }}>{cat.icon} {cat.name}</h2>
            {/* Key Metrics Table */}
            {metricKeys.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 15 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', padding: '6px 8px', color: '#374151' }}>Metric</th>
                    <th style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', padding: '6px 8px', color: '#374151' }}>{capitalizeWords(entities[0])}</th>
                    <th style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', padding: '6px 8px', color: '#374151' }}>{capitalizeWords(entities[1])}</th>
                  </tr>
                </thead>
                <tbody>
                  {metricKeys.map((key) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>{prettifyLabelWithUnit(key)}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>{aFacts[key]?.value ?? '-'}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>{bFacts[key]?.value ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Analysis Text */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{capitalizeWords(entities[0])}</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, minHeight: 48, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: a.analysis_paragraph || 'No analysis available.' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{capitalizeWords(entities[1])}</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, minHeight: 48, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: b.analysis_paragraph || 'No analysis available.' }} />
              </div>
            </div>
            {/* Evidence/Confidence */}
            <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
              <div><b>Evidence Quality:</b> {a.evidence?.quality_rating || '-'} ({a.evidence?.evidence_quality_score || '-'}), <b>Confidence:</b> {a.confidence || '-'}%</div>
              <div><b>Reliability Flags:</b> {a.evidence?.reliability_flags?.join(', ') || '-'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Helper to compute overall average confidence
  const getOverallConfidence = () => {
    let confidences = [];
    categories.forEach(cat => {
      entities.forEach(entity => {
        const c = results?.[cat.key]?.[entity.toLowerCase().trim()]?.key_facts?.confidence;
        if (typeof c === 'number') confidences.push(c);
      });
    });
    return confidences.length
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : undefined;
  };

  // Add debug prints in the results table rendering section
  console.log('Entities:', entities);
  console.log('Results:', results);
  // When rendering each row:
  // console.log('Category:', cat.key, 'Entity:', entity, 'Data:', results[cat.key]?.[entity.toLowerCase().trim()]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/harding-loevner-logo.png" 
              alt="Harding Loevner" 
              className="logo"
            />
            <div className="title-section">
              <h1>HL Compare</h1>
              <p>Investment Research & Analysis Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="upload-section">
          <div className="upload-card">
            <h2>🔍 Entity Comparison Analysis</h2>
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Entities to Compare</label>
                  {entities.map((entity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <input
                        type="text"
                        value={entity}
                        onChange={e => handleEntityChange(idx, e.target.value)}
                        placeholder={`Entity ${idx + 1}`}
                        required
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      {entities.length > 2 && (
                        <button type="button" onClick={() => removeEntity(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addEntity} style={{ marginTop: 4, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>+ Add Entity</button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="query">Analysis Focus (Optional)</label>
                <input
                  type="text"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Compare growth prospects and market position"
                />
              </div>

              <div className="form-group">
                <label htmlFor="files">Upload Documents</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx"
                    required
                  />
                  <div className="file-upload-text">
                    <span>📁 Choose files or drag and drop</span>
                    <small>PDF, TXT, DOCX files supported</small>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="file-list">
                    {files.map((file, index) => (
                      <div key={index} className="file-item">
                        📄 {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={!canSubmit || loading}
              >
                {loading ? '🔄 Analyzing...' : '🚀 Start Analysis'}
              </button>
            </form>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Hidden comprehensive report for PDF export */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', background: '#fff', zIndex: -1 }}>
          <div ref={reportRef}><ComprehensiveReport /></div>
        </div>
        {results && (
          <div className="results-section" ref={analysisRef}>
            <div className="results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>📈 Analysis Results</h2>
                {/* Download button */}
                <button
                  className="download-btn"
                  onClick={handleExportPDF}
                  title="Export as PDF"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: 8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </div>
              <div className="results-meta">
                <span>📊 {results.documents_analyzed} documents analyzed</span>
                <span>⚡ {entities.map(capitalizeWords).join(' vs ')}</span>
              </div>
              <span style={{ fontSize: 18, color: '#64748b', fontWeight: 600, marginLeft: 'auto' }}>
                {getOverallConfidence() !== undefined && `${getOverallConfidence()}% confidence`}
              </span>
            </div>

            {/* Accordion for analysis descriptions */}
            <Accordion items={getAccordionItems()} entities={entities} results={results} formatMetricValue={formatMetricValue} />
          </div>
        )}
      </main>
      <EvidenceSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} evidence={sidebarEvidence} />
    </div>
  );
}

export default App; 
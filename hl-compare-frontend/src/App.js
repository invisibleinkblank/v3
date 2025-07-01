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

// Accordion component for collapsible analysis
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="accordion">
      {items.map((item, idx) => (
        <div key={item.key} className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <span className="category-icon">{item.icon}</span>
            <span className="category-title">{item.name}</span>
            <span className="confidence-badge" style={{ backgroundColor: item.confidenceColor }}>{item.confidence}%</span>
            <span className="accordion-arrow">{openIndex === idx ? '▲' : '▼'}</span>
          </button>
          {openIndex === idx && (
            <div className="accordion-content">
              <div className="entity-comparison">
                <div className="entity-column">
                  <div className="entity-header">
                    <h4>{item.entityA}</h4>
                  </div>
                  <div className="analysis-content">
                    <div dangerouslySetInnerHTML={{ __html: item.analysisA || 'No analysis available' }} />
                  </div>
                </div>
                <div className="entity-column">
                  <div className="entity-header">
                    <h4>{item.entityB}</h4>
                  </div>
                  <div className="analysis-content">
                    <div dangerouslySetInnerHTML={{ __html: item.analysisB || 'No analysis available' }} />
                  </div>
                </div>
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
  const [entityA, setEntityA] = useState('');
  const [entityB, setEntityB] = useState('');
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

  // Define entity keys at the top so they're available everywhere
  const entityAKey = entityA.toLowerCase().trim();
  const entityBKey = entityB.toLowerCase().trim();

  // Add a ref for the analysis section
  const analysisRef = React.useRef(null);
  const reportRef = React.useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length || !entityA || !entityB) {
      setError('Please provide all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('entityA', entityA);
      formData.append('entityB', entityB);
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
        entityA: data.entityA,
        entityB: data.entityB
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
      entityA: data[cat.key]?.[entityAKey]?.confidence || 0,
      entityB: data[cat.key]?.[entityBKey]?.confidence || 0,
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
                  <div className="bar-label">{entityA}</div>
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
                  <div className="bar-label">{entityB}</div>
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
    const a = results[cat.key]?.[entityAKey] || {};
    const b = results[cat.key]?.[entityBKey] || {};
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

  // Key Metrics Table component
  const KeyMetricsTable = ({ cat }) => {
    const { metrics } = getKeyFactsTableData(cat);
    if (!metrics.length) return <div style={{ color: '#888', padding: 24 }}>No key metrics available for this category.</div>;
    return (
      <table className="key-metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{entityA}</th>
            <th>{entityB}</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(({ key, aValue, bValue, aEvidence, bEvidence }) => {
            const winner = isWinner(key, aValue?.value, bValue?.value);
            const definition = metricDefinitions[key];
            return (
              <tr key={key}>
                <td style={{ fontWeight: 600 }}>
                  <span className={`metric-label${definition ? ' has-definition' : ''}`} tabIndex={0}>
                    {prettifyLabelWithUnit(key)}
                    {definition && (
                      <span className="info-icon" tabIndex={-1} style={{ background: 'none', boxShadow: 'none', width: 18, height: 18, marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <InfoCircleIcon size={18} color="#1976d2" />
                        <span className="metric-tooltip">{definition}</span>
                      </span>
                    )}
                  </span>
                </td>
                <td className={winner === 'a' ? 'winner-cell' : ''}>
                  {aValue && aValue.value !== undefined && aValue.value !== null ? aValue.value : '-'}{' '}
                  {winner === 'a' && <span className="winner-check">✔️</span>}
                  <EvidenceBadge evidence={aValue?.evidence} value={aValue?.value} />
                </td>
                <td className={winner === 'b' ? 'winner-cell' : ''}>
                  {bValue && bValue.value !== undefined && bValue.value !== null ? bValue.value : '-'}{' '}
                  {winner === 'b' && <span className="winner-check">✔️</span>}
                  <EvidenceBadge evidence={bValue?.evidence} value={bValue?.value} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Helper to build accordion items
  const getAccordionItems = () => {
    if (!results) return [];
    return categories.map((cat) => {
      const a = results[cat.key]?.[entityAKey] || {};
      const b = results[cat.key]?.[entityBKey] || {};
      return {
        key: cat.key,
        name: cat.name,
        icon: cat.icon,
        confidence: a.confidence || 0,
        confidenceColor: getConfidenceColor(a.confidence || 0),
        entityA: entityA,
        entityB: entityB,
        analysisA: a.analysis,
        analysisB: b.analysis,
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

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const a = results[cat.key]?.[entityAKey] || {};
      const b = results[cat.key]?.[entityBKey] || {};
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
        <h2 style='color:#1976d2;font-size:26px;margin-bottom:16px;'>${cat.icon} ${cat.name}</h2>
        <table style='width:100%;border-collapse:collapse;margin-bottom:24px;font-size:20px;'>
          <thead>
            <tr>
              <th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>Metric</th>
              <th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>${capitalizeWords(entityA)}</th>
              <th style='text-align:left;border-bottom:2px solid #e5e7eb;padding:8px 12px;color:#374151;'>${capitalizeWords(entityB)}</th>
            </tr>
          </thead>
          <tbody>
            ${metricKeys.map(key => `
              <tr>
                <td style='font-weight:600;padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${prettifyLabel(key)}</td>
                <td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${aFacts[key]?.value ?? '-'}</td>
                <td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>${bFacts[key]?.value ?? '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style='display:flex;gap:32px;margin-bottom:16px;'>
          <div style='flex:1;'>
            <div style='font-weight:700;color:#374151;margin-bottom:8px;font-size:20px;'>${capitalizeWords(entityA)}</div>
            <div style='background:#f8fafc;border-radius:8px;padding:16px;min-height:64px;font-size:18px;'>${a.analysis || 'No analysis available.'}</div>
          </div>
          <div style='flex:1;'>
            <div style='font-weight:700;color:#374151;margin-bottom:8px;font-size:20px;'>${capitalizeWords(entityB)}</div>
            <div style='background:#f8fafc;border-radius:8px;padding:16px;min-height:64px;font-size:18px;'>${b.analysis || 'No analysis available.'}</div>
          </div>
        </div>
        <div style='margin-top:8px;font-size:16px;color:#64748b;'>
          <div><b>Evidence Quality:</b> ${a.evidence?.quality_rating || '-'} (${a.evidence?.evidence_quality_score || '-'}) <b>Confidence:</b> ${a.confidence || '-'}%</div>
          <div><b>Reliability Flags:</b> ${a.evidence?.reliability_flags?.join(', ') || '-'}</div>
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
            {new Date().toLocaleDateString()} &nbsp;|&nbsp; {capitalizeWords(entityA)} vs {capitalizeWords(entityB)} &nbsp;|&nbsp; {results?.documents_analyzed || 0} documents analyzed
          </div>
        </div>
      </div>
      {categories.map((cat) => {
        const a = results?.[cat.key]?.[entityAKey] || {};
        const b = results?.[cat.key]?.[entityBKey] || {};
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
                    <th style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', padding: '6px 8px', color: '#374151' }}>{capitalizeWords(entityA)}</th>
                    <th style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb', padding: '6px 8px', color: '#374151' }}>{capitalizeWords(entityB)}</th>
                  </tr>
                </thead>
                <tbody>
                  {metricKeys.map((key) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>{prettifyLabel(key)}</td>
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
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{capitalizeWords(entityA)}</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, minHeight: 48, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: a.analysis || 'No analysis available.' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{capitalizeWords(entityB)}</div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, minHeight: 48, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: b.analysis || 'No analysis available.' }} />
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
                  <label htmlFor="entityA">Entity A</label>
                  <input
                    type="text"
                    id="entityA"
                    value={entityA}
                    onChange={(e) => setEntityA(e.target.value)}
                    placeholder="e.g., Apple Inc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entityB">Entity B</label>
                  <input
                    type="text"
                    id="entityB"
                    value={entityB}
                    onChange={(e) => setEntityB(e.target.value)}
                    placeholder="e.g., Microsoft Corp."
                    required
                  />
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
                disabled={loading}
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
                <span>⚡ {capitalizeWords(entityA)} vs {capitalizeWords(entityB)}</span>
              </div>
            </div>

            {/* Tab/button menu for charts */}
            <div className="charts-tab-menu">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  className={`tab-btn${selectedTab === cat.key ? ' active' : ''}`}
                  onClick={() => setSelectedTab(cat.key)}
                >
                  <span className="category-icon">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
            <div className="charts-tab-content">
              <KeyMetricsTable cat={categories.find(c => c.key === selectedTab)} />
            </div>

            {/* Accordion for analysis descriptions */}
            <Accordion items={getAccordionItems()} />
          </div>
        )}
      </main>
      <EvidenceSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} evidence={sidebarEvidence} />
    </div>
  );
}

export default App; 
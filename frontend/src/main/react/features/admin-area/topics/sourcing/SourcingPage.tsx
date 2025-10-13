import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/apps/app/AdminLayout';
import '@/styles/admin.css';
import '@/styles/worker.css';
import { ArrowLeft, Building2, Edit3, Trash2, ListPlus, Plus } from 'lucide-react';

const STATS = [
  { label: <h3>Katalog</h3> , value: '3'},
  { label: <h3>Gesamtfragen</h3>, value: '50' },
  { label: <h3>Durchschnitt</h3>, value: '10 pro Katalog'},
];

export default function OperatingModelPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      {/* ===== HEADER ===== */}
      <header className="main-header">
           <div className="header-left">
            <button className="btn btn-outline" onClick={() => navigate('/admin')}>
              <ArrowLeft size={18} />
              <span>Zurück zur Übersicht</span>
            </button>
          </div>                  
          
          <div className="header-center">
            <div className="header-text">
              <h1>
                <Building2 size={34} /> IT Sourcing  
                
              </h1>
              <p>Beschaffung und Lieferantenmanagement</p>
            </div>
          </div>        
      </header>

      {/* ===== INHALT ===== */}
      <div className="dashboard-content">
        
        <section className="stats-panel">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-content">
                  <div className="stat-info">
                    <p className=''>{s.label}</p>
                    <p className="stat-value">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="topics-section">
          <div className="header-actions">
           
            <button className="btn btn-caramel">
              <Plus size={24} />
              <span>Neuer Katalog</span>
            </button>
          </div>
        </section>
        

        {/* ===== KATALOG-KARTEN ===== */}
        <section className="catalogs wrapper">
          <div className="grid-cards">
            {/* Karte 1 */}
            <div className="survey-card">
              <div className="card-top">
                <div className="top-row">
                  <span className="tag">Katalog 1</span>
                  <span className="questions">15 Fragen</span>
                </div>
                <h2>Prozesse</h2>
                <p className="subtitle1">Organisationsstrukturen</p>
              </div>
              <div className="card-bottom">
                <div className="info-row">
                  <span><span className="dot green" />Aktiv</span>
                  <span><span className="dot blue" />Letzte Änderung: Heute</span>
                </div>
                <div className="topic-buttons">
                  <button className="btn btn-outline"><Edit3 size={16} /> Bearbeiten</button>
                  <button className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                    <Trash2 size={16} /> Löschen
                  </button>
                  <button className="start-button"><ListPlus size={16} /> Fragen verwalten</button>
                </div>
              </div>
            </div>

            {/* Karte 2 */}
            <div className="survey-card">
              <div className="card-top">
                <div className="top-row">
                  <span className="tag">Katalog 2</span>
                  <span className="questions">20 Fragen</span>
                </div>
                <h2>Geschäftsprozesse</h2>
                <p className="subtitle1">Strategische Ausrichtung</p>
              </div>
              <div className="card-bottom">
                <div className="info-row">
                  <span><span className="dot green" />Aktiv</span>
                  <span><span className="dot blue" />Letzte Änderung: Gestern</span>
                </div>
                <div className="topic-buttons">
                  <button className="btn btn-outline"><Edit3 size={16} /> Bearbeiten</button>
                  <button className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                    <Trash2 size={16} /> Löschen
                  </button>
                  <button className="start-button"><ListPlus size={16} /> Fragen verwalten</button>
                </div>
              </div>
            </div>

            {/* Karte 3 */}
            <div className="survey-card">
              <div className="card-top">
                <div className="top-row">
                  <span className="tag">Katalog 3</span>
                  <span className="questions">15 Fragen</span>
                </div>
                <h2>Governance</h2>
                <p className="subtitle1">IT-Compliance und Kontrolle</p>
              </div>
              <div className="card-bottom">
                <div className="info-row">
                  <span><span className="dot green" />Aktiv</span>
                  <span><span className="dot blue" />Letzte Änderung: Heute</span>
                </div>
                <div className="topic-buttons">
                  <button className="btn btn-outline"><Edit3 size={16} /> Bearbeiten</button>
                  <button className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>
                    <Trash2 size={16} /> Löschen
                  </button>
                  <button className="start-button"><ListPlus size={16} /> Fragen verwalten</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

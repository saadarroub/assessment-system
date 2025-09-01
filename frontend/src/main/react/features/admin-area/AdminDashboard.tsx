// src/main/react/features/admin-area/AdminDashboard.tsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '@/styles/admin.css';
import AdminLayout from '@/apps/app/AdminLayout'; // ⬅️ ggf. anpassen auf "@/layouts/AdminLayout"

import myLogo from '@/assets/Zero-6-icons-05.webp';
import { Plus, ArrowRight, MinusSquare } from 'lucide-react';

type Stat = { label: string; value: string;tone?: 'positive' | 'neutral' };
const STATS: Stat[] = [
  { label: 'Themenschwerpunkte', value: '4', tone: 'positive' },
  { label: 'Gesamtfragen',        value: '250', tone: 'positive' },
  { label: 'Aktive Nutzer',       value: '89', tone: 'positive' },
  { label: 'Letzte Änderung',     value: 'Heute', tone: 'neutral' },
];

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  catalog: string;
  questions: number;
  kind: 'strategy' | 'project' | 'sourcing' | 'business';
  slug: string; // wird für die Route benutzt
};

const TOPICS: Topic[] = [
  {
    id: 't4',
    title: 'IT Operating Model',
    subtitle: 'Organisationsstrukturen und Prozesse',
    catalog: 'Katalog 4',
    questions: 40,
    kind: 'business',
    slug: 'operating-model', // -> /admin/topics/operating-model
  },
  {
    id: 't1',
    title: 'Enterprise Architecture Management',
    subtitle: 'Strategische IT-Planung und -Ausrichtung',
    catalog: 'Katalog 1',
    questions: 30,
    kind: 'strategy',
    slug: 'eam', // -> /admin/topics/eam
  },
  {
    id: 't2',
    title: 'IT Sourcing',
    subtitle: 'Beschaffung und Lieferantenmanagement',
    catalog: 'Katalog 3',
    questions: 50,
    kind: 'sourcing',
    slug: 'sourcing', // -> /admin/topics/sourcing
  },
  {
    id: 't3',
    title: 'IT Project Management',
    subtitle: 'Projektplanung und -durchführung',
    catalog: 'Katalog 2',
    questions: 50,
    kind: 'project',
    slug: 'project-management', // -> /admin/topics/project-management
  },
];

const EMOJI: Record<Topic['kind'], string> = {
  strategy: '🎯',
  project:  '📊',
  sourcing: '🤝',
  business: '⚙️',
};

export default function AdminDashboard() {
  const navigate = useNavigate(); // für „Neues Thema“

  return (
    <AdminLayout>
      {/* ====== Hero ====== */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <img src={myLogo} alt="Dein Logo" />
          </div>
          <div className="header-center">
            <div className="header-text">
              <h1>Fragenkatalog Administration</h1>
              <p>Verwalten Sie Ihre Themenschwerpunkte und erstellen Sie finale Kataloge für Kunden</p>
            </div>
          </div>
          <div className="header-right" />
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/admin/adminPanel')}>
            <MinusSquare size={16} />
            <span>Admin-Panal</span>
          </button>
        </div>
      </header>

      {/* ====== Content ====== */}
      <div className="dashboard-content">
        {/* Stats */}
        <section className="stats-panel">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-value">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section className="topics-section">
          <div className="section-header">
            <h2>Themenschwerpunkte</h2>
            <button className="btn btn-caramel">
              <Plus size={16} />
              <span>Neues Thema hinzufügen</span>
            </button>
          </div>

          <div className="topics-grid">
            {TOPICS.map((t) => (
              <div className={`topic-card card-v2 kind-${t.kind}`} key={t.id}>
                <ArrowRight className="card-right-arrow" size={20} />
                <div className="topic-title-row">
                  <span className="topic-emoji" aria-hidden>{EMOJI[t.kind]}</span>
                  <div className="topic-text">
                    <h3 className="topic-title">{t.title}</h3>
                  </div>
                </div>
                <ul className="topic-bullets">
                  <li>{t.subtitle}</li>
                </ul>
                <div className="topic-footer">
                  <div className="topic-details">
                    <span className="topic-catalog">{t.catalog}</span>{' '}
                    <span className="topic-questions">
                      Fragen: <strong>{t.questions}</strong>
                    </span>
                  </div>

                  {/* absoluter Link pro Topic */}
                  <Link to={`/admin/topics/${t.slug}`} className="btn btn-manage">
                    Verwalten <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* ====== /Content ====== */}
    </AdminLayout>
  );
}

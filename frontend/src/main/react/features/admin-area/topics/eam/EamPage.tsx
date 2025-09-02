import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/apps/app/AdminLayout';
import '@/styles/admin.css';
import { ArrowLeft, Pencil, Trash2, ListTodo, Folder, MessageSquare } from 'lucide-react';

export default function OperatingModelPage() {
  const navigate = useNavigate();

  // Beispielwerte (kannst du später dynamisch laden)
  const catalogCount = 3;
  const totalQuestions = 0;
  const avgQuestions = 0;

  return (
    <AdminLayout>
      <header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-text">
              <h1>Enterprise Architecture Management</h1>
              <p>Strategische IT-Planung und -Ausrichtung</p>
            </div>
          </div>
          <div className="header-right" />
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin')}>
            <ArrowLeft size={16} />
            <span>Zurück zur Übersicht</span>
          </button>
        </div>
      </header>

      {/* 🔷 Oberer Info-Block */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '2rem'
          
        }}
      >
        {[
          {
            title: 'Katalog',
            value: catalogCount,
            icon: <Folder size={20} color="#5D7D95" />,
          },
          {
            title: 'Gesamtfragen',
            value: totalQuestions,
            icon: <MessageSquare size={20} color="#5D7D95" />,
          },
          {
            title: 'Durchschnitt',
            value: `${avgQuestions} pro Katalog`,
            icon: <MessageSquare size={20} color="#5D7D95" />,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              flex: '0.5 0 250px',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '200px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{item.title}</div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1f2937' }}>{item.value}</div>
            </div>
            <div>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* 🔷 Katalogkarten */}
      <div
        className="dashboard-content"
        style={{
          display: 'flex',
          gap: '1.75rem',
          flexWrap: 'wrap',
           marginTop: '0rem',
        }}
      >
        {[
          {
            title: 'Katalog 1 – Prozesse',
            subtitle: 'Organisationsstrukturen',
          },
          {
            title: 'Katalog 2 – Prozesse',
            subtitle: 'Geschäftsprozesse',
          },
          {
            title: 'Katalog 3 – Governance',
            subtitle: 'IT-Governance und Compliance',
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              flex: '1 1 300px',
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '280px',
            }}
          >
            <div style={{ height: '6px', backgroundColor: '#5D7D95' }} />
            <div style={{ padding: '1rem', flex: '1' }}>
              <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>{item.title}</h3>
              <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.9rem' }}>{item.subtitle}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Bearbeiten */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    color: '#1f2937',
                  }}
                >
                  <Pencil size={16} />
                  Bearbeiten
                </button>

                {/* Löschen */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    border: '1px solid #f87171',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                  Löschen
                </button>

                {/* Fragen verwalten */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#5D7D95',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <ListTodo size={16} />
                  Fragen verwalten
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

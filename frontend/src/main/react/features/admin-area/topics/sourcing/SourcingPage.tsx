import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/apps/app/AdminLayout';
import '@/styles/admin.css';
import { ArrowLeft } from 'lucide-react';

export default function SourcingPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-text">
              <h1>IT Sourcing</h1>
              <p>Beschaffung und Lieferantenmanagement verwalten</p>
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

      <div className="dashboard-content">
        <div className="card-v2" style={{ padding: '1.25rem' }}>
          <p>Hier kommen Editor/Listen für <strong>IT Sourcing</strong> rein …</p>
        </div>
      </div>
    </AdminLayout>
  );
}

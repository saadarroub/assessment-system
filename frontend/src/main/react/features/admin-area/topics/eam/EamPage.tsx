// src/main/react/features/admin-area/topics/eam/EamPage.tsx
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/apps/app/AdminLayout';
import { ArrowLeft } from 'lucide-react';

// import ConditionEditor from '@/features/admin-area/catalogs/ConditionEditor'; // falls gebraucht

export default function EamPage() {
  const navigate = useNavigate();

  return (

     <AdminLayout>
      <header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-text">
              <h1>Enterprise Architecture Management</h1>
              <p>Verwalten Sie Domains, Standards und Referenzarchitekturen</p>
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
          <p>Hier kommen Editor/Listen für <strong>Enterprise Architecture Management</strong> rein …</p>
        </div>
      </div>
    </AdminLayout>

    
  );
}

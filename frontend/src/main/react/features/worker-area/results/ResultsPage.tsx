import { useParams } from 'react-router-dom';
import AppHeader from '@/apps/app/AppHeader';

export default function ResultsPage() {
  const { sessionId } = useParams(); // /app/results/:sessionId

  return (
    <>
      <AppHeader />

      <div className="wrapper" style={{ padding: '24px 0' }}>
        <h1 style={{ margin: 0 }}>Ergebnisse</h1>
        <p style={{ color: '#64748b' }}>
          Session: <strong>{sessionId ?? '—'}</strong>
        </p>

        <div style={{
          background: '#fff', padding: 16, borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,.06)', minHeight: 240
        }}>
          <em>Hier kommen später Score, Diagramme und Empfehlungen hin.</em>
        </div>
      </div>
    </>
  );
}

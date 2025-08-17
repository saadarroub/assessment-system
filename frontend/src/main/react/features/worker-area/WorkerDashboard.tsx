// src/main/react/features/worker-area/WorkerDashboard.tsx
import AppHeader from '@/apps/app/AppHeader';
import '@/styles/worker.css';

type Catalog = {
  id: string;
  tag: string;
  title: string;
  questionsLabel: string;
  subtitle: string;
  est: string;
  features: string[];
  theme: 'blue' | 'orange' | 'green' | 'purple';
};

const CATALOGS: Catalog[] = [
  {
    id: 'it-strategy',
    tag: 'IT-Strategie',
    title: 'IT-Strategie Grundlagen',
    questionsLabel: '👤 25 Fragen',
    subtitle: 'Bewertung der grundlegenden IT-Strategien und deren Umsetzung.',
    est: '15–20 Min',
    features: ['Dynamische Fragentiefe', 'Echtzeit-Fortschritt', 'Adaptive Felder'],
    theme: 'blue',
  },
  {
    id: 'cybersec',
    tag: 'Cybersecurity',
    title: 'Cybersecurity Assessment',
    questionsLabel: '👤 20 Fragen',
    subtitle: 'Erhebung des Reifegrads Ihrer Informationssicherheit.',
    est: '20 Min',
    features: ['Maßnahmenübersicht', 'Schwachstellen-Check', 'ISO-Nähe'],
    theme: 'orange',
  },
  {
    id: 'dx',
    tag: 'Digitalisierung',
    title: 'Digital Transformation',
    questionsLabel: '👤 18 Fragen',
    subtitle: 'Bewertung des Digitalisierungsgrads im Branchenvergleich.',
    est: '15 Min',
    features: ['Benchmark', 'Reifegradmodelle', 'Automatische Auswertung'],
    theme: 'green',
  },
  {
    id: 'data-mgmt',
    tag: 'Datenstrategie',
    title: 'Data Management',
    questionsLabel: '👤 22 Fragen',
    subtitle: 'Analyse von Governance und Datenqualität.',
    est: '20 Min',
    features: ['DQ-Check', 'Governance-Analyse', 'Zukunftsfähigkeit'],
    theme: 'purple',
  },
];

function CatalogCard({ data, onStart }: { data: Catalog; onStart: () => void }) {
  return (
    <div className="survey-card">
      <div className={`card-top ${data.theme}`}>
        <div className="top-row">
          <span className="tag">{data.tag}</span>
          <span className="questions">{data.questionsLabel}</span>
        </div>
        <h2>{data.title}</h2>
        <p className="subtitle1">{data.subtitle}</p>
      </div>

      <div className="card-bottom">
        <div className="info-row">
          <span className="info"><span className="dot green" />Geschätzte Zeit: {data.est}</span>
          <span className="info"><span className="dot blue" />Interaktiv</span>
        </div>

        <div className="features">
          <strong>Umfrage-Features:</strong>
          <ul>{data.features.map(f => <li key={f}>✔ {f}</li>)}</ul>
        </div>

        <button className={`start-button ${data.theme}-btn`} onClick={onStart}>
          Umfrage starten →
        </button>
      </div>
    </div>
  );
}

export default function WorkerDashboard() {
  return (
    <>
      {/* Globaler Header aus eigener Komponente */}
      <AppHeader />

      {/* Intro */}
      <section className="main">
        <h1>Willkommen zur Umfrage</h1>
        <p>
          Beantworten Sie strukturierte Fragenkataloge und helfen Sie,
          strategische Themen in Ihrem Unternehmen zu analysieren.
        </p>
      </section>

      {/* Kennzahlen */}
      <section className="stats">
        <div className="wrapper">
          <div className="stat"><div className="number">4</div><div>Verfügbare Kataloge</div></div>
          <div className="stat"><div className="number">107</div><div>Geplante Projekte</div></div>
          <div className="stat"><div className="number">15</div><div>Spontanbewertungen</div></div>
        </div>
      </section>

      {/* Kataloge – 3 pro Reihe, automatisch umbrechend */}
      <section className="catalogs">
        <div className="wrapper grid-cards">
          {CATALOGS.map(c => (
            <CatalogCard key={c.id} data={c} onStart={() => console.log('start', c.id)} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>
          Bereit loszulegen?
          <br />
          Wählen Sie einen der obigen Kataloge und starten Sie die Bewertung.
        </p>
        <div className="secure-box">✅ Ihre Daten sind sicher und werden vertraulich behandelt</div>
      </footer>
    </>
  );
}

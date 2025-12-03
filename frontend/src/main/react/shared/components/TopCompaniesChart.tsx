import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type CompanyData = {
  name: string;
  count: number;
};

type TopCompaniesChartProps = {
  data: CompanyData[];
  title?: string;
  description?: string;
};

const COLORS = ["#264555", "#56768f", "#808080", "#d2c9b9", "#4F6B7E"];

export function TopCompaniesChart({ data, title, description }: TopCompaniesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        border: '1px solid hsl(var(--border))', 
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: '#9ca3af'
      }}>
        Keine Daten verfügbar
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      border: '1px solid hsl(var(--border))', 
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {title && (
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#264555' }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {description}
        </p>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#6b7280" 
            style={{ fontSize: '0.75rem' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
            labelStyle={{ fontWeight: 600, color: '#264555' }}
            formatter={(value: number) => [`${value} Zuweisungen`, 'Anzahl']}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

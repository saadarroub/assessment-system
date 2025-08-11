import { useAuthCtx } from '@/core/auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuthCtx();
  return (
    <div style={{ padding: 24 }}>
      <h2>Login (Testversion)</h2>
      <button onClick={() => login('dummy-token', ['superadmin'])}>
        Login als Superadmin
      </button>
      <button
        style={{ marginLeft: 8 }}
        onClick={() => login('dummy-token', ['user'])}
      >
        Login als User
      </button>
    </div>
  );
}

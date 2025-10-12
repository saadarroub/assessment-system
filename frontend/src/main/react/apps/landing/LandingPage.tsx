import AppHeader from "../app/AppHeader";

export default function LandingPage() {
  return (
    <>
    <AppHeader/>
    <div style={{ padding: 24 }}>
      <h1>Willkommen auf der Landing Seite</h1>
      <p>Bitte <a href="/login">einloggen</a>.</p>
    </div>
    </> 
  );
}

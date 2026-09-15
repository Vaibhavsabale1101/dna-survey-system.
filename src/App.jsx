import { useState } from 'react';
import './App.css';
import { FORMS_META } from './data/constants';
import { useSession } from './hooks/useStore';
import Form0 from './forms/Form0';
import FormA from './forms/FormA';
import FormB from './forms/FormB';
import FormC from './forms/FormC';
import FormD from './forms/FormD';
import FormE from './forms/FormE';
import FormF from './forms/FormF';
import { villageMap } from './data/constants';
import ExportData from './components/ExportData';

export default function App() {
  const [active, setActive] = useState('0');
  const [session, setSession] = useSession();

  const renderForm = () => {
    switch (active) {
      case '0':
        return <Form0 session={session} setSession={setSession} />;
      case 'A':
        return <FormA session={session} setSession={setSession} />;
      case 'B':
        return <FormB session={session} setSession={setSession} />;
      case 'C':
        return <FormC session={session} setSession={setSession} />;
      case 'D':
        return <FormD session={session} setSession={setSession} />;
      case 'E':
        return <FormE session={session} setSession={setSession} />;
      case 'F':
        return <FormF session={session} setSession={setSession} />;
      case 'EXPORT':
        return <ExportData session={session} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          DNA Forms
          <small>
            Sant Gadge Baba Unnat Gram
            <br />
            वैभववाडी · सिंधुदुर्ग
          </small>
        </div>
        <nav>
          {FORMS_META.map((f) => (
            <button key={f.id} className={active === f.id ? 'on' : ''} onClick={() => setActive(f.id)} type="button">
              {f.short}
            </button>
          ))}
          <button className={active === 'EXPORT' ? 'on' : ''} onClick={() => setActive('EXPORT')} type="button">
            Excel Export
          </button>
        </nav>
        <div className="count" style={{ marginTop: 20 }}>
          Current village
          <b style={{ fontSize: 16, marginTop: 6 }}>
            {session.villageCode ? `${session.villageCode} — ${session.village || villageMap[session.villageCode] || ''}` : 'Not set'}
          </b>
          <small style={{ display: 'block', marginTop: 6, color: '#bcd0dc' }}>
            Common fields carry across forms in this browser session.
          </small>
        </div>
      </aside>
      <main className="main">{renderForm()}</main>
    </div>
  );
}

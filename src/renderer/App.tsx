import React from 'react';
import { QuickCaptureForm } from './components/capture/QuickCaptureForm';
import { FleetingNoteList } from './components/notes/FleetingNoteList';

/**
 * アプリのルートコンポーネント
 * URL クエリパラメータ `mode=capture` の場合はクイックキャプチャ画面を表示する
 */
export default function App(): React.ReactElement {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');

  if (mode === 'capture') {
    return <QuickCaptureForm />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Zettelkastener</h1>
        <p style={styles.shortcut}>
          <kbd style={styles.kbd}>Ctrl+Shift+N</kbd> でクイックキャプチャ
        </p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Fleeting Notes</h2>
        <FleetingNoteList />
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1b26',
    color: '#cdd6f4',
    fontFamily: "'Noto Sans CJK JP', 'Noto Sans JP', system-ui, sans-serif",
    padding: '0 0 40px',
  },
  header: {
    padding: '24px 32px 16px',
    borderBottom: '1px solid #313244',
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#cdd6f4',
  },
  shortcut: {
    margin: 0,
    fontSize: 12,
    color: '#6c7086',
  },
  kbd: {
    background: '#313244',
    border: '1px solid #45475a',
    borderRadius: 4,
    padding: '1px 5px',
    fontSize: 11,
    color: '#cdd6f4',
    fontFamily: 'monospace',
  },
  section: {
    padding: '20px 32px 0',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#6c7086',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
} as const;


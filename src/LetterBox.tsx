import { useState } from 'react';

interface Props {
  label: string;
  text: string;
}

// folded letter with a copy button
export default function LetterBox({ label, text }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <details className="note-fold">
      <summary>{label}</summary>
      <p className="note" style={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
      <button className="btn ghost" onClick={copy}>
        {copied ? 'Kopierat!' : 'Kopiera brev'}
      </button>
    </details>
  );
}

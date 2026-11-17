// Renders a lexicon cell: text between backticks becomes a code span.
export function Inline({ text }: { text: string }) {
  const parts = text.split('`');
  // an odd count of backticks leaves the last part unclosed: render it as text
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 && i < parts.length - 1 ? <code key={i}>{p}</code> : <span key={i}>{i % 2 === 1 ? '`' + p : p}</span>))}
    </>
  );
}

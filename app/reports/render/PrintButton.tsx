'use client';

export default function PrintButton() {
  return (
    <button className="btn-print" onClick={() => window.print()}>
      🖨 Download / Print PDF
    </button>
  );
}

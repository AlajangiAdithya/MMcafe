/**
 * SectionLabel, editorial label used at the top of every section.
 * Format:  001  ──  OUR STORY
 *
 * Props:
 *   number, string like "001" (zero-padded)
 *   label, English caption, all-caps
 *   align, "left" (default) | "center"
 */
export default function SectionLabel({ number, label, align = 'left' }) {
  return (
    <div className={`ed-label ed-label--${align}`}>
      <span className="ed-label-num">{number}</span>
      <span className="ed-label-rule" aria-hidden="true" />
      <span className="ed-label-text">{label}</span>
    </div>
  )
}

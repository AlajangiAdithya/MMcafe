/**
 * ScrollingColumns, wolverineworldwide.com-style wall of photos: N columns that
 * scroll vertically forever (alternating up/down, varied speeds). Pure-CSS
 * marquee (see `.scol*` in animation-tokens.css) so it animates without the page
 * scrolling; the loop is seamless because each column renders its images twice.
 *
 * Decorative → aria-hidden. Theme-neutral; drop it inside any section.
 *
 *   <ScrollingColumns columns={[[...img], [...img], ...]} />
 */
export default function ScrollingColumns({ columns, className = '' }) {
  return (
    <div className={`scol ${className}`.trim()} aria-hidden="true">
      {columns.map((imgs, ci) => (
        <div key={ci} className={`scol-col${ci % 2 === 1 ? ' scol-col--down' : ''}`}>
          {[...imgs, ...imgs].map((src, ii) => (
            <img key={ii} className="scol-img" src={src} alt="" loading="lazy" draggable="false" />
          ))}
        </div>
      ))}
    </div>
  )
}

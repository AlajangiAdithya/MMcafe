import { useId, useRef, useState, type KeyboardEvent } from "react"

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function ArrowIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

type IgTab = {
  value: string
  role: string
  name: string
  handle: string
  url: string
  blurb: string
  img: string
  note: string
}

const IG_TABS: IgTab[] = [
  {
    value: "brand",
    role: "The Brand",
    name: "Mastermind Brews",
    handle: "@mastermindbrews",
    url: "https://www.instagram.com/mastermindbrews/",
    blurb:
      "Single-origin beans, brew guides, and the craft behind every cup, the stories that go from farm to your first pour.",
    img: "/pour-over-coffee.jpg",
    note: "Beans · Brew guides · Craft",
  },
  {
    value: "brewer",
    role: "The Brewer",
    name: "Namrata is Brewing",
    handle: "@namrata_is_brewing",
    url: "https://www.instagram.com/namrata_is_brewing/",
    blurb:
      "Behind the bar with our founder: training, competitions, and the everyday brews that sharpen the craft.",
    img: "/namrata-thakkar.jpg",
    note: "Founder · Training · Competitions",
  },
  {
    value: "cafe",
    role: "The Cafe",
    name: "Mastermind Bicycle Cafe",
    handle: "@mastermindbicyclecafe",
    url: "https://www.instagram.com/mastermindbicyclecafe/",
    blurb:
      "Our home in Mulund: coffee, community, and bicycles under one roof, where every regular becomes a familiar face.",
    img: "/hero-bg.jpg",
    note: "Mulund · Community · Bicycles",
  },
]

export default function InstagramTabs() {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const next = (index + IG_TABS.length) % IG_TABS.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault()
        focusTab(index + 1)
        break
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault()
        focusTab(index - 1)
        break
      case "Home":
        e.preventDefault()
        focusTab(0)
        break
      case "End":
        e.preventDefault()
        focusTab(IG_TABS.length - 1)
        break
    }
  }

  return (
    <div className="ig-tabs">
      <div className="ig-tablist" role="tablist" aria-label="Follow the journey on Instagram">
        {IG_TABS.map((t, i) => {
          const selected = i === active
          return (
            <button
              key={t.value}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              id={`${baseId}-tab-${t.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.value}`}
              tabIndex={selected ? 0 : -1}
              data-state={selected ? "active" : "inactive"}
              className="ig-tab"
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="ig-tab-role">{t.role}</span>
              <span className="ig-tab-name">{t.name}</span>
            </button>
          )
        })}
      </div>

      {IG_TABS.map((t, i) => {
        const selected = i === active
        return (
          <div
            key={t.value}
            role="tabpanel"
            id={`${baseId}-panel-${t.value}`}
            aria-labelledby={`${baseId}-tab-${t.value}`}
            hidden={!selected}
            data-state={selected ? "active" : "inactive"}
            className="ig-tab-panel"
          >
            <div className="ig-panel-media">
              <img src={t.img} alt={`${t.name} on Instagram`} loading="lazy" />
              <span className="ig-panel-tag">{t.role}</span>
            </div>

            <div className="ig-panel-content">
              <span className="ig-panel-kicker">
                <InstagramIcon size={14} /> On Instagram
              </span>
              <h3 className="ig-panel-name">{t.name}</h3>
              <p className="ig-panel-blurb">{t.blurb}</p>
              <span className="ig-panel-note">{t.note}</span>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ig-panel-btn"
              >
                Follow {t.handle}
                <ArrowIcon size={15} />
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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

const IG_TABS = [
  {
    value: "brand",
    role: "The Brand",
    name: "Mastermind Brews",
    handle: "@mastermindbrews",
    url: "https://www.instagram.com/mastermindbrews/",
    blurb: "Single-origin beans, brew guides, and the craft behind every cup.",
  },
  {
    value: "brewer",
    role: "The Brewer",
    name: "Namrata is Brewing",
    handle: "@namrata_is_brewing",
    url: "https://www.instagram.com/namrata_is_brewing/",
    blurb: "Behind the bar with our founder — training, competitions, and everyday brews.",
  },
  {
    value: "cafe",
    role: "The Cafe",
    name: "Mastermind Bicycle Cafe",
    handle: "@mastermindbicyclecafe",
    url: "https://www.instagram.com/mastermindbicyclecafe/",
    blurb: "Our home in Mulund — coffee, community, and bicycles under one roof.",
  },
]

export default function InstagramTabs() {
  return (
    <Tabs defaultValue="brand" className="ig-tabs flex w-full flex-col items-center">
      <TabsList className="h-auto flex-wrap justify-center gap-1.5 rounded-full p-1.5">
        {IG_TABS.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="rounded-full px-5 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition-all data-[state=active]:shadow-sm"
          >
            {t.role}
          </TabsTrigger>
        ))}
      </TabsList>

      {IG_TABS.map((t) => (
        <TabsContent
          key={t.value}
          value={t.value}
          className="ig-tab-panel mt-8 w-full max-w-md focus-visible:ring-0"
        >
          <div className="flex min-h-[300px] flex-col items-center gap-5 rounded-3xl border border-border bg-card px-8 py-10 text-center">
            <span className="ed-ig-icon">
              <InstagramIcon size={22} />
            </span>
            <span className="ed-ig-role">{t.role}</span>
            <h3 className="ed-ig-name" style={{ margin: 0 }}>
              {t.name}
            </h3>
            <p className="ig-tab-blurb">{t.blurb}</p>
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-btn ed-btn-primary mt-1"
            >
              <InstagramIcon size={15} /> Follow {t.handle}
            </a>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

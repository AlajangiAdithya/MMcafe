import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, GraduationCap, Mail } from 'lucide-react'
import { usePageMeta } from '../lib/usePageMeta'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const QUICK_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/store', label: 'Buy Coffee', icon: ShoppingBag },
  { to: '/workshop', label: 'Learn Coffee', icon: GraduationCap },
  { to: '/contact', label: 'Contact Us', icon: Mail },
]

export default function NotFound() {
  usePageMeta({
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found. Explore Mastermind Brews — specialty coffee, the barista academy, and more.',
    noindex: true,
  })

  return (
    <div className="notfound-page">
      <motion.div
        className="notfound-inner"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
      >
        <motion.span className="notfound-eyebrow" variants={fadeUp}>
          Error 404
        </motion.span>
        <motion.div className="notfound-code" variants={fadeUp} aria-hidden="true">
          4<span className="notfound-bean">0</span>4
        </motion.div>
        <motion.h1 className="notfound-title" variants={fadeUp}>
          This page brewed away.
        </motion.h1>
        <motion.p className="notfound-lede" variants={fadeUp}>
          The link you followed is broken or the page has moved. Let&rsquo;s get
          you back to something good.
        </motion.p>

        <motion.nav className="notfound-links" variants={fadeUp} aria-label="Helpful links">
          {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="notfound-link">
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </motion.nav>
      </motion.div>
    </div>
  )
}

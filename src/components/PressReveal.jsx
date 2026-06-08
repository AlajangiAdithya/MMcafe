import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// Redesigned sequential "WhileInView" animation
export default function PressReveal({
  image = '/mastermind-times.jpg',
  alt = 'Mastermind Times, a global culinary revolution menu poster',
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section 
      className="designer-press-section" 
      data-chapter="press"
      style={{ 
        padding: '120px 0', 
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background ambient gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '400px', background: 'radial-gradient(circle at 50% 0%, rgba(201, 151, 74, 0.12) 0%, transparent 70%)' }} />


      <div className="container">
        <motion.div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '60px',
            alignItems: 'center'
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10%' }}
        >
          
          {/* Left Text Sequence */}
          <div style={{ paddingRight: '20px' }}>
            <motion.div variants={itemVariants}>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '11px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.16em', 
                color: 'var(--accent)', 
                fontWeight: 700,
                display: 'block',
                marginBottom: '1rem'
              }}>
                From the Press
              </span>
            </motion.div>
            
            <motion.h2 
              variants={itemVariants}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: 1.05,
                color: 'var(--ink-100)',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em'
              }}
            >
              The <span style={{ fontStyle: 'italic', color: 'var(--ink-200)' }}>Mastermind</span><br/>Times
            </motion.h2>

            <motion.div 
              variants={itemVariants} 
              style={{
                width: '60px',
                height: '2px',
                background: 'var(--accent)',
                marginBottom: '1.5rem',
                opacity: 0.6
              }} 
            />

            <motion.p 
              variants={itemVariants}
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'var(--ink-300)',
                marginBottom: '2.5rem',
                maxWidth: '480px'
              }}
            >
              Asian, European, American, Mediterranean — all under one bicycle-cafe roof. A global culinary revolution curated by our flagship team. Read the broadsheet that tells the whole story.
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <a
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '30px'
                }}
              >
                Read the full edition <ArrowRight size={14} />
              </a>
            </motion.div>
          </div>

          {/* Right Image Sequence */}
          <motion.div 
            variants={itemVariants}
            style={{ position: 'relative' }}
          >
            <motion.div
              style={{
                position: 'relative',
                borderRadius: '8px',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                background: '#fff',
                padding: '12px'
              }}
              whileHover={{ scale: 1.02, rotate: -1, transition: { duration: 0.4 } }}
            >
              {/* Decorative paper tape */}
              <div aria-hidden="true" style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '100px', height: '24px', background: 'rgba(244, 236, 224, 0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 10 }} />
              
              <a
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', overflow: 'hidden' }}
              >
                <motion.img 
                  src={image} 
                  alt={alt} 
                  loading="eager" 
                  initial={{ opacity: 0, scale: 1.05 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ width: '100%', height: 'auto', display: 'block', filter: 'sepia(0.1) contrast(1.05)', transition: 'transform 0.6s ease' }} 
                />
              </a>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

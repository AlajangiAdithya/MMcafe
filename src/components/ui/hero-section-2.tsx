import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Globe, Phone, MapPin } from 'lucide-react';

const InfoIcon = ({ type }: { type: 'website' | 'phone' | 'address' }) => {
    const icons = {
        website: <Globe className="h-4 w-4" style={{ color: '#4A90D9' }} />,
        phone: <Phone className="h-4 w-4" style={{ color: '#4A90D9' }} />,
        address: <MapPin className="h-4 w-4" style={{ color: '#4A90D9' }} />,
    };
    return <div className="mr-2 flex-shrink-0">{icons[type]}</div>;
};

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  backgroundImage: string;
  contactInfo?: {
    website: string;
    phone: string;
    address: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, badge, title, subtitle, primaryCta, secondaryCta, backgroundImage, contactInfo, ...props }, ref) => {

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
      },
    };

    const itemVariants = {
      hidden: { y: 24, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      },
    };

    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden md:flex-row",
          className
        )}
        style={{ minHeight: 'calc(100vh - 80px)', background: '#0a0908', color: '#EAE6DF' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        {/* Left: Content */}
        <div className="relative z-10 flex w-full flex-col justify-center p-8 pl-10 md:w-1/2 md:p-12 md:pl-20 lg:w-3/5 lg:p-16 lg:pl-24">
            <motion.div variants={containerVariants}>
                {badge && (
                  <motion.div
                    className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#B5AEA4' }}
                    variants={itemVariants}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A90D9', display: 'inline-block' }} />
                    {badge}
                  </motion.div>
                )}

                <motion.h1
                  className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: '#F8F5F2' }}
                  variants={itemVariants}
                >
                  {title}
                </motion.h1>

                <motion.div
                  className="my-6 h-1 w-20"
                  style={{ background: 'linear-gradient(90deg, #4A90D9, #D4647A)' }}
                  variants={itemVariants}
                />

                <motion.p
                  className="mb-8 max-w-lg text-base leading-relaxed"
                  style={{ color: '#B5AEA4' }}
                  variants={itemVariants}
                >
                  {subtitle}
                </motion.p>

                {(primaryCta || secondaryCta) && (
                  <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
                    {primaryCta && (
                      <a href={primaryCta.href} className="btn btn-primary">
                        {primaryCta.text}
                      </a>
                    )}
                    {secondaryCta && (
                      <a href={secondaryCta.href} className="btn btn-outline">
                        {secondaryCta.text}
                      </a>
                    )}
                  </motion.div>
                )}
            </motion.div>

            {contactInfo && (
              <motion.footer className="mt-auto pt-12" variants={itemVariants}>
                <div className="flex flex-wrap gap-6 text-xs" style={{ color: '#827C75' }}>
                    <div className="flex items-center">
                        <InfoIcon type="website" />
                        <span>{contactInfo.website}</span>
                    </div>
                    <div className="flex items-center">
                        <InfoIcon type="phone" />
                        <span>{contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                        <InfoIcon type="address" />
                        <span>{contactInfo.address}</span>
                    </div>
                </div>
              </motion.footer>
            )}
        </div>

        {/* Right: Image with clip-path reveal */}
        <motion.div
          className="w-full md:w-1/2 lg:w-2/5"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '350px',
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };

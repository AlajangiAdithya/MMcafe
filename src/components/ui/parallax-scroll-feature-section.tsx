import { useRef } from "react"
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeatureSection {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  reverse: boolean;
  link?: string;
  ctaText?: string;
}

interface ParallaxFeatureSectionProps {
  sections: FeatureSection[];
  className?: string;
}

function ParallaxItem({ section, index }: { section: FeatureSection; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.2, 0.8, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col md:flex-row items-center justify-between md:gap-16 gap-8 px-6 md:px-10 py-10 md:py-16 my-6",
        "relative rounded-[1.5rem] border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden group",
        section.reverse ? "md:flex-row-reverse" : ""
      )}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full blur-[80px] opacity-20 transition-opacity duration-700 group-hover:opacity-40",
          section.reverse ? "-right-24 bg-[#D4647A]" : "-left-24 bg-[#4A90D9]"
        )} />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 flex-1 max-w-lg"
      >
        <div className="text-xs font-bold tracking-[0.25em] uppercase mb-3 text-[#4A90D9]">
          0{index + 1} // Service
        </div>
        <h3 className="text-4xl md:text-5xl font-bold mb-4 font-['Yanone_Kaffeesatz'] tracking-wide uppercase leading-[1.05]">
          {section.title}
        </h3>
        <p className="text-sm md:text-base text-[#B5AEA4] leading-relaxed mb-6">
          {section.description}
        </p>
        
        {section.link && (
          <Link to={section.link} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0908] font-bold uppercase tracking-[0.1em] text-[0.7rem] hover:bg-[#4A90D9] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_30px_rgba(74,144,217,0.3)]">
            {section.ctaText} <ArrowRight size={14} />
          </Link>
        )}
      </motion.div>

      <motion.div
        style={{ scale, opacity }}
        className="relative z-10 flex-1 w-full max-w-sm md:max-w-md"
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] group-hover:border-white/20 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/80 via-transparent to-transparent z-10 pointer-events-none" />
          <img
            src={section.imageUrl}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={section.title}
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
}

export const ParallaxFeatureSection = ({ sections, className }: ParallaxFeatureSectionProps) => {
  return (
    <div className={cn("flex flex-col gap-4 max-w-7xl mx-auto py-8 md:py-16", className)}>
      {sections.map((section, index) => (
        <ParallaxItem key={section.id} section={section} index={index} />
      ))}
    </div>
  );
};

export default ParallaxFeatureSection;

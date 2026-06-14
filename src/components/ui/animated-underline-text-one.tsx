import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  textClassName?: string;
  underlineClassName?: string;
  underlineDuration?: number;
  /** Heading level to render. Defaults to "h2"; pass "h1" for page titles. */
  as?: "h1" | "h2" | "h3";
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  ({ text, textClassName, underlineClassName, underlineDuration = 0.8, as = "h2", ...props }, ref) => {
    const Heading = motion[as];
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-0", props.className)}
      >
        <Heading
          className={cn(
            "text-3xl md:text-4xl font-bold tracking-wide uppercase leading-tight",
            textClassName
          )}
          style={{ fontFamily: "'Yanone Kaffeesatz', sans-serif" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {text}
        </Heading>
        <motion.div
          className={cn("mt-3 rounded-full mm-underline", underlineClassName)}
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 48, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: underlineDuration,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };

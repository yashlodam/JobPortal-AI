import React from "react";
import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";

function SectionHeader({ badge, title, subtitle, className = "" }) {
  return (
    <div
      className={`mx-auto flex w-full flex-col items-center justify-center text-center ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="mb-4 flex w-full justify-center sm:mb-5">
          <SectionBadge>{badge}</SectionBadge>
        </div>
      )}

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.55,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          mx-auto
          w-full
          max-w-4xl
          text-center
          text-3xl
          font-extrabold
          leading-[1.15]
          tracking-[-0.025em]
          text-heading
          sm:text-4xl
          md:text-5xl
        "
        style={{
          fontFamily: "var(--font-satoshi)",
        }}
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mx-auto
            mt-4
            w-full
            max-w-2xl
            text-center
            text-sm
            leading-6
            text-body
            sm:mt-5
            sm:text-base
            sm:leading-7
            md:text-[17px]
          "
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default SectionHeader;
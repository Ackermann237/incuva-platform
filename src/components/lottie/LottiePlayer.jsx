// src/components/lottie/LottiePlayer.jsx
// Lecteur Lottie minimal (lottie-web, rendu SVG). La vitesse peut changer sans relancer l'animation.
import React, { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function LottiePlayer({ animationData, speed = 1, loop = true, className = "", style, label }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion(); // accessibilité : image fixe si l'utilisateur limite les animations
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay: !reduced,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });
    if (reduced) animation.goToAndStop(30, true);
    animationRef.current = animation;
    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, [animationData, loop]);

  useEffect(() => {
    animationRef.current?.setSpeed(speed);
  }, [speed, animationData, loop]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

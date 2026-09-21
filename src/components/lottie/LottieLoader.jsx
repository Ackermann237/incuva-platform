// src/components/lottie/LottieLoader.jsx
// Remplace les écrans « Chargement... » par une animation Lottie.
//   <LottieLoader label="Chargement des offres..." />               (centré dans son conteneur)
//   <LottieLoader label="Chargement..." fullScreen />               (occupe toute la hauteur de l'écran)
import React from "react";
import LottiePlayer from "./LottiePlayer";
import loaderAnimation from "../../assets/lottie/loader.json";

export default function LottieLoader({ label = "Chargement...", size = 96, fullScreen = false, className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center ${fullScreen ? "min-h-screen" : className.includes("py-") ? "" : "py-16"} ${className}`}
    >
      <LottiePlayer animationData={loaderAnimation} style={{ width: size, height: size }} />
      {label && <p className="mt-2 text-gray-600 font-medium">{label}</p>}
    </div>
  );
}

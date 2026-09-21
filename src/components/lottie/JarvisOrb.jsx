// src/components/lottie/JarvisOrb.jsx
// Orbe animée « façon Jarvis ». L'état change la vitesse et la teinte de l'animation.
import React from "react";
import LottiePlayer from "./LottiePlayer";
import jarvisAnimation from "../../assets/lottie/jarvis.json";

const STATES = {
  idle: { speed: 0.7, filter: "none", scale: 1 },
  listening: { speed: 1.8, filter: "hue-rotate(-55deg) saturate(1.3)", scale: 1.08 }, // vert : je vous écoute
  thinking: { speed: 2.6, filter: "hue-rotate(75deg) saturate(1.2)", scale: 1.02 }, // violet : je réfléchis
  speaking: { speed: 1.5, filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))", scale: 1.1 }, // halo : je parle
};

export default function JarvisOrb({ state = "idle", size = 110 }) {
  const { speed, filter, scale } = STATES[state] || STATES.idle;
  return (
    <div
      style={{ width: size, height: size, filter, transform: `scale(${scale})`, transition: "filter 0.4s ease, transform 0.4s ease" }}
    >
      <LottiePlayer animationData={jarvisAnimation} speed={speed} style={{ width: "100%", height: "100%" }} label="Jarvis" />
    </div>
  );
}

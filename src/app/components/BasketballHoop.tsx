"use client";

import { useState, useEffect, useRef } from "react";
import { useDragDrop } from "./DragDropProvider";

const BasketballHoop = () => {
  const { scored, rimShake, registerHoop, ballState, floatingScores } =
    useDragDrop();
  const [stretch, setStretch] = useState(0);
  const [hoopRect, setHoopRect] = useState<DOMRect | null>(null);
  const hoopElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerHoop(hoopElRef.current);
  }, [registerHoop]);

  useEffect(() => {
    const element = hoopElRef.current;
    if (!element) return;

    const updateRect = () => setHoopRect(element.getBoundingClientRect());
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  useEffect(() => {
    if (!scored) return;
    const t0 = setTimeout(() => setStretch(45), 0);
    const t1 = setTimeout(() => setStretch(15), 120);
    const t2 = setTimeout(() => setStretch(25), 220);
    const t3 = setTimeout(() => setStretch(5), 320);
    const t4 = setTimeout(() => setStretch(10), 400);
    const t5 = setTimeout(() => setStretch(0), 500);
    return () => [t0, t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [scored]);

  const bottomY = 180 + stretch;
  const ring1Y = 60 + stretch / 3;
  const ring2Y = 120 + (2 * stretch) / 3;

  const ballPos = ballState && hoopRect
    ? {
        left: ballState.x - hoopRect.left,
        top: ballState.y - hoopRect.top,
      }
    : null;

  return (
    <div
      className="relative mt-10 -mb-6"
      style={{
        transform: `translateY(${rimShake}px)`,
        transition: "transform 0.05s ease-out",
      }}
    >
      <div className="border-primary border-3 mx-auto rounded-md h-24 w-36" />
      <div className="absolute mt-0.5 inset-x-0">
        <div className="-mb-3 mx-auto bg-primary-200 rounded-xs h-3 w-6" />

        <div
          ref={hoopElRef}
          className="mx-auto w-42 h-24 overflow-visible relative"
        >
          {floatingScores.map((score) => {
            if (!hoopRect) return null;
            return (
              <div
                key={score.id}
                className="absolute text-orange-500 font-black text-2xl pointer-events-none select-none z-15"
                style={{
                  left: score.x - hoopRect.left,
                  top: score.y - hoopRect.top,
                  animation: "floatUpAndFade 0.9s ease-out forwards",
                }}
              >
                +1
              </div>
            );
          })}

          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            style={{ zIndex: 1 }}
            viewBox="0 0 240 220"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M5 18C5 14.5522 17.116 11.2456 38.6827 8.80757C60.2494 6.36957 89.5001 5 120 5C150.5 5 179.751 6.36957 201.317 8.80757C222.884 11.2456 235 14.5522 235 18"
              stroke="var(--color-primary-200)"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {ballState && ballPos && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: ballPos.left,
                top: ballPos.top,
                transform: `translate(-50%, -50%) rotate(${ballState.rotation}deg)`,
                opacity: ballState.opacity,
                zIndex: 5,
              }}
            >
              <div className="bg-white shadow-2xl rounded-2xl p-2 border border-primary/20">
                {ballState.preview.type === "image" ? (
                  <img
                    src={ballState.preview.thumbnail}
                    alt=""
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">
                      .{ballState.preview.ext}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            style={{ zIndex: 10 }}
            viewBox="0 0 240 220"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="rim-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary-200)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>

            <g transform="translate(5, 25)">
              <path
                d={`
                  M 16 ${ring1Y} H 215
                  M 30 ${ring2Y} H 200
                  M 0 0 L 65 ${bottomY} L 73 0 L 115 ${bottomY} L 157 0 L 165 ${bottomY} L 230 0 L 185 ${bottomY} L 192 0 L 138 ${bottomY} L 115 0 L 92 ${bottomY} L 40 0 L 45 ${bottomY} L 0 0
                `}
                stroke="#A7AFBA"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
                className="transition-all duration-100 ease-out"
              />
            </g>

            <path
              d="M5 18C5 21.4478 17.116 24.7544 38.6827 27.1924C60.2494 29.6304 89.5001 31 120 31C150.5 31 179.751 29.6304 201.317 27.1924C222.884 24.7544 235 21.4478 235 18"
              stroke="url(#rim-grad)"
              strokeWidth="7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            transform: translateY(-90px) scale(0.85);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BasketballHoop;
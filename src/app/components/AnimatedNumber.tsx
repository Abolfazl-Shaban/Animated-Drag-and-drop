"use client";

import { useEffect, useState, useRef } from "react";

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animation, setAnimation] = useState<{
    previous: number;
    current: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value === displayValue) return;

    timerRef.current = setTimeout(() => {
      setAnimation(null);
      setDisplayValue(value);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, displayValue]);

  const previousValue = useRef(value);
  useEffect(() => {
    if (value !== previousValue.current) {
      setAnimation({ previous: previousValue.current, current: value });
      previousValue.current = value;
    }
  }, [value]);

  return (
    <span className="relative inline-block  " style={{ height: "1em", minWidth: "0.6em" }}>
  
      {animation && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: "slideDown 0.4s ease-in-out forwards",
          }}
        >
          {animation.previous}
        </span>
      )}

      <span
        className="flex items-center justify-center"
        style={{
          animation: animation ? "slideInFromTop 0.4s ease-in-out forwards" : "none",
        }}
      >
        {animation ? animation.current : displayValue}
      </span>

      <style jsx>{`
        @keyframes slideDown {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
};

export default AnimatedNumber;
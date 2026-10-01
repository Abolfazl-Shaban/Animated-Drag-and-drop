"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface FilePreview {
  name: string;
  type: "image" | "file";
  thumbnail?: string;
  ext: string;
  size: number;
  rawFile: File;
}

export interface BallState {
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  preview: FilePreview;
}

export interface FloatingScore {
  id: number;
  x: number;
  y: number;
}

export interface ActiveUpload {
  name: string;
  progress: number;
  isExiting?: boolean;
}

interface HoopRect {
  left: number;
  right: number;
  top: number;
  centerX: number;
}

interface DragDropContextType {
  files: File[];
  scored: boolean;
  rimShake: number;
  ballState: BallState | null;
  isDragging: boolean;
  floatingScores: FloatingScore[];
  activeUpload: ActiveUpload | null;
  registerHoop: (el: HTMLDivElement | null) => void;
}

const DragDropContext = createContext<DragDropContextType>({
  files: [],
  scored: false,
  rimShake: 0,
  ballState: null,
  isDragging: false,
  floatingScores: [],
  activeUpload: null,
  registerHoop: () => {},
});

export const useDragDrop = () => useContext(DragDropContext);

const createPreview = (file: File): Promise<FilePreview> => {
  return new Promise((resolve) => {
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({
          name: file.name,
          type: "image",
          thumbnail: e.target?.result as string,
          ext,
          size: file.size,
          rawFile: file,
        });
      reader.readAsDataURL(file);
    } else {
      resolve({
        name: file.name,
        type: "file",
        ext,
        size: file.size,
        rawFile: file,
      });
    }
  });
};

const quadBezier = (t: number, p0: number, p1: number, p2: number) =>
  (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;

export const DragDropProvider = ({ children }: { children: ReactNode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<FilePreview | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [hoopRect, setHoopRect] = useState<HoopRect | null>(null);
  const [ballState, setBallState] = useState<BallState | null>(null);
  const [scored, setScored] = useState(false);
  const [rimShake, setRimShake] = useState(0);
  const [guidePath, setGuidePath] = useState("");
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [activeUpload, setActiveUpload] = useState<ActiveUpload | null>(null);

  const dragCounter = useRef(0);
  const hoopEl = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number>(0);
  const hoopRectRef = useRef<HoopRect | null>(null);

  useEffect(() => {
    hoopRectRef.current = hoopRect;
  }, [hoopRect]);

  const recalcHoop = useCallback(() => {
    if (!hoopEl.current) return;
    const r = hoopEl.current.getBoundingClientRect();
    const rect: HoopRect = {
      left: r.left + 10,
      right: r.right - 10,
      top: r.top - 25,
      centerX: r.left + r.width / 2,
    };
    setHoopRect(rect);
    hoopRectRef.current = rect;
  }, []);

  const registerHoop = useCallback((el: HTMLDivElement | null) => {
    hoopEl.current = el;
    recalcHoop();
  }, [recalcHoop]);

  useEffect(() => {
    window.addEventListener("resize", recalcHoop);
    window.addEventListener("scroll", recalcHoop);
    return () => {
      window.removeEventListener("resize", recalcHoop);
      window.removeEventListener("scroll", recalcHoop);
    };
  }, []);

  const shakeRim = () => {
    setRimShake(2);
    setTimeout(() => setRimShake(-1), 60);
    setTimeout(() => setRimShake(0.5), 120);
    setTimeout(() => setRimShake(0), 180);
  };

  const simulateUpload = (fileName: string) => {
    setActiveUpload({ name: fileName, progress: 0 });
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setActiveUpload({ name: fileName, progress: 100 });
        setTimeout(() => {
          setActiveUpload({ name: fileName, progress: 100, isExiting: true });
          setTimeout(() => {
            setActiveUpload(null);
          }, 300);
        }, 1000);
      } else {
        setActiveUpload({ name: fileName, progress });
      }
    }, 120);
  };

  const addFloatingScore = () => {
    const hr = hoopRectRef.current;
    if (!hr) return;
    const id = Date.now();
    const offsetX = Math.floor(Math.random() * 80) - 40;
    const offsetY = Math.floor(Math.random() * 30) - 15;
    const newScore = {
      id,
      x: hr.centerX + offsetX,
      y: hr.top + offsetY,
    };
    setFloatingScores((prev) => [...prev, newScore]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== id));
    }, 1000);
  };

  const launch = (startX: number, startY: number, preview: FilePreview) => {
    const hr = hoopRectRef.current;
    if (!hr) return;
    cancelAnimationFrame(animRef.current);

    const rimSide = startX < hr.centerX ? "left" : "right";
    const rimX = rimSide === "left" ? hr.left : hr.right;
    const rimY = hr.top;

    const peakY = rimY - 300;
    const cpX = rimX;

    const duration = 600;
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t;

      const x = quadBezier(eased, startX, cpX, rimX);
      const y = quadBezier(eased, startY, peakY, rimY);
      const rotation = eased * 360;

      setBallState({ x, y, rotation, opacity: 1, preview });

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        shakeRim();
        startBounce(rimX, rimY, preview);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const startBounce = (rimX: number, rimY: number, preview: FilePreview) => {
    const hr = hoopRectRef.current;
    if (!hr) return;

    const bounceHeight = 60;
    const duration = 400;
    const targetX = hr.centerX;

    let startTime: number | null = null;
    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const t = Math.min((now - startTime) / duration, 1);

      const x = rimX + (targetX - rimX) * t;
      const y = rimY - bounceHeight * Math.sin(t * Math.PI);
      const rotation = 360 + t * 180;

      setBallState({ x, y, rotation, opacity: 1, preview });

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        startFallIn(targetX, rimY, 540, preview);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const startFallIn = (
    x: number,
    rimY: number,
    finalRotation: number,
    preview: FilePreview
  ) => {
    const duration = 400;
    const startTime = performance.now();
    const fallDistance = 200;
    let hasTriggeredScore = false;

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t * 0.5 + t * t * 0.5;

      const curY = rimY + fallDistance * eased;
      const rotation = finalRotation;
      const opacity = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;

      if (t >= 0.25 && !hasTriggeredScore) {
        hasTriggeredScore = true;
        setScored(true);
        addFloatingScore();
        simulateUpload(preview.name);
        setFiles((prev) => [...prev, preview.rawFile]);
        setTimeout(() => setScored(false), 700);
      }

      setBallState({ x, y: curY, rotation, opacity, preview });

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setBallState(null);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      if (dragCounter.current === 1) {
        setIsDragging(true);
        recalcHoop();
        const item = e.dataTransfer?.items?.[0];
        if (item?.kind === "file") {
          const file = item.getAsFile();
          if (file) createPreview(file).then(setDragPreview);
          else
            setDragPreview({
              name: "File",
              type: "file",
              ext: "FILE",
              size: 0,
              rawFile: new File([], "File"),
            });
        }
      }
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      const pos = { x: e.clientX, y: e.clientY };
      setMousePos(pos);

      const hr = hoopRectRef.current;
      if (hr) {
        const peakY = hr.top - 300;
        const midX = hr.centerX;
        setGuidePath(
          `M ${pos.x} ${pos.y} Q ${midX} ${peakY}, ${hr.centerX} ${hr.top}`
        );
      }
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
        setDragPreview(null);
        setGuidePath("");
      }
    };

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      setDragPreview(null);
      setGuidePath("");

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length === 0) return;

      const preview = await createPreview(droppedFiles[0]);
      launch(e.clientX, e.clientY, preview);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <DragDropContext.Provider
      value={{
        files,
        scored,
        rimShake,
        ballState,
        isDragging,
        floatingScores,
        activeUpload,
        registerHoop,
      }}
    >
      {children}

      {isDragging && guidePath && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[100]">
          <path
            d={guidePath}
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeOpacity="0.3"
            fill="none"
          />
          {hoopRect && (
            <circle
              cx={hoopRect.centerX}
              cy={hoopRect.top}
              r="6"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            >
              <animate
                attributeName="r"
                values="4;10;4"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      )}

      {isDragging && dragPreview && (
        <div
          className="fixed pointer-events-none z-[110]"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="bg-white shadow-2xl rounded-2xl p-2.5 border border-primary/20">
            {dragPreview.type === "image" ? (
              <img
                src={dragPreview.thumbnail}
                alt=""
                className="w-14 h-14 object-cover rounded-xl"
              />
            ) : (
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  .{dragPreview.ext}
                </span>
              </div>
            )}
            <p className="text-[10px] text-center text-sec mt-1.5 truncate max-w-[70px] font-medium">
              {dragPreview.name}
            </p>
          </div>
        </div>
      )}
    </DragDropContext.Provider>
  );
};
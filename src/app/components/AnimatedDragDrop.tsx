"use client";

import { Upload, FileCheck } from "lucide-react";
import BasketballHoop from "./BasketballHoop";
import AnimatedNumber from "./AnimatedNumber";
import { useDragDrop } from "./DragDropProvider";

const AnimatedDragDrop = () => {
  const { files, activeUpload, ballState, isDragging } = useDragDrop();
  const showActiveBorder = isDragging || !!ballState;

  return (
    <div className="max-w-2xl flex flex-col w-full gap-10 mx-auto mt-10 relative">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-title text-3xl">Upload files</p>
          <p className="text-sec text-lg">Drag and drop, or take the shot.</p>
        </div>
        <span className="p-1.5 px-3 font-medium bg-bg text-sec rounded-full">
          Uploaded{" "}
          <span className="font-semibold text-title">
            <AnimatedNumber value={files.length} />
          </span>
        </span>
      </div>

      <div
        className={`p-10 rounded-3xl  w-2/3 mx-auto border-dashed border-2 transition-colors duration-200 ${
          showActiveBorder ? "border-primary bg-primary/3" : "bg-white border-stroke"
        }`}
      >
        <div>
          <Upload className="w-8 h-8 text-sec mx-auto" />
          <p className="text-title mt-3 font-medium text-2xl mx-auto w-fit">
            Drop files here
          </p>
          <p className="text-sec-50 mt-0.5 mx-auto w-fit">or take the shot</p>
        </div>
        <BasketballHoop />
      </div>

{/* uncomment to show files list */}
      {/* {files.length > 0 && (
        <div className="space-y-2 w-2/3 mx-auto">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stroke"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold">
                {file.name.split(".").pop()?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-title font-medium truncate">{file.name}</p>
                <p className="text-sec text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <span className="text-green-500 text-sm font-medium">
                ✓ Scored
              </span>
            </div>
          ))}
        </div>
      )} */}

      {activeUpload && (
        <div
          className={`fixed bottom-6 left-1/2 w-96 bg-white border border-stroke rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-[150] ${
            activeUpload.isExiting ? "animate-slideDown" : "animate-slideUp"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <FileCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-title font-semibold text-sm truncate">
                {activeUpload.name}
              </p>
              <p className="text-sec text-xs">Uploading file...</p>
            </div>
            <span className="text-primary text-xs font-bold">
              {activeUpload.progress}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150 ease-out"
              style={{ width: `${activeUpload.progress}%` }}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUpIn {
          from {
            transform: translate(-50%, 40px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes slideDownOut {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, 40px);
            opacity: 0;
          }
        }
        .animate-slideUp {
          animation: slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideDown {
          animation: slideDownOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AnimatedDragDrop;
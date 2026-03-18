import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileDropzoneProps } from "../types";

const ACCEPTED_EXTENSIONS = ".xlsx,.xls,.csv";

export default function FileDropzone({
  onFileAccepted,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClearFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    []
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-300",
          isDragOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border bg-card hover:border-muted-foreground/40 hover:bg-accent/50",
          disabled && "pointer-events-none opacity-50",
          selectedFile && "border-primary/40 bg-primary/5"
        )}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload spreadsheet file"
        />

        {selectedFile ? (
          /* ── File selected state ──────────────────────────────── */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <FileSpreadsheet className="h-7 w-7 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFile}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </motion.div>
        ) : (
          /* ── Idle / drag-over state ──────────────────────────── */
          <>
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300",
                isDragOver
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <Upload className="h-7 w-7" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? (
                  "Drop your file here"
                ) : (
                  <>
                    Drag & drop your spreadsheet, or{" "}
                    <span className="text-primary underline underline-offset-2">
                      browse
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

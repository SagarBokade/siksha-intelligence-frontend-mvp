import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ArrowLeft,
  Upload,
  FileCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Clock,
  Play,
  File,
  Search,
  Save,
  Lock,
  RotateCcw,
  CloudUpload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useMyEvaluationAssignments,
  useEvaluationStudents,
  useEvaluationStructure,
  useUploadAnswerSheet,
  useSaveDraftMarks,
  usePublishMarks,
  useAnswerSheetSignedUrl,
} from "@/features/examination/hooks/useEvaluationQueries";
import type {
  EvaluationAssignmentResponseDTO,
  TeacherEvaluationStudentResponseDTO,
  AnswerSheetStatus,
  EvaluationAssignmentStatus,
  SaveQuestionMarkRequestDTO,
} from "@/services/types/evaluation";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Status Configs ──────────────────────────────────────────────────

const assignmentStatusConfig: Record<EvaluationAssignmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  ASSIGNED: { label: "Assigned", color: "bg-amber-500/10 text-amber-700 border-amber-200", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Play },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

const sheetStatusConfig: Record<string, { label: string; color: string }> = {
  UPLOADED: { label: "Uploaded", color: "bg-sky-500/10 text-sky-700 border-sky-200" },
  CHECKING: { label: "Checking", color: "bg-indigo-500/10 text-indigo-700 border-indigo-200" },
  DRAFT: { label: "Draft", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  FINAL: { label: "Published", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
};

// ── Main Page ────────────────────────────────────────────────────────

export default function TeacherEvaluationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scheduleId = searchParams.get("scheduleId") ? Number(searchParams.get("scheduleId")) : null;
  const answerSheetId = searchParams.get("answerSheetId") ? Number(searchParams.get("answerSheetId")) : null;

  // Step 1: no params → assignments list
  // Step 2: scheduleId only → student list
  // Step 3: scheduleId + answerSheetId → evaluation view
  const step = answerSheetId ? 3 : scheduleId ? 2 : 1;

  const goToAssignments = useCallback(() => setSearchParams({}), [setSearchParams]);
  const goToStudents = useCallback(
    (sid: number) => setSearchParams({ scheduleId: String(sid) }),
    [setSearchParams]
  );
  const goToEvaluate = useCallback(
    (sid: number, asid: number) =>
      setSearchParams({ scheduleId: String(sid), answerSheetId: String(asid) }),
    [setSearchParams]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Page Header */}
      <div className="flex items-start gap-3">
        {step > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0"
            onClick={() => (step === 3 && scheduleId ? goToStudents(scheduleId) : goToAssignments())}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <FileCheck className="w-5 h-5 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Answer Evaluation</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            {step === 1 && "Your assigned evaluation schedules"}
            {step === 2 && "Students for this schedule"}
            {step === 3 && "Evaluate answer sheet"}
          </p>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <AssignmentsList onSelect={goToStudents} />}
      {step === 2 && scheduleId && (
        <StudentsList
          scheduleId={scheduleId}
          onBack={goToAssignments}
          onEvaluate={(asId) => goToEvaluate(scheduleId, asId)}
        />
      )}
      {step === 3 && scheduleId && answerSheetId && (
        <EvaluationView
          scheduleId={scheduleId}
          answerSheetId={answerSheetId}
          onBack={() => goToStudents(scheduleId)}
        />
      )}
    </div>
  );
}

// ── Step 1: Assignments List ────────────────────────────────────────

function AssignmentsList({ onSelect }: { onSelect: (scheduleId: number) => void }) {
  const [search, setSearch] = useState("");
  const { data: assignments = [], isLoading, isError } = useMyEvaluationAssignments();

  const filtered = useMemo(() => {
    if (!search.trim()) return assignments;
    const q = search.toLowerCase();
    return assignments.filter(
      (a) =>
        a.examName.toLowerCase().includes(q) ||
        a.subjectName.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="font-semibold">Failed to load assignments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exams or subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-xl border-2 border-dashed border-border/50 gap-2 bg-card text-center">
          <FileCheck className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No evaluation assignments found</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AssignmentCard key={a.assignmentId} assignment={a} onClick={() => onSelect(a.examScheduleId)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment: a,
  onClick,
}: {
  assignment: EvaluationAssignmentResponseDTO;
  onClick: () => void;
}) {
  const cfg = assignmentStatusConfig[a.status];
  const Icon = cfg.icon;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left w-full rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground leading-tight">{a.examName}</h3>
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
          <Icon className="w-3 h-3" /> {cfg.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{a.subjectName}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(a.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {a.dueDate && (
          <span className="flex items-center gap-1">
            Due: {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
      <div className="mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        View Students →
      </div>
    </motion.button>
  );
}

// ── Step 2: Student List ────────────────────────────────────────────

function StudentsList({
  scheduleId,
  onBack,
  onEvaluate,
}: {
  scheduleId: number;
  onBack: () => void;
  onEvaluate: (answerSheetId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: students = [], isLoading, isError, refetch } = useEvaluationStudents(scheduleId);
  const uploadMutation = useUploadAnswerSheet();

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.enrollmentNumber?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const handleUpload = async (studentId: string, file: File) => {
    try {
      await uploadMutation.mutateAsync({ scheduleId, studentId, file });
      toast.success("Answer sheet uploaded successfully");
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="font-semibold">Failed to load students</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{students.length} students</span>
          <span className="text-emerald-600 font-medium">
            {students.filter((s) => s.answerSheetStatus === "FINAL").length} published
          </span>
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Enrollment</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <StudentRow
                  key={s.studentId}
                  student={s}
                  onUpload={handleUpload}
                  onEvaluate={onEvaluate}
                  isUploading={uploadMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRow({
  student,
  onUpload,
  onEvaluate,
  isUploading,
}: {
  student: TeacherEvaluationStudentResponseDTO;
  onUpload: (studentId: string, file: File) => void;
  onEvaluate: (answerSheetId: number) => void;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = student.answerSheetStatus;
  const cfg = status ? sheetStatusConfig[status] : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB");
      return;
    }
    onUpload(student.studentId, file);
    e.target.value = "";
  };

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {student.studentName.charAt(0)}
          </div>
          <span className="font-medium">{student.studentName}</span>
        </div>
      </td>
      <td className="p-3 text-muted-foreground font-mono text-xs">{student.enrollmentNumber || "—"}</td>
      <td className="p-3">
        {cfg ? (
          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
            {cfg.label}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">Not Uploaded</span>
        )}
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading || status === "FINAL"}
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5" />
            )}
            {student.answerSheetId ? "Re-upload" : "Upload PDF"}
          </Button>

          {/* Evaluate Button */}
          {student.answerSheetId && (
            <Button
              size="sm"
              onClick={() => onEvaluate(student.answerSheetId!)}
              className="gap-1.5 text-xs"
              variant={status === "FINAL" ? "outline" : "default"}
            >
              <FileCheck className="w-3.5 h-3.5" />
              {status === "FINAL" ? "View" : "Evaluate"}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Step 3: Evaluation View (PDF + Marks) ───────────────────────────

function EvaluationView({
  answerSheetId,
}: {
  scheduleId: number;
  answerSheetId: number;
}) {
  const { data: structure, isLoading: structureLoading } = useEvaluationStructure(answerSheetId);
  const { data: signedUrl, isLoading: urlLoading } = useAnswerSheetSignedUrl(answerSheetId);
  const saveMutation = useSaveDraftMarks();
  const publishMutation = usePublishMarks();

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const isFinal = structure?.resultStatus === "FINAL";

  // Keep refs to latest values so the debounced callback never has stale closures
  const marksRef = useRef(marks);
  marksRef.current = marks;
  const structureRef = useRef(structure);
  structureRef.current = structure;

  // Initialize marks from server data
  useEffect(() => {
    if (!structure || initialized) return;
    const initial: Record<string, string> = {};
    structure.sections.forEach((section) => {
      section.questions.forEach((q) => {
        const key = `${section.sectionName}#${q.questionNumber}`;
        if (q.marksObtained != null) {
          initial[key] = String(q.marksObtained);
        }
      });
    });
    setMarks(initial);
    setInitialized(true);
  }, [structure, initialized]);

  // Build payload from current marks (ref-based, always reads latest)
  const buildPayloadFromRefs = useCallback((): SaveQuestionMarkRequestDTO[] => {
    const currentStructure = structureRef.current;
    const currentMarks = marksRef.current;
    if (!currentStructure) return [];
    const items: SaveQuestionMarkRequestDTO[] = [];
    currentStructure.sections.forEach((section) => {
      section.questions.forEach((q) => {
        const key = `${section.sectionName}#${q.questionNumber}`;
        const val = currentMarks[key];
        if (val !== undefined && val !== "") {
          items.push({
            sectionName: section.sectionName,
            questionNumber: q.questionNumber,
            marksObtained: parseFloat(val),
          });
        }
      });
    });
    return items;
  }, []);

  // Build payload from state (for synchronous use in publish/save draft button)
  const buildPayload = useCallback((): SaveQuestionMarkRequestDTO[] => {
    if (!structure) return [];
    const items: SaveQuestionMarkRequestDTO[] = [];
    structure.sections.forEach((section) => {
      section.questions.forEach((q) => {
        const key = `${section.sectionName}#${q.questionNumber}`;
        const val = marks[key];
        if (val !== undefined && val !== "") {
          items.push({
            sectionName: section.sectionName,
            questionNumber: q.questionNumber,
            marksObtained: parseFloat(val),
          });
        }
      });
    });
    return items;
  }, [structure, marks]);

  // Stable auto-save — uses refs so deps don't change on every keystroke
  const triggerAutoSave = useCallback(() => {
    if (isFinal) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (savingRef.current) return; // skip if a save is already in-flight
      const questionMarks = buildPayloadFromRefs();
      if (questionMarks.length === 0) return;
      savingRef.current = true;
      setSaveStatus("saving");
      try {
        await saveMutation.mutateAsync({
          answerSheetId,
          data: { questionMarks },
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      } finally {
        savingRef.current = false;
      }
    }, 1200);
  }, [answerSheetId, buildPayloadFromRefs, isFinal, saveMutation]);

  const handleMarkChange = (sectionName: string, questionNumber: number, maxMarks: number, value: string) => {
    if (isFinal) return;
    let val = value;
    if (val !== "") {
      const num = parseFloat(val);
      if (num < 0) val = "0";
      if (num > maxMarks) val = String(maxMarks);
    }
    const key = `${sectionName}#${questionNumber}`;
    setMarks((prev) => ({ ...prev, [key]: val }));
    triggerAutoSave();
  };

  const handlePublish = async () => {
    // Save first, then publish
    const questionMarks = buildPayload();
    if (questionMarks.length === 0) {
      toast.error("Please enter marks before publishing");
      return;
    }
    try {
      await saveMutation.mutateAsync({ answerSheetId, data: { questionMarks } });
      await publishMutation.mutateAsync(answerSheetId);
      toast.success("Marks published successfully! Evaluation is now locked.");
      setPublishDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publish failed";
      toast.error(msg);
    }
  };

  // Compute totals
  const totals = useMemo(() => {
    if (!structure) return { current: 0, max: 0, total: 0 };
    let current = 0;
    let max = 0;
    let total = 0;
    structure.sections.forEach((section) => {
      section.questions.forEach((q) => {
        total++;
        max += q.maxMarks;
        const key = `${section.sectionName}#${q.questionNumber}`;
        const val = parseFloat(marks[key]);
        if (!isNaN(val)) current += val;
      });
    });
    return { current, max, total };
  }, [structure, marks]);

  if (structureLoading || urlLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="font-semibold">Could not load evaluation structure</p>
        <p className="text-sm text-muted-foreground">The exam schedule may not have a template snapshot.</p>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky evaluation toolbar */}
      <div className="sticky top-0 z-20 p-4 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Score</span>
            <span className="text-xl font-bold tabular-nums">
              <span className="text-primary">{totals.current.toFixed(1)}</span>
              <span className="text-muted-foreground/60 text-sm font-normal"> / {totals.max}</span>
            </span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Questions</span>
            <span className="text-sm font-medium">{totals.total}</span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Status</span>
            {isFinal ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <Lock className="w-3 h-3" /> Published
              </span>
            ) : (
              <SaveIndicator status={saveStatus} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFinal && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const questionMarks = buildPayload();
                  if (questionMarks.length > 0) {
                    setSaveStatus("saving");
                    saveMutation.mutateAsync({ answerSheetId, data: { questionMarks } }).then(() => {
                      setSaveStatus("saved");
                      toast.success("Draft saved");
                      setTimeout(() => setSaveStatus("idle"), 2000);
                    }).catch(() => { setSaveStatus("error"); });
                  }
                }}
                disabled={saveMutation.isPending}
                className="gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => setPublishDialogOpen(true)}
                disabled={publishMutation.isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main evaluation layout: PDF left, Marks right */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_1fr] xl:grid-cols-[70%_1fr] gap-4">
        {/* PDF Viewer */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <PdfViewer signedUrl={signedUrl || ""} />
        </div>

        {/* Marks Panel */}
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {structure.sections.map((section, sIdx) => (
            <motion.div
              key={section.sectionName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.05 }}
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
            >
              <div className="bg-muted/40 p-3 px-4 border-b border-border/50 flex justify-between items-center">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="bg-primary/10 text-primary w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + sIdx)}
                  </span>
                  Section {section.sectionName}
                </h4>
                <span className="text-xs font-medium bg-background px-2 py-1 rounded-md border border-border/50">
                  {section.questions.length} Q × {section.questions[0]?.maxMarks ?? 0} marks
                </span>
              </div>

              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3">
                {section.questions.map((q) => {
                  const key = `${section.sectionName}#${q.questionNumber}`;
                  const val = marks[key] ?? "";
                  return (
                    <div key={q.questionNumber} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground flex justify-between">
                        <span>Q{q.questionNumber}</span>
                        <span className="opacity-60">/{q.maxMarks}</span>
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={q.maxMarks}
                        step={0.5}
                        placeholder="–"
                        disabled={isFinal}
                        className="h-9 text-center font-medium bg-muted/20 focus:bg-background transition-colors placeholder:text-muted-foreground/30 tabular-nums"
                        value={val}
                        onChange={(e) =>
                          handleMarkChange(section.sectionName, q.questionNumber, q.maxMarks, e.target.value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Evaluation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will finalize the marks and <strong>lock the evaluation</strong>. No further edits will be allowed.
              <br /><br />
              Total marks: <strong>{totals.current.toFixed(1)} / {totals.max}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Publish & Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Save Status Indicator ───────────────────────────────────────────

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
      </span>
    );
  if (status === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <CheckCircle2 className="w-3 h-3" /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
        <XCircle className="w-3 h-3" /> Save failed
      </span>
    );
  return <span className="text-xs text-muted-foreground/60">Draft</span>;
}

// ── PDF Viewer ──────────────────────────────────────────────────────

function PdfViewer({ signedUrl }: { signedUrl: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loadError, setLoadError] = useState(false);

  if (!signedUrl) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading PDF URL...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-center p-6">
        <File className="w-10 h-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Failed to load PDF</p>
        <p className="text-xs text-muted-foreground/60">The signed URL may have expired. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium tabular-nums min-w-[60px] text-center">
            {currentPage} / {numPages ?? "–"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!numPages || currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages ?? p, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium tabular-nums min-w-[42px] text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex justify-center bg-muted/10 min-h-[500px] max-h-[80vh] p-4">
        <Document
          file={signedUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}

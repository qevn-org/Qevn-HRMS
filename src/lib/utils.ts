import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null, formatStr: string = "dd MMM yyyy"): string {
  if (!dateString) return "—";
  try {
    const parsed = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    if (!isValid(parsed)) return dateString;
    return format(parsed, formatStr);
  } catch {
    return dateString || "—";
  }
}

export function formatDateTime(dateString?: string | null): string {
  return formatDate(dateString, "dd MMM yyyy, HH:mm");
}

export function getInitials(name?: string | null): string {
  if (!name) return "Q";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getWorkerTypeBadge(workerType?: string) {
  switch (workerType) {
    case "employee":
      return { label: "EMPLOYEE", color: "bg-[#CCFF00] text-black border-black font-black" };
    case "intern":
      return { label: "INTERN", color: "bg-[#8B5CF6] text-white border-white font-black" };
    case "consultant":
      return { label: "CONSULTANT", color: "bg-[#06B6D4] text-black border-black font-black" };
    case "contractor":
      return { label: "CONTRACTOR", color: "bg-[#F59E0B] text-black border-black font-black" };
    default:
      return { label: "WORKER", color: "bg-zinc-700 text-white border-zinc-500 font-black" };
  }
}

export function getStatusBadge(status?: string) {
  switch (status) {
    case "active":
      return { label: "ACTIVE", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" };
    case "probation":
      return { label: "PROBATION", color: "bg-amber-500/20 text-amber-400 border-amber-500/50" };
    case "intern_active":
      return { label: "INTERN ACTIVE", color: "bg-purple-500/20 text-purple-300 border-purple-500/50" };
    case "on_leave":
      return { label: "ON LEAVE", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" };
    case "resigned":
      return { label: "RESIGNED", color: "bg-rose-500/20 text-rose-400 border-rose-500/50" };
    case "exited":
      return { label: "EXITED", color: "bg-zinc-700 text-zinc-300 border-zinc-600" };
    case "archived":
      return { label: "ARCHIVED", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    default:
      return { label: status?.toUpperCase() || "UNKNOWN", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  }
}

export function getAttendanceStatusStyle(status?: string) {
  switch (status) {
    case "present":
      return { label: "PRESENT", bg: "bg-[#CCFF00]", text: "text-black", border: "border-black", dot: "bg-emerald-500" };
    case "absent":
      return { label: "ABSENT", bg: "bg-rose-600", text: "text-white", border: "border-rose-700", dot: "bg-rose-300" };
    case "leave":
      return { label: "ON LEAVE", bg: "bg-blue-600", text: "text-white", border: "border-blue-700", dot: "bg-blue-300" };
    case "half_day":
      return { label: "HALF DAY", bg: "bg-amber-500", text: "text-black", border: "border-amber-700", dot: "bg-amber-300" };
    case "work_from_home":
      return { label: "WFH", bg: "bg-purple-600", text: "text-white", border: "border-purple-700", dot: "bg-purple-300" };
    case "holiday":
      return { label: "HOLIDAY", bg: "bg-teal-700", text: "text-teal-100", border: "border-teal-800", dot: "bg-teal-300" };
    case "week_off":
      return { label: "WEEK OFF", bg: "bg-zinc-800", text: "text-zinc-400", border: "border-zinc-700", dot: "bg-zinc-500" };
    default:
      return { label: "NOT MARKED", bg: "bg-zinc-900", text: "text-zinc-500", border: "border-zinc-800", dot: "bg-zinc-700" };
  }
}

export function getLeaveStatusStyle(status?: string) {
  switch (status) {
    case "approved":
      return { label: "APPROVED", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" };
    case "pending":
      return { label: "PENDING APPROVAL", color: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
    case "rejected":
      return { label: "REJECTED", color: "bg-rose-500/20 text-rose-400 border-rose-500/50" };
    case "clarification_required":
      return { label: "CLARIFICATION NEEDED", color: "bg-purple-500/20 text-purple-300 border-purple-500/50" };
    case "cancelled":
      return { label: "CANCELLED", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    default:
      return { label: "DRAFT", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  }
}

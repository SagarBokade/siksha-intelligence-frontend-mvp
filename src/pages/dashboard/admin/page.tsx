import {
  GraduationCap,
  Users,
  UserPlus,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/common/StatCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminOverview() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here&apos;s a summary of your school&apos;s key metrics.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <StatCard
            title="Total Students"
            value="1,247"
            subtitle="Across all classes"
            icon={GraduationCap}
            trend={{ value: 12, positive: true }}
            iconClassName="bg-blue-500/10 text-blue-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Staff"
            value="86"
            subtitle="Teachers & support"
            icon={Users}
            trend={{ value: 3, positive: true }}
            iconClassName="bg-violet-500/10 text-violet-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="New Enrollments"
            value="34"
            subtitle="This month"
            icon={UserPlus}
            trend={{ value: 8, positive: true }}
            iconClassName="bg-emerald-500/10 text-emerald-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Active Classes"
            value="42"
            subtitle="Current semester"
            icon={BookOpen}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate("/dashboard/admin/students")}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Manage Students
              </p>
              <p className="text-xs text-muted-foreground">
                Add, edit, or remove student records
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate("/dashboard/admin/staff")}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Manage Staff</p>
              <p className="text-xs text-muted-foreground">
                Hire teachers, principals, and librarians
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate("/dashboard/admin/settings")}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">View Reports</p>
              <p className="text-xs text-muted-foreground">
                Analytics and performance insights
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            {[
              { action: "New student enrolled", detail: "Rajesh Kumar — Class 10A", time: "2 min ago", color: "bg-blue-500" },
              { action: "Staff onboarded", detail: "Priya Sharma — Math Teacher", time: "15 min ago", color: "bg-violet-500" },
              { action: "Attendance marked", detail: "Class 8B — 32 students present", time: "1 hour ago", color: "bg-emerald-500" },
              { action: "Fee payment received", detail: "Invoice #INV-2024-0341 — ₹12,500", time: "3 hours ago", color: "bg-amber-500" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

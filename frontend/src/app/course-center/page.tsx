"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { GraduationCap, Bug, Save, CheckCircle, AlertTriangle } from "lucide-react";

export default function CourseControlCenterPage() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [labMode, setLabMode] = useState<boolean>(false);
  const [activeDefects, setActiveDefects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const weeks = [
    { week: 1, title: "SQA, V-Model, Verification and Validation", artifact: "Requirements, V-Model Matrix, Verification Points" },
    { week: 2, title: "Test Planning", artifact: "Master Test Plan, IEEE 829 Template, Risk Matrix" },
    { week: 3, title: "Black-box: Equivalence Partitioning & Boundary Value", artifact: "EP/BVA Test Specification (Quantity, Price, Discounts)" },
    { week: 4, title: "Decision Table and State Transition Testing", artifact: "Decision Table & SO 7-State Transition Graph" },
    { week: 5, title: "White-box: Control Flow, Cyclomatic Complexity, Branch Coverage", artifact: "Control Flow Graphs & Unit Tests (Services)" },
    { week: 6, title: "API Testing", artifact: "Postman Collections & Newman CI Suite" },
    { week: 7, title: "Test Automation", artifact: "Playwright E2E Order-to-Cash Automation Suite" },
    { week: 8, title: "UTS / Testing Audit", artifact: "Requirements Traceability Audit & Defect Log Report" },
    { week: 9, title: "Performance Testing", artifact: "k6 Load Test Scenarios (Concurrency, Thresholds)" },
    { week: 10, title: "Security Testing", artifact: "OWASP ZAP Scan Baseline & Vulnerability Mitigation" },
    { week: 11, title: "User Acceptance Testing (UAT)", artifact: "Role-Based UAT Test Scripts & Sign-off Forms" },
    { week: 12, title: "Implementation Strategy and Change Management", artifact: "Cutover Strategy (Big Bang vs Phased) & Transition Plan" },
    { week: 13, title: "ETL / Data Migration", artifact: "Python/Pandas Migration Pipeline & Reconciliation Report" },
    { week: 14, title: "CI/CD Deployment", artifact: "GitHub Actions Multi-stage Workflows & Docker Registry" },
    { week: 15, title: "Post Implementation Review (PIR) and Maintenance", artifact: "PIR Incident Log, Defect Density Metrics & SLA" },
    { week: 16, title: "Final Deployment, Demonstration and Rollback", artifact: "Automated Rollback Scripts & Final Release Report" },
  ];

  const controlledDefects = [
    { code: "DEFECT_BOUNDARY_QUANTITY", name: "Boundary Quantity Check Bypass", desc: "Allows zero or negative quantities in sales orders." },
    { code: "DEFECT_DISCOUNT_CALCULATION", name: "Faulty Discount Formula", desc: "Alters discount calculation and bypasses customer limit." },
    { code: "DEFECT_STOCK_CALCULATION", name: "Negative Inventory Reservation", desc: "Allows reserving stock beyond available physical balance." },
    { code: "DEFECT_STATE_TRANSITION", name: "Workflow State Machine Bypass", desc: "Permits illegal transitions (e.g. DRAFT straight to DELIVERED)." },
    { code: "DEFECT_AUTHORIZATION", name: "Manager Approval Authorization Defect", desc: "Allows non-manager roles to approve transactions." },
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await apiRequest("/qa/course-config");
    if (res.success && res.data) {
      setCurrentWeek(res.data.current_week || 1);
      setLabMode(!!res.data.lab_mode);
      setActiveDefects(res.data.active_defects || []);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await apiRequest("/qa/course-config", {
      method: "POST",
      body: JSON.stringify({
        current_week: currentWeek,
        lab_mode: labMode,
        active_defects: activeDefects,
      }),
    });
    setSaving(false);
    if (res.success) {
      setMessage("Configuration updated successfully!");
    }
  };

  const toggleDefect = (code: string) => {
    if (activeDefects.includes(code)) {
      setActiveDefects(activeDefects.filter((d) => d !== code));
    } else {
      setActiveDefects([...activeDefects, code]);
    }
  };

  const currentWeekInfo = weeks.find((w) => w.week === currentWeek) || weeks[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-500" />
            QA / Course Control Center (16-Week Academic Engine)
          </h1>
          <p className="text-xs text-slate-400">
            Dynamically shift course progression and toggle safe educational defects without code changes
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Current Active Week Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-md">
              WEEK {currentWeekInfo.week} OF 16
            </span>
            <h2 className="text-lg font-bold text-white mt-2">{currentWeekInfo.title}</h2>
            <p className="text-xs text-slate-300 mt-1">
              <span className="text-amber-400 font-semibold">Required Artifact:</span>{" "}
              {currentWeekInfo.artifact}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-300 font-medium">Select Week:</label>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              {weeks.map((w) => (
                <option key={w.week} value={w.week}>
                  Week {w.week}: {w.title.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Controlled Lab Defect System */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Controlled Lab Defect System</h3>
              <p className="text-xs text-slate-400">
                When enabled, intentional bugs can be triggered for student discovery during lab sessions
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={labMode}
              onChange={(e) => setLabMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-3 text-xs font-semibold text-slate-200">
              {labMode ? "LAB MODE ACTIVE" : "PRODUCTION MODE"}
            </span>
          </label>
        </div>

        {labMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {controlledDefects.map((def) => {
              const isActive = activeDefects.includes(def.code);
              return (
                <div
                  key={def.code}
                  onClick={() => toggleDefect(def.code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">{def.code}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isActive ? "bg-rose-500 text-slate-950" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isActive ? "BUG ACTIVE" : "NORMAL"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1">{def.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{def.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 16-Week Syllabus Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">Complete 16-Week Academic Curriculum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {weeks.map((w) => (
            <div
              key={w.week}
              className={`p-3 rounded-lg border text-xs ${
                w.week === currentWeek
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                  : "bg-slate-950 border-slate-800/80 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Week {w.week}</span>
                {w.week === currentWeek && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
              <p className="font-semibold text-slate-200 line-clamp-1">{w.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{w.artifact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

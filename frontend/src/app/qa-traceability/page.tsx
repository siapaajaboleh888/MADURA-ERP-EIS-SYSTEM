"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { ShieldCheck, Bug, CheckCircle, Search } from "lucide-react";

export default function QaTraceabilityPage() {
  const [matrix, setMatrix] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [matRes, defRes] = await Promise.all([
      apiRequest("/qa/traceability"),
      apiRequest("/qa/defects"),
    ]);

    if (matRes.success) setMatrix(matRes.data || []);
    if (defRes.success) setDefects(defRes.data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Requirements Traceability Matrix & Defect Registry
          </h1>
          <p className="text-xs text-slate-400">
            Requirement → Module → Test Case → Test Result → Defect (SQA & UTS Audit Foundation)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Traceability Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Full Traceability Matrix</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Req ID</th>
                    <th className="p-3">Requirement Title</th>
                    <th className="p-3">Module</th>
                    <th className="p-3 text-center">Priority</th>
                    <th className="p-3">Linked Test Cases</th>
                    <th className="p-3">Logged Defects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matrix.map((row) => (
                    <tr key={row.requirement_id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {row.requirement_id}
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{row.title}</td>
                      <td className="p-3 text-slate-400">{row.module}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-slate-800 text-slate-300">
                          {row.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {row.test_cases?.map((tc: any) => (
                            <span
                              key={tc.test_case_id}
                              className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded"
                            >
                              {tc.test_case_id} ({tc.test_type})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {row.defects?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.defects?.map((df: any) => (
                              <span
                                key={df.defect_id}
                                className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded"
                              >
                                {df.defect_id}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Defect Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Bug className="h-4 w-4 text-rose-400" />
                Active Defect Log (IEEE / SQA Format)
              </h2>
            </div>
            <div className="divide-y divide-slate-800">
              {defects.map((def) => (
                <div key={def.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {def.defect_id}: {def.title}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300">
                      {def.severity} / {def.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{def.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div>
                      <span className="text-slate-500 font-medium">Expected: </span>
                      <span className="text-slate-300">{def.expected_result}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Actual: </span>
                      <span className="text-slate-300">{def.actual_result}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

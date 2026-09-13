/**
 * src/Pages/admin/AdminReportsPage.jsx
 *
 * System Analytics & Verification Compliance Reports.
 * 100% Real dynamic calculations from active platform data.
 */

import React, { useEffect } from "react";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { fetchAdminRecruiters } from "../../State/verificationSlice";
import { getAllJobs } from "../../State/JobSlice";
import { getAllCompanies } from "../../State/CompanySlice";
import {
  BarChart3,
  ShieldCheck,
  Briefcase,
  Building2,
  Users,
  PieChart,
  TrendingUp,
} from "lucide-react";

export default function AdminReportsPage() {
  const dispatch = useAppDispatch();
  const { adminRecruiters } = useAppSelector((state) => state.verification);
  const { allJobs = [] } = useAppSelector((state) => state.job);
  const { companies = [] } = useAppSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchAdminRecruiters({ page: 0, size: 100 }));
    dispatch(getAllJobs());
    dispatch(getAllCompanies({ page: 0, size: 100 }));
  }, [dispatch]);

  const recruiters = adminRecruiters?.content || [];
  const jobs = Array.isArray(allJobs) ? allJobs : [];
  const comps = Array.isArray(companies) ? companies : [];

  // Verification breakdown
  const pendingRecruiters = recruiters.filter(
    (r) =>
      (r.status || r.verificationStatus) === "PENDING_VERIFICATION" ||
      (r.status || r.verificationStatus) === "PENDING"
  ).length;

  const approvedRecruiters = recruiters.filter(
    (r) =>
      (r.status || r.verificationStatus) === "APPROVED" ||
      (r.status || r.verificationStatus) === "VERIFIED"
  ).length;

  const rejectedRecruiters = recruiters.filter(
    (r) =>
      (r.status || r.verificationStatus) === "REJECTED" ||
      (r.status || r.verificationStatus) === "VERIFICATION_REJECTED"
  ).length;

  const suspendedRecruiters = recruiters.filter(
    (r) => (r.status || r.verificationStatus) === "SUSPENDED"
  ).length;

  // Job category breakdown
  const categoryCounts = {};
  jobs.forEach((j) => {
    const cat = j.category || j.department || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Work mode breakdown
  const workModeCounts = {};
  jobs.forEach((j) => {
    const wm = j.workMode || j.jobType || "Full-time";
    workModeCounts[wm] = (workModeCounts[wm] || 0) + 1;
  });

  return (
    <AdminLayout
      title="System Analytics & Compliance Reports"
      subtitle="Real-time performance metrics, compliance distribution, and posting volume."
      breadcrumbs={[
        { label: "Admin Console", to: "/admin/dashboard" },
        { label: "Reports", to: "/admin/reports" },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruiter Verification Status Breakdown */}
        <Card className="p-6 bg-surface border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Recruiter Verification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Approved Recruiters</span>
                  <span className="text-heading font-bold">{approvedRecruiters}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${recruiters.length ? (approvedRecruiters / recruiters.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-amber-600 dark:text-amber-400">Pending Verification</span>
                  <span className="text-heading font-bold">{pendingRecruiters}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${recruiters.length ? (pendingRecruiters / recruiters.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Rejected Applications</span>
                  <span className="text-heading font-bold">{rejectedRecruiters}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${recruiters.length ? (rejectedRecruiters / recruiters.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-rose-700 dark:text-rose-500">Suspended Accounts</span>
                  <span className="text-heading font-bold">{suspendedRecruiters}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-rose-700 rounded-full"
                    style={{ width: `${recruiters.length ? (suspendedRecruiters / recruiters.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Postings by Work Mode */}
        <Card className="p-6 bg-surface border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Work Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-3 text-xs">
              {Object.keys(workModeCounts).length === 0 ? (
                <p className="text-muted text-center py-6">No jobs data recorded yet.</p>
              ) : (
                Object.entries(workModeCounts).map(([mode, count]) => (
                  <div key={mode}>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-body">{mode}</span>
                      <span className="text-heading font-bold">{count} ({Math.round((count / (jobs.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / (jobs.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Postings by Category */}
        <Card className="p-6 md:col-span-2 bg-surface border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Industry & Tech Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-muted text-center py-6">No categories recorded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="p-3.5 rounded-2xl bg-surface-elevated border border-border">
                    <span className="text-[11px] text-muted block truncate">{cat}</span>
                    <p className="text-lg font-black text-heading font-satoshi mt-1">{count} <span className="text-[10px] text-muted font-normal">roles</span></p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

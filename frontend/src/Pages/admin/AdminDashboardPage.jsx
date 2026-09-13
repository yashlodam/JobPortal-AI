/**
 * src/Pages/admin/AdminDashboardPage.jsx
 *
 * Real-time Admin Overview & Control Console.
 * 100% Real Data from backend APIs and Redux state.
 */

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { StatusChip } from "../../components/ui/Badge";
import {
  ShieldCheck,
  Clock,
  Users,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { fetchAdminRecruiters } from "../../State/verificationSlice";
import { getAllJobs } from "../../State/JobSlice";
import { getAllCompanies } from "../../State/CompanySlice";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { adminRecruiters, adminLoading } = useAppSelector((state) => state.verification);
  const { allJobs = [], loading: jobsLoading } = useAppSelector((state) => state.job);
  const { companies = [], loading: companiesLoading } = useAppSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchAdminRecruiters({ page: 0, size: 50 }));
    dispatch(getAllJobs());
    dispatch(getAllCompanies({ page: 0, size: 50 }));
  }, [dispatch]);

  const recruitersList = adminRecruiters?.content || [];
  const pendingList = recruitersList.filter(
    (r) =>
      (r.status || r.verificationStatus) === "PENDING_VERIFICATION" ||
      (r.status || r.verificationStatus) === "PENDING"
  );
  const approvedList = recruitersList.filter(
    (r) =>
      (r.status || r.verificationStatus) === "APPROVED" ||
      (r.status || r.verificationStatus) === "VERIFIED"
  );

  const pendingCount = pendingList.length;
  const approvedCount = approvedList.length;
  const totalJobsCount = Array.isArray(allJobs) ? allJobs.length : 0;
  const totalCompaniesCount = Array.isArray(companies) ? companies.length : 0;

  const isLoading = adminLoading || jobsLoading || companiesLoading;

  if (isLoading) {
    return (
      <AdminLayout
        title="Platform Operations & Verification Console"
        subtitle="Real-time control center for employer compliance, candidate pipeline, and platform operations."
        breadcrumbs={[{ label: "Admin Console", to: "/admin/dashboard" }]}
      >
        <LoadingSkeleton type="dashboard" count={4} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Platform Operations & Verification Console"
      subtitle="Real-time control center for employer compliance, candidate pipeline, and platform operations."
      breadcrumbs={[{ label: "Admin Console", to: "/admin/dashboard" }]}
      action={
        <Link
          to="/admin/recruiters"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer font-satoshi"
        >
          <ShieldCheck size={16} />
          <span>Review Verification Queue ({pendingCount})</span>
        </Link>
      }
    >
      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verifications */}
        <Link to="/admin/recruiters" className="block group">
          <Card className="p-4 bg-surface border border-border transition-all group-hover:border-amber-500/50 group-hover:bg-surface-hover shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Pending Review</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-heading font-satoshi">{pendingCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Requires Admin Action</p>
          </Card>
        </Link>

        {/* Verified Recruiters */}
        <Link to="/admin/recruiters" className="block group">
          <Card className="p-4 bg-surface border border-border transition-all group-hover:border-emerald-500/50 group-hover:bg-surface-hover shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Verified Recruiters</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-heading font-satoshi">{approvedCount}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active Hiring Organizations</p>
          </Card>
        </Link>

        {/* Live Tech Jobs */}
        <Link to="/admin/jobs" className="block group">
          <Card className="p-4 bg-surface border border-border transition-all group-hover:border-indigo-500/50 group-hover:bg-surface-hover shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Live Job Postings</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-heading font-satoshi">{totalJobsCount}</p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Active Roles on Platform</p>
          </Card>
        </Link>

        {/* Total Companies */}
        <Link to="/admin/companies" className="block group">
          <Card className="p-4 bg-surface border border-border transition-all group-hover:border-purple-500/50 group-hover:bg-surface-hover shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Registered Companies</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-heading font-satoshi">{totalCompaniesCount}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">Employer Profiles</p>
          </Card>
        </Link>
      </div>

      {/* Grid: Pending Verification Queue + Live Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verification Priority Queue */}
        <Card className="p-6 bg-surface border border-border shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <CardTitle className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Verification Queue ({pendingCount})
              </CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Recruiters awaiting administrative background review.
              </p>
            </div>

            <Link
              to="/admin/recruiters"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 font-satoshi"
            >
              Review All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-border pt-2">
            {pendingList.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  icon={CheckCircle2}
                  title="Verification Queue is Clear"
                  description="All submitted recruiter accounts have been reviewed."
                />
              </div>
            ) : (
              pendingList.slice(0, 5).map((rec, idx) => (
                <div key={rec.id || rec.userId || rec.recruiterId || `rec-${idx}`} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs">
                      {(rec.recruiterName || rec.fullName || rec.name || "R").charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-heading">{rec.recruiterName || rec.fullName || rec.name}</h5>
                      <p className="text-[11px] text-muted">
                        {rec.companyName || rec.company || "Company"} · {rec.recruiterEmail || rec.workEmail || rec.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusChip status="PENDING_VERIFICATION" />
                    <Link
                      to="/admin/recruiters"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Platform Jobs Snapshot */}
        <Card className="p-6 bg-surface border border-border shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <CardTitle className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Recent Live Job Postings ({totalJobsCount})
              </CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Active opportunities currently discoverable by talent.
              </p>
            </div>

            <Link
              to="/admin/jobs"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 font-satoshi"
            >
              Manage Jobs <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-border pt-2">
            {allJobs.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  icon={Briefcase}
                  title="No Live Jobs Found"
                  description="No jobs have been posted on the platform yet."
                />
              </div>
            ) : (
              allJobs.slice(0, 5).map((job, idx) => (
                <div key={job.id || `job-${idx}`} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-heading font-satoshi">{job.title || job.jobTitle}</h5>
                    <p className="text-[11px] text-muted mt-0.5">
                      {job.company || job.companyName || "Organization"} · {job.category || job.department || "Technology"} · {job.location || "Remote"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusChip status={job.jobStatus || job.status || "ACTIVE"} />
                    <Link
                      to={`/jobs/${job.id}`}
                      target="_blank"
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

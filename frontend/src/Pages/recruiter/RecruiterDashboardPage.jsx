/**
 * src/Pages/recruiter/RecruiterDashboardPage.jsx
 *
 * Recruiter Dashboard Page:
 * - If recruiter is APPROVED / VERIFIED: renders full real-time KPIs, active jobs, pipeline.
 * - If recruiter is PENDING_VERIFICATION, REJECTED, or SUSPENDED: renders limited PendingRecruiterDashboard.
 */

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Briefcase, Sparkles, AlertCircle, ShieldAlert, Clock } from "lucide-react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import DashboardKpis from "../../components/recruiter/dashboard/DashboardKpis";
import { RecentActivityWidget, HiringFunnelWidget } from "../../components/recruiter/dashboard/RecentActivityWidget";
import PendingRecruiterDashboard from "../../components/recruiter/verification/PendingRecruiterDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { StatusChip } from "../../components/ui/Badge";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { getMyJobs } from "../../State/JobSlice";
import { fetchVerificationStatus } from "../../State/verificationSlice";
import { fetchAllRecruiterApplicationsThunk, fetchRecruiterDashboardStatsThunk } from "../../State/applicationThunk";
import { fetchInterviewStats } from "../../State/recruiterInterviewSlice";

export default function RecruiterDashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const { recruiterVerification } = useAppSelector((state) => state.verification);
  const { myJobs = [], pagination, loading } = useAppSelector((state) => state.job);
  const { jobApplications = [], jobApplicationsPage, dashboardStats } = useAppSelector((state) => state.application);
  const { stats: interviewStats } = useAppSelector((state) => state.recruiterInterview || {});

  const verificationStatus =
    recruiterVerification?.status ||
    recruiterVerification?.data?.status ||
    user?.verificationStatus ||
    user?.status ||
    "PENDING_VERIFICATION";

  const isApproved =
    verificationStatus.toUpperCase() === "APPROVED" ||
    verificationStatus.toUpperCase() === "VERIFIED";

  useEffect(() => {
    dispatch(fetchVerificationStatus());
    dispatch(getMyJobs());
    dispatch(fetchAllRecruiterApplicationsThunk({ page: 0, size: 50 }));
    dispatch(fetchRecruiterDashboardStatsThunk());
    dispatch(fetchInterviewStats());
  }, [dispatch]);

  const getApplicantsCount = (job) => {
    if (job.applicantsCount != null) return job.applicantsCount;
    if (job.applicationsCount != null) return job.applicationsCount;
    if (job.totalApplicants != null) return job.totalApplicants;
    if (job.totalApplications != null) return job.totalApplications;
    if (Array.isArray(job.applications)) return job.applications.length;
    if (Array.isArray(job.jobApplications)) return job.jobApplications.length;
    return 0;
  };

  const totalActiveJobs = pagination?.totalElements ?? myJobs.length;
  const featuredInPage = myJobs.filter((j) => (j.jobStatus || j.status) === "FEATURED" || j.featured).length;
  const totalFeatured = totalActiveJobs > myJobs.length && myJobs.length > 0
    ? Math.round((featuredInPage / myJobs.length) * totalActiveJobs)
    : featuredInPage;

  const totalAppsCount = dashboardStats?.totalApplications ?? Math.max(
    jobApplicationsPage?.totalElements ?? 0,
    jobApplications.length,
    myJobs.reduce((acc, j) => acc + getApplicantsCount(j), 0)
  );

  const newAppsCount = dashboardStats?.newApplications ?? (
    jobApplications.filter(
      (a) => !a.status || a.status.toUpperCase() === "APPLIED" || a.status.toUpperCase() === "REVIEWING"
    ).length || (totalAppsCount > 0 && jobApplications.length === 0 ? totalAppsCount : 0)
  );

  const interviewsCount = dashboardStats?.interviewApplications ?? (
    interviewStats?.totalScheduled ??
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "INTERVIEWING").length
  );

  const hiredCount = dashboardStats?.hiredApplications ?? (
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "ACCEPTED").length
  );

  const stats = {
    activeJobs: dashboardStats?.activeJobs ?? totalActiveJobs,
    featuredJobs: dashboardStats?.featuredJobs ?? totalFeatured,
    totalApplications: totalAppsCount,
    newApplications: newAppsCount,
    interviews: interviewsCount,
    hired: hiredCount,
  };


  return (
    <RecruiterLayout
      title={`Welcome, ${user?.name?.split(" ")[0] ?? "Recruiter"}!`}
      subtitle="Here is your real-time candidate pipeline and active hiring snapshot for today."
      action={
        <div className="flex items-center gap-2">
          {!isApproved && (
            <Link
              to="/recruiter/verification"
              className="flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 transition cursor-pointer font-satoshi"
            >
              <Sparkles size={14} />
              <span>Verification Status</span>
            </Link>
          )}
          <Link
            to="/upload-job"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs font-black text-white shadow-lg hover:scale-105 transition cursor-pointer font-satoshi"
          >
            <Plus size={16} />
            <span>Post New Role</span>
          </Link>
        </div>
      }
    >
      {/* Pending Verification Notice Banner */}
      {!isApproved && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-600 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg font-satoshi">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
            <span>
              <strong>Organization Verification Under Review:</strong> You have full access to manage your jobs, review candidate applications, and use real-time candidate chat.
            </span>
          </div>
          <Link
            to="/recruiter/verification"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition shrink-0"
          >
            <Sparkles size={14} /> Verification Center
          </Link>
        </div>
      )}

      {/* Real-Time KPIs */}
      <DashboardKpis stats={stats} />

      {/* Grid: Active Jobs Teaser + Hiring Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Jobs & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Jobs Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2 font-satoshi text-base font-black text-heading">
                  <Briefcase size={18} className="text-indigo-500 dark:text-indigo-400" />
                  Active Job Postings ({totalActiveJobs})
                </CardTitle>
                <Link to="/recruiter/jobs" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-satoshi">
                  View all postings <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {myJobs.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <AlertCircle size={36} className="text-indigo-500 dark:text-indigo-400 opacity-60 mx-auto" />
                  <h4 className="text-sm font-extrabold text-heading font-satoshi">No Active Jobs Posted Yet</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    You haven't posted any jobs yet. Create your first job listing to start receiving candidate applications.
                  </p>
                  <Link
                    to="/upload-job"
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-indigo-500 transition font-satoshi mt-2"
                  >
                    <Plus size={14} /> Create Job Post
                  </Link>
                </div>
              ) : (
                myJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-surface-elevated hover:bg-surface-hover transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-heading font-satoshi">{job.title || job.jobTitle}</h4>
                        <StatusChip status={job.jobStatus || job.status || "ACTIVE"} />
                      </div>
                      <p className="text-xs font-medium text-muted mt-0.5">{job.category || job.department || "Engineering"} · Posted {job.postedAt || "Recently"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-satoshi">
                        {getApplicantsCount(job)} Applicants
                      </span>
                      <Link to="/recruiter/jobs" className="text-xs font-bold text-muted hover:text-heading transition">
                        Manage →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivityWidget />
        </div>

        {/* Right Col: Hiring Funnel */}
        <div className="space-y-6">
          <HiringFunnelWidget />
        </div>
      </div>
    </RecruiterLayout>
  );
}

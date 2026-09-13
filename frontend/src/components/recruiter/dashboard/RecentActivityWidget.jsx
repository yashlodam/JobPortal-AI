/**
 * src/components/recruiter/dashboard/RecentActivityWidget.jsx & HiringFunnelWidget.jsx
 */
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import { Clock, Info, ArrowRight, UserCheck } from "lucide-react";
import { StatusChip } from "../../ui/Badge";
import { useAppSelector } from "../../../State/Store";

export function RecentActivityWidget() {
  const { jobApplications = [], jobApplicationsPage, dashboardStats } = useAppSelector((state) => state.application);
  const { myJobs = [] } = useAppSelector((state) => state.job);

  const fallbackCount = myJobs.reduce((acc, j) => acc + (j.applicantsCount || j.applicationsCount || j.totalApplicants || 0), 0);
  const totalApps = dashboardStats?.totalApplications ?? (jobApplicationsPage?.totalElements || Math.max(jobApplications.length, fallbackCount));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2 font-satoshi text-base font-black text-heading">
            <Clock className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            Recent Candidate Activity ({totalApps})
          </CardTitle>
          {totalApps > 0 && (
            <Link
              to="/recruiter/applications"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-satoshi"
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        {jobApplications.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <Info size={28} className="text-muted mx-auto" />
            <p className="text-xs font-bold text-heading font-satoshi">
              {totalApps > 0 ? `${totalApps} Candidate Applications Received` : "No Recent Candidate Activity"}
            </p>
            <p className="text-[11px] text-muted">
              {totalApps > 0
                ? "Visit the Applications Center to review and process candidates."
                : "Candidate application events will appear here in real-time as users apply."}
            </p>
            {totalApps > 0 && (
              <Link
                to="/recruiter/applications"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition font-satoshi mt-1"
              >
                Go to Applications Center →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {jobApplications.slice(0, 5).map((app) => {
              const appId = app.id || app.applicationId;
              const name = app.applicantName || app.name || "Candidate";
              const title = app.jobTitle || app.job?.jobTitle || "Role";
              const status = app.status || "APPLIED";
              const timeStr = app.appliedAt || app.createdAt;
              const dateDisplay = timeStr
                ? new Date(timeStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Recently";

              return (
                <div
                  key={appId}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface-elevated hover:bg-surface-hover transition font-satoshi"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-extrabold text-heading truncate">{name}</h5>
                      <p className="text-[11px] text-muted truncate">
                        Applied for <span className="font-semibold text-body">{title}</span> · {dateDisplay}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusChip status={status} />
                    <Link
                      to="/recruiter/applications"
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HiringFunnelWidget() {
  const { jobApplications = [], jobApplicationsPage, dashboardStats } = useAppSelector((state) => state.application);
  const { myJobs = [] } = useAppSelector((state) => state.job);

  const fallbackCount = myJobs.reduce((acc, j) => acc + (j.applicantsCount || j.applicationsCount || j.totalApplicants || 0), 0);
  const totalApps = dashboardStats?.totalApplications ?? (jobApplicationsPage?.totalElements || Math.max(jobApplications.length, fallbackCount));

  const shortlistedCount = dashboardStats?.shortlistedApplications ??
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "SHORTLISTED").length;

  const interviewCount = dashboardStats?.interviewApplications ??
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "INTERVIEWING").length;

  const offerCount = dashboardStats?.offeredApplications ??
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "OFFERED").length;

  const hiredCount = dashboardStats?.hiredApplications ??
    jobApplications.filter((a) => (a.status || "").toUpperCase() === "ACCEPTED").length;

  const baseCount = Math.max(totalApps, 1);

  const funnel = [
    { stage: "Applied", count: totalApps, pct: totalApps > 0 ? 100 : 0, color: "from-blue-500 to-indigo-500" },
    { stage: "Shortlisted", count: shortlistedCount, pct: totalApps > 0 ? Math.round((shortlistedCount / baseCount) * 100) : 0, color: "from-indigo-500 to-violet-500" },
    { stage: "Interview", count: interviewCount, pct: totalApps > 0 ? Math.round((interviewCount / baseCount) * 100) : 0, color: "from-purple-500 to-fuchsia-500" },
    { stage: "Offer", count: offerCount, pct: totalApps > 0 ? Math.round((offerCount / baseCount) * 100) : 0, color: "from-amber-500 to-emerald-500" },
    { stage: "Hired", count: hiredCount, pct: totalApps > 0 ? Math.round((hiredCount / baseCount) * 100) : 0, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-satoshi text-base font-black text-heading">Hiring Funnel Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-3 font-satoshi">
        {funnel.map((item) => (
          <div key={item.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted">{item.stage}</span>
              <span className="text-heading font-extrabold">{item.count} candidates</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
              <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${Math.max(item.pct, item.count > 0 ? 8 : 0)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


/**
 * src/Pages/recruiter/RecruiterAnalyticsPage.jsx
 *
 * Analytics & Hiring Metrics Dashboard.
 */

import React from "react";
import { BarChart3, TrendingUp, Users, Award, Clock, ArrowUpRight } from "lucide-react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export default function RecruiterAnalyticsPage() {
  return (
    <RecruiterLayout
      title="Hiring Analytics & Reports"
      subtitle="Comprehensive conversion funnel metrics, source tracking, and pipeline velocity."
      breadcrumbs={[{ label: "Analytics" }]}
    >
      {/* Platform Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Recruitment Intelligence Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-heading font-satoshi">
            Advanced Analytics Engine in Early Access
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Automated pipeline velocity, stage-by-stage drop-off analytics, source attribution, and offer acceptance benchmarking are currently being indexed. Metrics will populate automatically as your team reviews applicants and extends offers.
          </p>
        </div>
      </div>

      {/* Metric Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Postings", desc: "Live jobs receiving applications", icon: BarChart3 },
          { title: "Applicants In Review", desc: "Screening & shortlisting pipeline", icon: Users },
          { title: "Interviews Scheduled", desc: "Coordinated candidate calls", icon: Clock },
          { title: "Offers Extended", desc: "Pending candidate decisions", icon: Award },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">{item.title}</p>
              <item.icon className="h-4 w-4 text-muted" />
            </div>
            <h3 className="text-2xl font-black text-heading font-satoshi mt-2">—</h3>
            <p className="text-[11px] text-muted mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Sourcing & Velocity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated border border-border text-muted">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardTitle>Sourcing Attribution</CardTitle>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Source tracking across direct searches, referrals, and candidate applications will activate once sufficient pipeline events are recorded.
          </p>
        </Card>

        <Card className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated border border-border text-muted">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle>Time to Hire & Velocity</CardTitle>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Stage velocity tracking calculates average durations between application submission, interview completion, and offer signing.
          </p>
        </Card>
      </div>
    </RecruiterLayout>
  );
}

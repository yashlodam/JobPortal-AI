/**
 * src/Pages/admin/AdminJobsPage.jsx
 *
 * Admin Job Postings Management Portal.
 * 100% Real Data from Redux / Jobs API.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Pagination,
} from "../../components/ui/Table";
import { Tabs } from "../../components/ui/Tabs";
import { StatusChip } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/ToastNotification";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { getAllJobs, deleteJob } from "../../State/JobSlice";
import {
  Briefcase,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  Building2,
} from "lucide-react";

const JOB_STATUS_TABS = [
  { id: "ALL", label: "All Postings" },
  { id: "ACTIVE", label: "Active Roles" },
  { id: "FEATURED", label: "Featured" },
  { id: "CLOSED", label: "Closed / Archived" },
];

export default function AdminJobsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { allJobs = [], loading } = useAppSelector((state) => state.job);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getAllJobs());
  }, [dispatch]);

  const jobsList = Array.isArray(allJobs) ? allJobs : [];

  const filteredJobs = jobsList.filter((job) => {
    const status = (job.jobStatus || job.status || "ACTIVE").toUpperCase();
    if (activeTab === "ACTIVE" && status !== "ACTIVE" && status !== "OPEN") return false;
    if (activeTab === "FEATURED" && status !== "FEATURED" && !job.featured) return false;
    if (activeTab === "CLOSED" && status !== "CLOSED" && status !== "ARCHIVED" && status !== "EXPIRED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (job.title || job.jobTitle || "").toLowerCase();
      const comp = (job.company || job.companyName || "").toLowerCase();
      const cat = (job.category || job.department || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      return title.includes(q) || comp.includes(q) || cat.includes(q) || loc.includes(q);
    }
    return true;
  });

  const getApplicantsCount = (job) => {
    if (job.applicantsCount != null) return job.applicantsCount;
    if (job.applicationsCount != null) return job.applicationsCount;
    if (job.totalApplicants != null) return job.totalApplicants;
    if (Array.isArray(job.applications)) return job.applications.length;
    return 0;
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteJob(deleteTarget.id)).unwrap();
      toast.success("Job posting deleted successfully from platform.");
      setDeleteTarget(null);
      dispatch(getAllJobs());
    } catch (err) {
      toast.error(err?.message || "Failed to delete job.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Job Postings"
      subtitle="Inspect, moderate, and manage live employment opportunities across all companies."
      breadcrumbs={[
        { label: "Admin Console", to: "/admin/dashboard" },
        { label: "Job Postings", to: "/admin/jobs" },
      ]}
      action={
        <button
          onClick={() => dispatch(getAllJobs())}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <Tabs
            tabs={JOB_STATUS_TABS}
            activeTab={activeTab}
            onChange={(t) => setActiveTab(t)}
          />

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company, category…"
              className="w-full rounded-2xl border border-border bg-surface-elevated pl-10 pr-4 py-2 text-xs text-heading placeholder-muted focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton type="table" rows={6} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Job Postings Found"
            description="No job records matched your filter or search query."
          />
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Job Title & Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Category / Tech</TableHead>
                <TableHead>Work Mode</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => {
                const jobTitle = job.title || job.jobTitle || "Job Position";
                const companyName = job.company || job.companyName || "Company";
                const category = job.category || job.department || "Technology";
                const location = job.location || "Remote";
                const workMode = job.workMode || job.jobType || "Full-time";
                const status = (job.jobStatus || job.status || "ACTIVE").toUpperCase();

                return (
                  <TableRow key={job.id || Math.random()}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-heading font-satoshi text-xs">{jobTitle}</p>
                        <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                          <MapPin size={10} className="text-muted" />
                          <span>{location}</span>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-heading text-xs">{companyName}</span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-body bg-surface-elevated border border-border px-2 py-0.5 rounded-md">
                        {category}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-body text-xs">{workMode}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-primary font-satoshi">
                        {getApplicantsCount(job)} Candidates
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusChip status={status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/25 px-2.5 py-1 text-xs font-semibold transition"
                        >
                          <span>Live</span>
                          <ExternalLink size={10} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(job)}
                          className="inline-flex items-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 p-1.5 transition cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title="Job Posting Overview"
        size="lg"
      >
        {selectedJob && (
          <div className="p-4 space-y-4 text-heading">
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-heading font-satoshi">{selectedJob.title || selectedJob.jobTitle}</h4>
                <StatusChip status={selectedJob.jobStatus || selectedJob.status || "ACTIVE"} />
              </div>
              <p className="text-xs text-primary font-semibold">{selectedJob.company || selectedJob.companyName} · {selectedJob.location || "Remote"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border space-y-0.5">
                <span className="text-muted block">Category:</span>
                <span className="font-bold text-heading">{selectedJob.category || selectedJob.department || "General"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border space-y-0.5">
                <span className="text-muted block">Work Mode:</span>
                <span className="font-bold text-heading">{selectedJob.workMode || selectedJob.jobType || "Full-time"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border space-y-0.5">
                <span className="text-muted block">Experience Level:</span>
                <span className="font-bold text-heading">{selectedJob.experience || selectedJob.experienceLevel || "Mid-Senior"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border space-y-0.5">
                <span className="text-muted block">Salary / Package:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedJob.salary || selectedJob.package || "Competitive"}</span>
              </div>
            </div>

            {selectedJob.description && (
              <div className="space-y-1 text-xs">
                <span className="text-muted block">Job Description Overview:</span>
                <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-surface border border-border text-body leading-relaxed text-[11px]">
                  {selectedJob.description}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Job Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title=""
        size="sm"
      >
        {deleteTarget && (
          <div className="p-4 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-heading font-satoshi">Delete Job Posting?</h4>
              <p className="text-xs text-muted mt-1">
                Are you sure you want to remove <strong className="text-heading">{deleteTarget.title || deleteTarget.jobTitle}</strong> by {deleteTarget.company || deleteTarget.companyName}?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border bg-surface py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteJob}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {deleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

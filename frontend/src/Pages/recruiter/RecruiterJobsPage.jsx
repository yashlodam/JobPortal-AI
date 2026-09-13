/**
 * src/Pages/recruiter/RecruiterJobsPage.jsx
 *
 * Executive Recruiter Job Management Studio.
 * Features:
 * - Real-time jobs from GET /api/recruiter/jobs (size: 100)
 * - Full CRUD: Create, Edit (PUT /api/recruiter/jobs/{jobId}), Delete (DELETE /api/recruiter/jobs/{jobId})
 * - 3D Glassmorphic Job Cards & Table View with Satoshi Typography
 * - Quick Search, Category Filters, & Status Badges
 */

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import { StatusChip } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { getMyJobs, deleteJob, updateJob } from "../../State/JobSlice";
import { useToast } from "../../components/ui/ToastNotification";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export default function RecruiterJobsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { myJobs = [], pagination, loading, categories: globalCategories = [] } = useAppSelector((state) => state.job);

  const [activeTab, setActiveTab] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState(() => searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== null) {
      setSearchKeyword(searchParam);
    }
  }, [searchParams]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [successMsg, setSuccessMsg] = useState("");

  // Edit Job Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    jobType: "FULL_TIME",
    workingMode: "REMOTE",
    experienceLevel: "MID",
    location: "",
    salaryMin: "",
    salaryMax: "",
    skills: [],
    skillsInput: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, jobId: null, title: "" });

  useEffect(() => {
    dispatch(getMyJobs({ page: currentPage, size: 50 }));
  }, [dispatch, currentPage]);

  const handleDeleteJob = (jobId, title) => {
    setDeleteConfirm({ open: true, jobId, title });
  };

  const handleConfirmDelete = async () => {
    const { jobId, title } = deleteConfirm;
    if (!jobId) return;
    try {
      await dispatch(deleteJob(jobId)).unwrap();
      toast.info(`Job "${title}" deleted.`);
      setSuccessMsg(`Job "${title}" deleted successfully.`);
      dispatch(getMyJobs({ page: currentPage, size: 50 }));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      toast.error(err || "Failed to delete job.");
    } finally {
      setDeleteConfirm({ open: false, jobId: null, title: "" });
    }
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || job.jobTitle || "",
      description: job.description || "",
      category: job.category || job.department || "Engineering",
      jobType: job.jobType || "FULL_TIME",
      workingMode: job.workingMode || "REMOTE",
      experienceLevel: job.experienceLevel || "MID",
      location: job.location || "Remote",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      skills: job.skills || [],
      skillsInput: (job.skills || []).join(", "),
    });
    setShowEditModal(true);
  };

  const handleSaveEditJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsSubmitting(true);
    const parsedSkills = editForm.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parseLocation = (loc) => {
      const parts = (loc || "").split(",").map((s) => s.trim()).filter(Boolean);
      return {
        city: parts[0] || "Mumbai",
        state: parts[1] || "Maharashtra",
        country: parts[2] || "India",
      };
    };

    const loc = parseLocation(editForm.location);
    const minSal = Number(editForm.salaryMin) || 0;
    const maxSal = Math.max(minSal, Number(editForm.salaryMax) || minSal);

    const payload = {
      jobTitle: editForm.title || "Software Engineer",
      category: editForm.category || "Engineering",
      description: editForm.description || "Exciting engineering role.",
      responsibilities: editingJob.responsibilities || editForm.description || "",
      requirements: editingJob.requirements || "",
      aboutRole: editingJob.aboutRole || "",
      benefits: editingJob.benefits || "",
      city: loc.city,
      state: loc.state,
      country: loc.country,
      workingMode: editForm.workingMode || "REMOTE",
      jobType: editForm.jobType || "FULL_TIME",
      experienceLevel: editForm.experienceLevel || "MID",
      minimumExperience: editingJob.minimumExperience ?? 0,
      maximumExperience: editingJob.maximumExperience ?? 5,
      minimumSalary: minSal,
      maximumSalary: maxSal,
      currency: editingJob.currency || "INR",
      vacancies: editingJob.vacancies ?? 1,
      skillsRequired: parsedSkills.length > 0 ? parsedSkills : ["Software Development"],
      preferredSkills: editingJob.preferredSkills || [],
      qualification: editingJob.qualification || "Bachelor's Degree",
      applicationDeadline: editingJob.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      numberOfInterviewRounds: editingJob.numberOfInterviewRounds ?? 3,
      featured: editingJob.featured ?? false,
      urgentHiring: editingJob.urgentHiring ?? false,
      easyApply: editingJob.easyApply ?? true,
    };

    try {
      await dispatch(updateJob({ jobId: editingJob.id, jobData: payload })).unwrap();
      toast.success(`Job "${editForm.title}" updated successfully!`);
      setSuccessMsg(`Job "${editForm.title}" updated successfully!`);
      setShowEditModal(false);
      dispatch(getMyJobs({ page: currentPage, size: 50 }));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      toast.error(err || "Failed to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalElements = pagination?.totalElements ?? (myJobs && myJobs.length > 0 ? myJobs.length : 0);
  const totalPages = pagination?.totalPages ?? 1;

  const jobsList = myJobs && myJobs.length > 0 ? myJobs : [];
  const categories = [
    "all",
    ...new Set([
      ...globalCategories.map((c) => (typeof c === "string" ? c : c?.title)).filter(Boolean),
      ...jobsList.map((j) => j.category || j.department || "Engineering").filter(Boolean),
    ]),
  ];

  const featuredInPage = jobsList.filter((j) => (j.status || j.jobStatus) === "FEATURED" || j.featured).length;
  const totalFeatured = totalElements > jobsList.length && jobsList.length > 0
    ? Math.round((featuredInPage / jobsList.length) * totalElements)
    : featuredInPage;

  const getPageNumbers = () => {
    const pageNum = currentPage + 1; // 1-indexed
    const pages = [];
    const delta = 2;
    const left = Math.max(2, pageNum - delta);
    const right = Math.min(totalPages - 1, pageNum + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const filteredJobs = jobsList.filter((job) => {
    const title = job.title || job.jobTitle || "";
    const category = job.category || job.department || "";
    const description = job.description || "";
    const location = job.location || `${job.city || ''} ${job.state || ''} ${job.country || ''}`;
    const skills = Array.isArray(job.skillsRequired) ? job.skillsRequired.join(" ") : (Array.isArray(job.skills) ? job.skills.join(" ") : "");
    const mode = job.workingMode || "";
    const type = job.jobType || "";

    const searchableText = `${title} ${category} ${description} ${location} ${skills} ${mode} ${type}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchKeyword.toLowerCase().trim());
    const status = (job.status || job.jobStatus || "ACTIVE").toUpperCase();

    const matchesCategory = selectedCategory === "all" || category.toLowerCase() === selectedCategory.toLowerCase();

    if (activeTab === "active") return matchesSearch && matchesCategory && (status === "ACTIVE" || status === "OPEN");
    if (activeTab === "featured") return matchesSearch && matchesCategory && (status === "FEATURED" || job.featured);
    if (activeTab === "closed") return matchesSearch && matchesCategory && status === "CLOSED";
    return matchesSearch && matchesCategory;
  });

  return (
    <RecruiterLayout
      title="Job Management Studio"
      subtitle="Publish, edit, feature, and oversee all active job listings for your organization."
      breadcrumbs={[{ label: "Job Management" }]}
      action={
        <Link
          to="/upload-job"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:scale-105 transition cursor-pointer font-satoshi"
        >
          <Plus size={16} />
          <span>Post New Job</span>
        </Link>
      }
    >
      {/* Success Notification Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-300 font-satoshi shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Top Filter & Toolbar Bar */}
      <Card className="p-4 sm:p-5 border-border bg-surface shadow-xl space-y-4 font-satoshi">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {[
              { id: "all", label: "All Jobs", count: totalElements },
              { id: "active", label: "Active", count: totalElements },
              { id: "featured", label: "Featured", count: totalFeatured },
              { id: "closed", label: "Closed", count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "gradient-bg-signature text-white shadow-md"
                    : "bg-surface-elevated border border-border text-muted hover:bg-surface-hover hover:text-heading"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-surface text-muted"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Category Selector & View Switcher */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search job titles..."
                className="w-full rounded-2xl border border-border bg-surface-elevated pl-10 pr-4 py-2 text-xs text-heading placeholder-muted outline-none focus:border-primary/60 font-medium transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-heading font-bold outline-none focus:border-primary/60 cursor-pointer"
              style={{ colorScheme: 'auto' }}
            >
              <option value="all" className="bg-surface text-heading">All Departments</option>
              {categories.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat} className="bg-surface text-heading">{cat}</option>
              ))}
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center rounded-2xl border border-border bg-surface-elevated p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl transition cursor-pointer ${viewMode === "grid" ? "bg-primary text-white" : "text-muted hover:text-heading"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-xl transition cursor-pointer ${viewMode === "table" ? "bg-primary text-white" : "text-muted hover:text-heading"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Jobs Display */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-border bg-surface shadow-2xl">
          <AlertCircle className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto opacity-70" />
          <h3 className="text-lg font-black text-heading font-satoshi">No Posted Jobs Found</h3>
          <p className="text-xs text-body max-w-sm mx-auto font-medium">
            No active jobs match your search keywords or active filter criteria. Click below to create a new job post.
          </p>
          <Link
            to="/upload-job"
            className="inline-flex items-center gap-2 rounded-2xl gradient-bg-signature px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-105 transition cursor-pointer font-satoshi"
          >
            <Plus size={14} /> Post a New Role
          </Link>
        </Card>
      ) : viewMode === "grid" ? (
        /* 3D Glassmorphic Job Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-satoshi">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="flex flex-col justify-between p-6 border-border bg-surface hover:border-primary/40 transition-all duration-300 shadow-xl group"
            >
              <div className="space-y-4">
                {/* Status Header */}
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-xl bg-indigo-50 dark:bg-primary/15 border border-indigo-200 dark:border-primary/30 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                    {job.category || job.department || "Engineering"}
                  </span>
                  <StatusChip status={job.status || job.jobStatus || "ACTIVE"} />
                </div>

                {/* Job Title & Details */}
                <div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-base font-black text-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1"
                  >
                    {job.title || job.jobTitle}
                  </Link>
                  <p className="text-xs text-muted font-medium mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-indigo-600 dark:text-indigo-400" /> {job.workingMode || job.location || "Remote"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={13} className="text-indigo-600 dark:text-indigo-400" /> {job.jobType || "Full Time"}</span>
                  </p>
                </div>

                {/* Salary & Applicants */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {job.salaryMin ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}` : "Market Standard Salary"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-primary/15 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-primary/30">
                    <Users size={12} /> {job.applicantsCount ?? job.applicationsCount ?? job.totalApplicants ?? job.totalApplications ?? (Array.isArray(job.applications) ? job.applications.length : 0)} Applicants
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-surface-elevated border border-border px-2.5 py-1.5 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                  >
                    <Eye size={14} /> View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(job)}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 dark:bg-primary/15 border border-indigo-200 dark:border-primary/30 px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-primary/25 transition cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteJob(job.id, job.title || job.jobTitle)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="p-0 overflow-hidden border-border bg-surface shadow-2xl font-satoshi">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-muted font-bold">
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Work Mode</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-hover transition">
                    <td className="p-4">
                      <Link to={`/jobs/${job.id}`} className="font-extrabold text-heading hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-satoshi">
                        {job.title || job.jobTitle}
                      </Link>
                      <p className="text-[11px] text-muted mt-0.5">Job #{job.id}</p>
                    </td>
                    <td className="p-4 text-body font-semibold">{job.category || job.department || "Engineering"}</td>
                    <td className="p-4 text-body font-semibold">{job.workingMode || "Remote"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-primary/15 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-primary/30 font-satoshi">
                        {job.applicantsCount ?? job.applicationsCount ?? job.totalApplicants ?? job.totalApplications ?? (Array.isArray(job.applications) ? job.applications.length : 0)}
                      </span>
                    </td>
                    <td className="p-4"><StatusChip status={job.status || job.jobStatus || "ACTIVE"} /></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/jobs/${job.id}`} className="p-2 text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-surface-hover rounded-xl transition" title="View Job Details">
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(job)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-primary/15 rounded-xl transition cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id, job.title || job.jobTitle)}
                          className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 font-satoshi">
          <div className="text-xs text-muted font-bold">
            Showing <span className="text-heading font-extrabold">{currentPage * 50 + 1}</span> to{" "}
            <span className="text-heading font-extrabold">{Math.min((currentPage + 1) * 50, totalElements)}</span> of{" "}
            <span className="text-heading font-extrabold">{totalElements.toLocaleString()}</span> jobs
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => {
                setCurrentPage((p) => Math.max(0, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-surface-elevated text-xs font-bold text-body hover:bg-surface-hover hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted font-bold">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => {
                    setCurrentPage(p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                    currentPage === p - 1
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "border border-border bg-surface-elevated text-body hover:bg-surface-hover hover:text-heading"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-surface-elevated text-xs font-bold text-body hover:bg-surface-hover hover:text-heading disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Executive Edit Job Modal (PUT /api/recruiter/jobs/{jobId}) */}
      {showEditModal && editingJob && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Job: ${editingJob.title || editingJob.jobTitle}`}
        >
          <form onSubmit={handleSaveEditJob} className="space-y-5 text-sm font-satoshi text-body">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-inner"
              />
            </div>

            {/* Department & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                  Category / Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-semibold outline-none focus:border-primary transition shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                  Location (City, State, Country) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g. Mumbai, Maharashtra, India"
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-semibold outline-none focus:border-primary transition shadow-inner"
                />
              </div>
            </div>

            {/* Job Type, Work Mode, Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Job Type</label>
                <select
                  value={editForm.jobType}
                  onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-heading font-extrabold outline-none focus:border-primary transition cursor-pointer"
                  style={{ colorScheme: 'auto' }}
                >
                  <option value="FULL_TIME" className="bg-surface text-heading">Full Time</option>
                  <option value="PART_TIME" className="bg-surface text-heading">Part Time</option>
                  <option value="CONTRACT" className="bg-surface text-heading">Contract</option>
                  <option value="INTERNSHIP" className="bg-surface text-heading">Internship</option>
                  <option value="FREELANCE" className="bg-surface text-heading">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Work Mode</label>
                <select
                  value={editForm.workingMode}
                  onChange={(e) => setEditForm({ ...editForm, workingMode: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-heading font-extrabold outline-none focus:border-primary transition cursor-pointer"
                  style={{ colorScheme: 'auto' }}
                >
                  <option value="REMOTE" className="bg-surface text-heading">Remote</option>
                  <option value="HYBRID" className="bg-surface text-heading">Hybrid</option>
                  <option value="ON_SITE" className="bg-surface text-heading">On Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Experience Level</label>
                <select
                  value={editForm.experienceLevel}
                  onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-heading font-extrabold outline-none focus:border-primary transition cursor-pointer"
                  style={{ colorScheme: 'auto' }}
                >
                  <option value="ENTRY" className="bg-surface text-heading">Entry Level</option>
                  <option value="MID" className="bg-surface text-heading">Mid Level</option>
                  <option value="SENIOR" className="bg-surface text-heading">Senior Level</option>
                  <option value="LEAD" className="bg-surface text-heading">Lead / Executive</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Minimum Salary (₹)</label>
                <input
                  type="number"
                  value={editForm.salaryMin}
                  onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })}
                  placeholder="e.g. 1200000"
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-semibold outline-none focus:border-primary transition shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Maximum Salary (₹)</label>
                <input
                  type="number"
                  value={editForm.salaryMax}
                  onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })}
                  placeholder="e.g. 1800000"
                  className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-semibold outline-none focus:border-primary transition shadow-inner"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={editForm.skillsInput}
                onChange={(e) => setEditForm({ ...editForm, skillsInput: e.target.value })}
                placeholder="e.g. React 19, TypeScript, Spring Boot, Node.js"
                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-heading font-semibold outline-none focus:border-primary transition shadow-inner"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe key responsibilities and qualifications..."
                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-heading leading-relaxed font-medium outline-none focus:border-primary transition shadow-inner"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3 font-satoshi">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-surface-elevated text-body border border-border text-sm font-extrabold hover:bg-surface-hover hover:text-heading transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl gradient-bg-signature px-6 py-2.5 text-sm font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition cursor-pointer"
              >
                <Save size={16} /> {isSubmitting ? "Saving Changes..." : "Save Job Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        opened={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, jobId: null, title: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Job Opening"
        description={`Are you sure you want to permanently delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete Job"
        variant="danger"
      />
    </RecruiterLayout>
  );
}

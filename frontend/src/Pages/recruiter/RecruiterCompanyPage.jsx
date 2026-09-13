import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../../components/ui/ToastNotification";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Edit3,
  Save,
  X,
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

import {
  getMyCompany,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
  uploadCompanyCover,
  clearCompanyState,
} from "../../State/CompanySlice";
import { resolveImageUrl } from "../../utils/assetUtils";

// ─── Industry Options ───────────────────────────────────────────────────────
const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Retail & E-Commerce",
  "Manufacturing",
  "Transportation & Logistics",
  "Media & Entertainment",
  "Real Estate",
  "Consulting",
  "Energy & Utilities",
  "Government & Public Sector",
  "Non-Profit",
  "Legal",
  "Marketing & Advertising",
  "Hospitality & Tourism",
  "Agriculture",
  "Construction",
  "Telecommunications",
  "Other",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+",
];

// ─── Empty initial form state ────────────────────────────────────────────────
const EMPTY_FORM = {
  companyName: "",
  website: "",
  email: "",
  phone: "",
  industry: "",
  companySize: "",
  headquarters: "",
  foundedYear: "",
  description: "",
  mission: "",
  benefits: "",
};

// ─── Helper: get initials for avatar fallback ───────────────────────────────
function getInitials(name) {
  if (!name) return "CO";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Helper: extract error string from Redux rejection ──────────────────────
function extractError(payload) {
  if (!payload) return "Something went wrong";
  if (typeof payload === "string") return payload;
  if (payload.message) return payload.message;
  return "Something went wrong";
}

// ════════════════════════════════════════════════════════════════════════════
// RecruiterCompanyPage
// ════════════════════════════════════════════════════════════════════════════
export default function RecruiterCompanyPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { myCompany, loading, error, success, message } = useSelector(
    (state) => state.company
  );
  const { user } = useSelector((state) => state.auth);

  // ─── Local state ───────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [savingForm, setSavingForm] = useState(false);

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // ─── Fetch company on mount ────────────────────────────────────────────
  useEffect(() => {
    dispatch(getMyCompany());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Populate form when company data arrives ───────────────────────────
  useEffect(() => {
    if (myCompany) {
      setForm({
        companyName: myCompany.companyName || "",
        website: myCompany.website || "",
        email: myCompany.email || "",
        phone: myCompany.phone || "",
        industry: myCompany.industry || "",
        companySize: myCompany.companySize || "",
        headquarters: myCompany.headquarters || "",
        foundedYear: myCompany.foundedYear || "",
        description: myCompany.description || "",
        mission: myCompany.mission || "",
        benefits: myCompany.benefits || "",
      });
    }
  }, [myCompany]);

  // ─── Redux error / success toasts ─────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(extractError(error));
      dispatch(clearCompanyState());
    }
  }, [error, dispatch]);

  // ─── Form helpers ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSavingForm(true);
    try {
      const action = myCompany
        ? updateCompany(form)
        : createCompany(form);
      const result = await dispatch(action);
      if (result.meta.requestStatus === "fulfilled") {
        toast.success(myCompany ? "Company updated!" : "Company created!");
        setIsEditing(false);
      } else {
        toast.error(extractError(result.payload));
      }
    } finally {
      setSavingForm(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (myCompany) {
      setForm({
        companyName: myCompany.companyName || "",
        website: myCompany.website || "",
        email: myCompany.email || "",
        phone: myCompany.phone || "",
        industry: myCompany.industry || "",
        companySize: myCompany.companySize || "",
        headquarters: myCompany.headquarters || "",
        foundedYear: myCompany.foundedYear || "",
        description: myCompany.description || "",
        mission: myCompany.mission || "",
        benefits: myCompany.benefits || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  };

  // ─── Logo upload ───────────────────────────────────────────────────────
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    const result = await dispatch(uploadCompanyLogo(file));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Logo updated!");
      setLogoPreview(null);
    } else {
      toast.error(extractError(result.payload));
      setLogoPreview(null);
    }
  };

  // ─── Cover upload ──────────────────────────────────────────────────────
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
    const result = await dispatch(uploadCompanyCover(file));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Cover image updated!");
      setCoverPreview(null);
    } else {
      toast.error(extractError(result.payload));
      setCoverPreview(null);
    }
  };

  // ─── Derived image URLs ────────────────────────────────────────────────
  const logoSrc =
    logoPreview ||
    resolveImageUrl(myCompany?.logoUrl || myCompany?.logo, "uploads/logo");
  const coverSrc =
    coverPreview ||
    resolveImageUrl(
      myCompany?.coverImageUrl || myCompany?.coverImage,
      "uploads/cover"
    );

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  // ── Initial loading ────────────────────────────────────────────────────
  if (loading && !myCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm">Loading company profile…</p>
        </div>
      </div>
    );
  }

  // ── No company yet — onboarding empty state ────────────────────────────
  if (!myCompany && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Set Up Your Company Profile
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
            Create your company profile to start posting jobs and attracting top talent.
            A complete profile increases your visibility and trust with candidates.
          </p>
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-8 text-left">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your account is active. Fill in your company details below to complete onboarding.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Building2 className="w-5 h-5" />
            Create Company Profile
          </button>
        </div>
      </div>
    );
  }

  // ── Create form (no company + editing) ────────────────────────────────
  if (!myCompany && isEditing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Company Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Fill in your company details to get started
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <CompanyForm
            form={form}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={savingForm}
            isNew={true}
          />
        </div>
      </div>
    );
  }

  // ── Main view with existing company ───────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ── Cover Banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 h-48 group">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt="Company cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        {/* Hover overlay for cover upload */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera className="w-6 h-6" />
          <span className="font-medium">Change Cover</span>
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* ── Company Header Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 -mt-10 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={myCompany.companyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {getInitials(myCompany.companyName)}
                </span>
              )}
            </div>
            {/* Logo upload trigger */}
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {myCompany.companyName}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {myCompany.industry && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {myCompany.industry}
                </span>
              )}
              {myCompany.headquarters && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {myCompany.headquarters}
                </span>
              )}
              {myCompany.companySize && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {myCompany.companySize} employees
                </span>
              )}
              {myCompany.foundedYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Founded {myCompany.foundedYear}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={savingForm}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  {savingForm ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <StatCard label="Open Jobs" value={myCompany.totalJobs ?? 0} icon={<Briefcase className="w-4 h-4" />} />
          <StatCard label="Recruiters" value={myCompany.totalRecruiters ?? 0} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Founded" value={myCompany.foundedYear || "—"} icon={<Calendar className="w-4 h-4" />} />
          <StatCard label="Team Size" value={myCompany.companySize || "—"} icon={<Users className="w-4 h-4" />} />
        </div>
      </div>

      {/* ── View / Edit sections ── */}
      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Edit Company Details
          </h2>
          <CompanyForm
            form={form}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={savingForm}
            isNew={false}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Description, Mission, Benefits */}
          <div className="lg:col-span-2 space-y-6">
            {myCompany.description && (
              <InfoCard title="About Us">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {myCompany.description}
                </p>
              </InfoCard>
            )}
            {myCompany.mission && (
              <InfoCard title="Our Mission">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {myCompany.mission}
                </p>
              </InfoCard>
            )}
            {myCompany.benefits && (
              <InfoCard title="Benefits & Perks">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {myCompany.benefits}
                </p>
              </InfoCard>
            )}
            {!myCompany.description && !myCompany.mission && !myCompany.benefits && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Add a company description, mission statement, and benefits to attract more candidates.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Complete your profile →
                </button>
              </div>
            )}
          </div>

          {/* Right: Contact & Details */}
          <div className="space-y-6">
            <InfoCard title="Contact & Details">
              <ul className="space-y-3 text-sm">
                {myCompany.website && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <a
                      href={myCompany.website.startsWith("http") ? myCompany.website : `https://${myCompany.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {myCompany.website}
                    </a>
                  </li>
                )}
                {myCompany.email && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <a href={`mailto:${myCompany.email}`} className="hover:underline truncate">
                      {myCompany.email}
                    </a>
                  </li>
                )}
                {myCompany.phone && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{myCompany.phone}</span>
                  </li>
                )}
                {myCompany.headquarters && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{myCompany.headquarters}</span>
                  </li>
                )}
                {myCompany.industry && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{myCompany.industry}</span>
                  </li>
                )}
                {myCompany.companySize && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{myCompany.companySize} employees</span>
                  </li>
                )}
                {myCompany.foundedYear && (
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Founded in {myCompany.foundedYear}</span>
                  </li>
                )}
                {!myCompany.website && !myCompany.email && !myCompany.phone && (
                  <li className="text-gray-400 italic text-xs">No contact info added yet.</li>
                )}
              </ul>
            </InfoCard>

            {/* Media upload shortcuts */}
            <InfoCard title="Company Media">
              <div className="space-y-3">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-gray-500 dark:text-gray-400"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  {myCompany.logo ? "Update Logo" : "Upload Logo"}
                </button>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-gray-500 dark:text-gray-400"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  {myCompany.coverImage ? "Update Cover" : "Upload Cover Image"}
                </button>
              </div>
            </InfoCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", placeholder = "", required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
    </div>
  );
}

function CompanyForm({ form, onChange, onSave, onCancel, saving, isNew }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={onChange}
            placeholder="e.g. Acme Corporation"
            required
          />
          <FormField
            label="Website"
            name="website"
            value={form.website}
            onChange={onChange}
            placeholder="https://yourcompany.com"
            type="url"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Industry
            </label>
            <select
              name="industry"
              value={form.industry}
              onChange={onChange}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Company Size
            </label>
            <select
              name="companySize"
              value={form.companySize}
              onChange={onChange}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select size…</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Headquarters"
            name="headquarters"
            value={form.headquarters}
            onChange={onChange}
            placeholder="e.g. San Francisco, CA"
          />
          <FormField
            label="Founded Year"
            name="foundedYear"
            value={form.foundedYear}
            onChange={onChange}
            placeholder="e.g. 2015"
            type="number"
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="contact@company.com"
            type="email"
          />
          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+1 (555) 000-0000"
            type="tel"
          />
        </div>
      </div>

      {/* About */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          About the Company
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Company Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              placeholder="Tell candidates about your company, culture, and what makes you unique…"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mission Statement
            </label>
            <textarea
              name="mission"
              value={form.mission}
              onChange={onChange}
              rows={3}
              placeholder="What is your company's mission?"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Benefits & Perks
            </label>
            <textarea
              name="benefits"
              value={form.benefits}
              onChange={onChange}
              rows={3}
              placeholder="Health insurance, remote work, flexible hours, stock options…"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isNew ? "Create Company" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

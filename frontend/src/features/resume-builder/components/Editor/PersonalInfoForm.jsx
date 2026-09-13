/**
 * src/features/resume-builder/components/Editor/PersonalInfoForm.jsx
 * Personal Info form fields (FullName, Title, Email, Phone, Location, LinkedIn, GitHub, Portfolio).
 */

import React from "react";
import { User, Mail, Phone, MapPin, Link, Globe, Briefcase } from "lucide-react";

export default function PersonalInfoForm({ info, onChange }) {
  const handleChange = (field, val) => {
    onChange({ [field]: val });
  };

  return (
    <div className="space-y-5 font-satoshi text-body">
      <div className="pb-3 border-b border-border space-y-1">
        <h3 className="text-lg font-black text-heading flex items-center gap-2">
          <User size={20} className="text-indigo-500 dark:text-indigo-400" /> Personal Information
        </h3>
        <p className="text-xs text-muted font-medium">Enter your contact details and professional online profiles.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="e.g. Vitthal Lodam"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">
            Professional Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.professionalTitle || ""}
              onChange={(e) => handleChange("professionalTitle", e.target.value)}
              placeholder="e.g. Senior Full Stack Software Engineer"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="email"
              value={info?.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="lodamsunil05@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">Phone Number</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">City, Country</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Pune, India"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">LinkedIn Profile URL</label>
          <div className="relative">
            <Link size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.linkedIn || ""}
              onChange={(e) => handleChange("linkedIn", e.target.value)}
              placeholder="linkedin.com/in/username"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">GitHub Profile URL</label>
          <div className="relative">
            <Link size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.gitHub || ""}
              onChange={(e) => handleChange("gitHub", e.target.value)}
              placeholder="github.com/username"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-muted uppercase tracking-wider block">Portfolio / Personal Site</label>
          <div className="relative">
            <Globe size={15} className="absolute left-3.5 top-3 text-muted/60" />
            <input
              type="text"
              value={info?.portfolio || ""}
              onChange={(e) => handleChange("portfolio", e.target.value)}
              placeholder="yourportfolio.dev"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

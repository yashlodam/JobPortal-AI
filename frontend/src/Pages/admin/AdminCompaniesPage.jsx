/**
 * src/Pages/admin/AdminCompaniesPage.jsx
 *
 * Admin Company Management & Verification Directory.
 * 100% Real Data from Redux / Companies API.
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
import { Card } from "../../components/ui/Card";
import { StatusChip } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { getAllCompanies } from "../../State/CompanySlice";
import {
  Building2,
  Search,
  RefreshCw,
  Globe,
  MapPin,
  ExternalLink,
  Briefcase,
  Eye,
} from "lucide-react";

export default function AdminCompaniesPage() {
  const dispatch = useAppDispatch();
  const { companies = [], loading, totalPages = 1, totalElements = 0 } = useAppSelector(
    (state) => state.company
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    dispatch(getAllCompanies({ page: currentPage, size: 15 }));
  }, [dispatch, currentPage]);

  const companiesList = Array.isArray(companies) ? companies : [];

  const filteredCompanies = companiesList.filter((comp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (comp.companyName || comp.name || "").toLowerCase();
    const loc = (comp.location || comp.headquarters || "").toLowerCase();
    const ind = (comp.industry || comp.category || "").toLowerCase();
    return name.includes(q) || loc.includes(q) || ind.includes(q);
  });

  return (
    <AdminLayout
      title="Registered Companies & Employers"
      subtitle="Directory of corporate entities registered to hire talent on the platform."
      breadcrumbs={[
        { label: "Admin Console", to: "/admin/dashboard" },
        { label: "Companies", to: "/admin/companies" },
      ]}
      action={
        <button
          onClick={() => dispatch(getAllCompanies({ page: currentPage, size: 15 }))}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Total Companies:</span>
            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-300 font-satoshi">
              {totalElements || companiesList.length}
            </span>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company by name or location…"
              className="w-full rounded-2xl border border-border bg-surface-elevated pl-10 pr-4 py-2 text-xs text-heading placeholder-muted focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton type="table" rows={6} />
        ) : filteredCompanies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Companies Found"
            description="No registered companies matched your search criteria."
          />
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((comp) => {
                  const companyName = comp.companyName || comp.name || "Company";
                  const website = comp.companyWebsite || comp.website || comp.url;
                  const location = comp.companyLocation || comp.location || comp.headquarters || "Remote / Global";
                  const industry = comp.industry || comp.category || "Technology";

                  return (
                    <TableRow key={comp.id || comp.companyId || companyName}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs">
                            {companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-heading font-satoshi text-xs">{companyName}</p>
                            {comp.id && <p className="text-[10px] text-muted font-mono">ID: #{comp.id}</p>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {website ? (
                          <a
                            href={website.startsWith("http") ? website : `https://${website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[160px]">{website}</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-body text-xs">{location}</span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-body bg-surface-elevated border border-border px-2 py-0.5 rounded-md">
                          {industry}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCompany(comp)}
                            className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                          {comp.id && (
                            <Link
                              to={`/company/${comp.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25 px-2.5 py-1 text-xs font-semibold transition"
                            >
                              <span>Public Page</span>
                              <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements || companiesList.length}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      <Modal
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        title="Company Profile Details"
        size="md"
      >
        {selectedCompany && (
          <div className="p-4 space-y-4 text-heading">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-elevated border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-extrabold text-lg">
                {(selectedCompany.companyName || selectedCompany.name || "C").charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-heading font-satoshi">
                  {selectedCompany.companyName || selectedCompany.name}
                </h4>
                <p className="text-xs text-muted">{selectedCompany.industry || "Technology & Software"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Headquarters:</span>
                <span className="text-heading font-medium">{selectedCompany.location || selectedCompany.headquarters || "Global"}</span>
              </div>

              {(selectedCompany.companyWebsite || selectedCompany.website) && (
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Official Website:</span>
                  <a
                    href={selectedCompany.companyWebsite || selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>{selectedCompany.companyWebsite || selectedCompany.website}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}

              {selectedCompany.description && (
                <div className="pt-2">
                  <span className="text-muted block mb-1">Company Description:</span>
                  <p className="text-body leading-relaxed text-[11px] bg-surface-elevated p-2.5 rounded-xl border border-border">
                    {selectedCompany.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

/**
 * src/Pages/recruiter/RecruiterVerificationPage.jsx
 *
 * Dedicated Recruiter Verification Workspace page.
 */

import React, { useEffect } from "react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import PendingRecruiterDashboard from "../../components/recruiter/verification/PendingRecruiterDashboard";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { fetchVerificationStatus } from "../../State/verificationSlice";

export default function RecruiterVerificationPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);

  useEffect(() => {
    dispatch(fetchVerificationStatus());
  }, [dispatch]);

  return (
    <RecruiterLayout
      title="Recruiter Verification & Compliance"
      subtitle="Track your account review status and manage official company verification credentials."
      breadcrumbs={[
        { label: "Studio", to: "/recruiter/dashboard" },
        { label: "Verification", to: "/recruiter/verification" },
      ]}
    >
      <PendingRecruiterDashboard />
    </RecruiterLayout>
  );
}

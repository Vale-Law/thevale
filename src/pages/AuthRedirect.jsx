import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { deriveRole, isAttorneyVerified } from "@/lib/roleUtils";

export default function AuthRedirect() {
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const role = deriveRole(me);

        if (role === "admin") {
          window.location.href = "/admin/dashboard";
          return;
        }

        if (role === "attorney") {
          const attys = await base44.entities.Attorney.filter({ user_id: me.id });
          const atty = attys[0];
          if (isAttorneyVerified(atty)) {
            window.location.href = "/attorney-dashboard";
          } else if (atty && atty.verification_status === "rejected") {
            window.location.href = "/attorney-pending";
          } else {
            window.location.href = "/attorney-pending";
          }
          return;
        }

        // Client (or no account type set) → their bookings dashboard, so
        // logging in lands somewhere account-specific rather than back on
        // the public marketing homepage.
        window.location.href = "/bookings";
      } catch (err) {
        window.location.href = "/login";
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

// Called after a client signs up with Google.
// The Google account is created and logged in — we just need to stamp the role as 'client'.
export default function ClientGoogleComplete() {
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        // If they don't have an account type yet, set them as a client.
        if (!me.account_type) {
          try {
            await base44.auth.updateMe({ account_type: "client", role: "client" });
          } catch (e) {
            console.error("Failed to set account type:", e);
          }
        }
        window.location.href = "/auth-redirect";
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
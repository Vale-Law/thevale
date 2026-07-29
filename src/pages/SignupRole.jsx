import React from "react";
import { Link } from "react-router-dom";
import { Search, Scale } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useLanguage } from "@/lib/i18n";

export default function SignupRole() {
  const { t } = useLanguage();
  return (
    <AuthLayout title={t('signup.title')} subtitle={t('signup.subtitle')}>
      <div className="space-y-4">
        <Link
          to="/register"
          className="block border border-border rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground mb-1">{t('signup.clientTitle')}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {t('signup.clientDesc')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/signup/attorney"
          className="block border border-border rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground mb-1">{t('signup.attorneyTitle')}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {t('signup.attorneyDesc')}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6 font-body">
        {t('signup.alreadyHaveAccount')}{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          {t('signup.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
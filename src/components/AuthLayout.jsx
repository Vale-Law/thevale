import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/brand/BrandLogo";

export default function AuthLayout({ title, subtitle, footer, children, maxWidth = "max-w-md", logoPosition = "center" }) {
  const isLeft = logoPosition === "left";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isLeft && (
        <div className="px-6 lg:px-10 pt-6 lg:pt-8">
          <Link to="/" className="inline-block">
            <BrandLogo className="h-12 w-auto object-contain" />
          </Link>
        </div>
      )}
      <div className={`flex-1 flex ${isLeft ? 'items-start justify-center pt-8 lg:pt-12' : 'items-center justify-center'} px-4 py-12`}>
        <div className={`w-full ${maxWidth}`}>
          {!isLeft && (
            <div className="text-center mb-10">
              <Link to="/" className="inline-block mb-6">
                <BrandLogo className="h-12 w-auto object-contain mx-auto" />
              </Link>
              {title && <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">{title}</h1>}
              {subtitle && <p className="text-muted-foreground mt-2 font-body text-[15px]">{subtitle}</p>}
            </div>
          )}
          {isLeft && (title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">{title}</h1>}
              {subtitle && <p className="text-muted-foreground mt-2 font-body text-[15px]">{subtitle}</p>}
            </div>
          )}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            {children}
          </div>
          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6 font-body">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
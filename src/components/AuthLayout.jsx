import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BRIEF_LOGO = "https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/03090a7d8_A685878D-8D1E-4B4E-BD14-35608619A7D7.PNG";

export default function AuthLayout({ title, subtitle, footer, children, maxWidth = "max-w-md", logoPosition = "center" }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const isLeft = logoPosition === "left";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isLeft && (
        <div className="px-6 lg:px-10 pt-6 lg:pt-8">
          <Link to="/" className="inline-block">
            <img
              src={BRIEF_LOGO}
              alt="Brief"
              className="h-24 w-auto object-contain"
              style={{ animation: reduced ? 'none' : 'float 3.5s ease-in-out infinite' }}
            />
          </Link>
        </div>
      )}
      <div className={`flex-1 flex ${isLeft ? 'items-start justify-center pt-8 lg:pt-12' : 'items-center justify-center'} px-4 py-12`}>
        <div className={`w-full ${maxWidth}`}>
          {!isLeft && (
            <div className="text-center mb-10">
              <Link to="/" className="inline-block mb-6">
                <img src={BRIEF_LOGO} alt="Brief" className="h-14 w-auto object-contain mx-auto" />
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
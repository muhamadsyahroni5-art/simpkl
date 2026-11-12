import React from 'react';
import { Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-emerald-800/40 bg-gradient-to-r from-emerald-950/95 via-slate-950/95 to-emerald-950/95 backdrop-blur-md text-slate-300 text-xs py-4 px-4 sm:px-6 shadow-xl no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Kantor Kementerian Agama Kabupaten Lebak</span>
          </div>
          <span className="hidden sm:inline text-emerald-800/80">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3 h-3 text-emerald-500/80 shrink-0" />
            <span>Jl. Siliwangi No. 2 Rangkasbitung, Banten 42314</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
          <a
            href="tel:0252201319"
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
            title="Telepon Resmi"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">(0252) 201319</span>
          </a>
          <a
            href="mailto:sekjen_416610@kemenag.go.id"
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
            title="Email Resmi"
          >
            <Mail className="w-3 h-3 text-emerald-400" />
            <span>sekjen_416610@kemenag.go.id</span>
          </a>
          <a
            href="https://kemenaglebak.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
            title="Website Resmi"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>kemenaglebak.com</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
        <p>© {currentYear} Pusdatin Kemenag Lebak. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="mt-1 sm:mt-0 font-medium text-emerald-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SIMAGANG KEMENAG LEBAK (Sistem Informasi Anak Magang) &middot; Ikhlas Beramal</span>
        </p>
      </div>
    </footer>
  );
};

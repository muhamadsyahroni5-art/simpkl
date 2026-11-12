import React from 'react';

interface OfficialKopSuratProps {
  nomorSurat?: string;
  perihal?: string;
  lampiran?: string;
  className?: string;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  nomorSurat,
  perihal,
  lampiran = '-',
  className = '',
}) => {
  return (
    <div className={`w-full font-arial ${className}`}>
      {/* Header Kop */}
      <div className="flex items-center justify-between pb-3 relative">
        {/* Logo Kemenag */}
        <div className="w-24 shrink-0 flex items-center justify-center">
          <img
            src="/assets/aistudio/media_1792507912355_fb074e24_71599073.png"
            alt="Logo Kementerian Agama RI"
            className="w-20 h-20 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text Kop */}
        <div className="flex-1 text-center px-2">
          <h1 className="text-[14pt] font-bold tracking-wide uppercase text-black leading-tight">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA
          </h1>
          <h2 className="text-[12pt] font-bold tracking-wide uppercase text-black leading-tight mt-0.5">
            KANTOR KEMENTERIAN AGAMA KABUPATEN LEBAK
          </h2>
          <p className="text-[9pt] text-black leading-tight mt-1 font-normal">
            Jl. Siliwangi No. 2, Kel. Muara Ciujung Timur Kec. Rangkasbitung, Kabupaten Lebak, Banten 42314
          </p>
          <p className="text-[9pt] text-black leading-tight mt-0.5 font-normal">
            Telp: (0252) 201319 • E-mail: sekjen_416610@kemenag.go.id • site: https://kemenaglebak.com
          </p>
        </div>

        {/* Spacer for symmetrical centering */}
        <div className="w-24 shrink-0 hidden sm:block"></div>
      </div>

      {/* Garis Ganda Resmi Kop Surat */}
      <div className="border-b-[3px] border-black w-full mb-[1.5px]"></div>
      <div className="border-b-[1px] border-black w-full mb-5"></div>

      {/* Baris Nomor Surat Opsional */}
      {nomorSurat && (
        <div className="mb-4 text-[10pt] text-black">
          <div className="grid grid-cols-12 gap-1">
            <div className="col-span-2 font-medium">Nomor</div>
            <div className="col-span-10">: {nomorSurat}</div>
            {lampiran && (
              <>
                <div className="col-span-2 font-medium">Lampiran</div>
                <div className="col-span-10">: {lampiran}</div>
              </>
            )}
            {perihal && (
              <>
                <div className="col-span-2 font-medium">Perihal</div>
                <div className="col-span-10 font-bold">: {perihal}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Link2, CheckCircle2 } from 'lucide-react';

interface ArticlePhotoUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  productName?: string;
}

export default function ArticlePhotoUpload({
  currentImageUrl,
  onImageUploaded,
  productName
}: ArticlePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState<string>(currentImageUrl || '');
  const [uploadedNotice, setUploadedNotice] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        setUrlInput(dataUrl);
        onImageUploaded(dataUrl);
        setUploadedNotice(true);
        setTimeout(() => setUploadedNotice(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onImageUploaded(urlInput.trim());
      setUploadedNotice(true);
      setTimeout(() => setUploadedNotice(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-purple-700" />
          <span>Artikelfoto {productName ? `– ${productName}` : ''}</span>
        </span>
        {uploadedNotice && (
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Gespeichert
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={productName || 'Artikelbild'}
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-300" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Foto vom Gerät hochladen</span>
          </button>

          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Link2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Oder Bild-URL einfügen..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] text-neutral-800 focus:border-purple-600 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

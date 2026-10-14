import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { IMAGE_ACCEPT, validateImage } from '../features/operatorContent/operatorContentApi';
import { mediaUrl } from '../utils/utils';

// Выбор картинки с предпросмотром. Сам ничего не загружает — отдаёт File наверх.
const ImagePicker = ({ currentUrl, file, onChange, label = 'Изображение', rounded = 'rounded-lg' }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;
    const err = validateImage(selected);
    setError(err);
    if (!err) onChange(selected);
  };

  const shown = preview || mediaUrl(currentUrl);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <div className={`w-24 h-24 shrink-0 ${rounded} border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center`}>
          {shown ? (
            <img src={shown} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={28} className="text-gray-300" />
          )}
        </div>
        <div className="space-y-2 min-w-0">
          <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleSelect} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            {shown ? 'Выбрать другое' : 'Выбрать файл'}
          </button>
          {file && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate max-w-[160px]">{file.name}</span>
              <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400">PNG, JPG, WEBP, GIF — до 3 МБ</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default ImagePicker;

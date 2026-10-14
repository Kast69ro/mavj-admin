import React, { useState } from 'react';
import ContentModal, { ErrorBox } from './ContentModal';
import ImagePicker from './ImagePicker';

// Загрузка одной картинки: выбор → предпросмотр → «Загрузить».
// onUpload(file) должен вернуть Promise (например, dispatch(thunk).unwrap()).
const ImageUploadModal = ({ title, label, currentUrl, rounded, onUpload, onClose }) => {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    setSaving(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось загрузить файл');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={title} onClose={onClose}>
      <div className="space-y-4">
        <ImagePicker label={label} currentUrl={currentUrl} file={file} onChange={setFile} rounded={rounded} />
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleUpload}
          disabled={saving || !file}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Загрузка…' : 'Загрузить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default ImageUploadModal;

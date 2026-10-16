import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Upload, ExternalLink, Pencil, Trash2, ImageOff, FileText } from 'lucide-react';
import { updateContentOperator, uploadOperatorLogo } from '../features/operatorContent/operatorContentApi';
import { mediaUrl } from '../utils/utils';
import ImageUploadModal from '../components/ImageUploadModal';
import OperatorRulesModal from '../components/OperatorRulesModal';
import { ConfirmModal } from '../components/ContentModal';

// Вкладка «Сайт»: логотип и регламент оператора
const OperatorSitePage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();

  const [logoOpen, setLogoOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [removeLogoOpen, setRemoveLogoOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const handleRemoveLogo = async () => {
    setRemoving(true);
    setRemoveError(null);
    try {
      await dispatch(updateContentOperator({ code: operator.code, logo_url: null })).unwrap();
      setRemoveLogoOpen(false);
    } catch (e) {
      setRemoveError(e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-4">Логотип</h3>
        <div className="w-28 h-28 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mb-5">
          {operator.logo_url ? (
            <img src={mediaUrl(operator.logo_url)} alt={operator.name} className="w-full h-full object-contain p-2" />
          ) : (
            <ImageOff size={28} className="text-gray-300" />
          )}
        </div>
        <div className="flex items-center justify-between gap-3 mt-auto">
          <button
            onClick={() => setLogoOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            <Upload size={16} /> {operator.logo_url ? 'Заменить логотип' : 'Загрузить логотип'}
          </button>
          {operator.logo_url && (
            <button
              onClick={() => { setRemoveError(null); setRemoveLogoOpen(true); }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"
            >
              <Trash2 size={13} /> Удалить логотип
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-4">Регламент</h3>
        <div className="flex items-start gap-2 text-sm mb-5">
          <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
          {operator.rules_url ? (
            <a
              href={operator.rules_url.startsWith('/') ? mediaUrl(operator.rules_url) : operator.rules_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium break-all"
            >
              {operator.rules_url} <ExternalLink size={13} className="shrink-0" />
            </a>
          ) : (
            <span className="text-gray-400">Регламент не указан</span>
          )}
        </div>
        <div className="mt-auto">
          <button
            onClick={() => setRulesOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            <Pencil size={16} /> Изменить регламент
          </button>
        </div>
      </div>

      {logoOpen && (
        <ImageUploadModal
          title={`Логотип: ${operator.name}`}
          label="Логотип"
          currentUrl={operator.logo_url}
          onUpload={(file) => dispatch(uploadOperatorLogo({ code: operator.code, file })).unwrap()}
          onClose={() => setLogoOpen(false)}
        />
      )}

      {rulesOpen && (
        <OperatorRulesModal
          operator={operator}
          onSave={(rules_url) => dispatch(updateContentOperator({ code: operator.code, rules_url })).unwrap()}
          onClose={() => setRulesOpen(false)}
        />
      )}

      {removeLogoOpen && (
        <ConfirmModal
          title="Удалить логотип?"
          message={`Логотип оператора ${operator.name} будет удалён с сайта.`}
          loading={removing}
          error={removeError}
          onConfirm={handleRemoveLogo}
          onClose={() => setRemoveLogoOpen(false)}
        />
      )}
    </div>
  );
};

export default OperatorSitePage;

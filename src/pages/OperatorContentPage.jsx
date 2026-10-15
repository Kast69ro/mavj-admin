import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Upload, ExternalLink, Pencil, Trash2, ChevronRight, ImageOff, FileText } from 'lucide-react';
import {
  fetchContentOperators,
  updateContentOperator,
  uploadOperatorLogo,
} from '../features/operatorContent/operatorContentApi';
import { OPERATOR_COLORS } from '../utils/operatorColors';
import { mediaUrl } from '../utils/utils';
import ImageUploadModal from '../components/ImageUploadModal';
import OperatorRulesModal from '../components/OperatorRulesModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

const OPERATOR_STATUS_LABELS = {
  inactive: 'Отключён',
  coming_soon: 'Скоро',
};

const OperatorContentPage = () => {
  const dispatch = useDispatch();
  const { operators, operatorsLoading, operatorsError } = useSelector((state) => state.operatorContent);

  const [logoOperator, setLogoOperator] = useState(null);
  const [rulesOperator, setRulesOperator] = useState(null);
  const [removeLogoOperator, setRemoveLogoOperator] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  useEffect(() => {
    dispatch(fetchContentOperators());
  }, [dispatch]);

  const handleRemoveLogo = async () => {
    setRemoving(true);
    setRemoveError(null);
    try {
      await dispatch(updateContentOperator({ code: removeLogoOperator.code, logo_url: null })).unwrap();
      setRemoveLogoOperator(null);
    } catch (e) {
      setRemoveError(e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Операторы</h2>
        <p className="text-sm text-gray-500 mt-1">Логотипы, регламенты, периоды, призы и победители для сайтов операторов</p>
      </div>

      <ErrorBox>{operatorsError}</ErrorBox>

      {operatorsLoading && operators.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-56 animate-pulse" />
          ))}
        </div>
      )}

      {!operatorsLoading && !operatorsError && operators.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
          Операторы не найдены
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operators.map((op) => {
          const colors = OPERATOR_COLORS[op.code] ?? OPERATOR_COLORS.default;
          // Неактивные операторы (inactive, coming_soon и т.п.) показываем затемнёнными и без действий
          const isActive = op.status === 'active';
          return (
            <div
              key={op.code}
              aria-disabled={!isActive}
              className={`rounded-xl shadow-sm border overflow-hidden flex flex-col ${
                isActive
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-100 border-gray-300 opacity-60 grayscale pointer-events-none select-none'
              }`}
            >
              <div className="h-1.5" style={{ backgroundColor: colors.bg }} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 shrink-0 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {op.logo_url ? (
                      <img src={mediaUrl(op.logo_url)} alt={op.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <ImageOff size={22} className="text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-800">{op.name}</h3>
                      {!isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                          {OPERATOR_STATUS_LABELS[op.status] ?? op.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-400">{op.code}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm mb-5 min-h-[20px]">
                  <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  {op.rules_url ? (
                    <a
                      href={op.rules_url.startsWith('/') ? mediaUrl(op.rules_url) : op.rules_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {op.rules_url} <ExternalLink size={13} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-400">Регламент не указан</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => setLogoOperator(op)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    <Upload size={16} /> {op.logo_url ? 'Заменить логотип' : 'Загрузить логотип'}
                  </button>
                  <button
                    onClick={() => setRulesOperator(op)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    <Pencil size={16} /> Изменить регламент
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {op.logo_url ? (
                    <button
                      onClick={() => { setRemoveError(null); setRemoveLogoOperator(op); }}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={13} /> Удалить логотип
                    </button>
                  ) : <span />}
                  <Link
                    to={`/operator-content/${op.code}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: colors.active }}
                  >
                    Периоды <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {logoOperator && (
        <ImageUploadModal
          title={`Логотип: ${logoOperator.name}`}
          label="Логотип"
          currentUrl={logoOperator.logo_url}
          onUpload={(file) => dispatch(uploadOperatorLogo({ code: logoOperator.code, file })).unwrap()}
          onClose={() => setLogoOperator(null)}
        />
      )}

      {rulesOperator && (
        <OperatorRulesModal
          operator={rulesOperator}
          onSave={(rules_url) => dispatch(updateContentOperator({ code: rulesOperator.code, rules_url })).unwrap()}
          onClose={() => setRulesOperator(null)}
        />
      )}

      {removeLogoOperator && (
        <ConfirmModal
          title="Удалить логотип?"
          message={`Логотип оператора ${removeLogoOperator.name} будет удалён с сайта.`}
          loading={removing}
          error={removeError}
          onConfirm={handleRemoveLogo}
          onClose={() => setRemoveLogoOperator(null)}
        />
      )}
    </div>
  );
};

export default OperatorContentPage;

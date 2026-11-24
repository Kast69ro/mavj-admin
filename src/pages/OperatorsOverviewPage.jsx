import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import { OVERVIEW_STATUSES, fetchOperatorsOverview } from '../features/operatorsOverview/operatorsOverviewApi';
import { getOperatorColors, operatorName } from '../utils/operatorColors';
import { mediaUrl } from '../utils/utils';
import { ErrorBox } from '../components/ContentModal';
import NoAccess from '../components/NoAccess';

const plural = (n, one, few, many) => {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
};

// Раздел «Операторы» — только просмотр
const OperatorsOverviewPage = () => {
  const [operators, setOperators] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchOperatorsOverview()
      .then((list) => !cancelled && setOperators(list))
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error?.status === 403) return <NoAccess />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Операторы</h2>
      <ErrorBox>{error?.message}</ErrorBox>
      {!operators && !error && <p className="text-sm text-gray-400">Загрузка…</p>}
      {operators?.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
          Операторы не найдены
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {operators?.map((op) => {
          const colors = getOperatorColors(op.code);
          const status = OVERVIEW_STATUSES[op.status];
          const name = op.name || operatorName(op.code);
          return (
            <Link
              key={op.code}
              to={`/operators/${op.code}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="h-1.5" style={{ backgroundColor: colors.bg }} />
              <div className="p-5 flex items-center gap-4">
                <div
                  className="w-14 h-14 shrink-0 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
                  style={{ borderColor: colors.bg }}
                >
                  {op.logo_url ? (
                    <img src={mediaUrl(op.logo_url)} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="font-bold text-xl" style={{ color: colors.active }}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 truncate">{name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {op.status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.className ?? 'bg-gray-100 text-gray-500'}`}>
                        {status?.label ?? op.status}
                      </span>
                    )}
                    {op.documents_count != null && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <FileText size={13} className="text-gray-400" />
                        {op.documents_count} {plural(op.documents_count, 'документ', 'документа', 'документов')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OperatorsOverviewPage;

import React from 'react';
import { Building2, FolderOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import DocumentsManager from '../components/documents/DocumentsManager';
import { OPERATOR_COLORS } from '../utils/operatorColors';

// «Настройки → Наша компания»: документы, не привязанные к оператору
const CompanySettingsPage = () => {
  const colors = OPERATOR_COLORS.company;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: colors.bg }} />
        <div className="px-6 pt-5 flex items-center gap-4">
          <div
            className="w-14 h-14 shrink-0 rounded-xl border bg-white flex items-center justify-center"
            style={{ borderColor: colors.bg }}
          >
            <Building2 size={24} style={{ color: colors.active }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Наша компания</h2>
            <p className="text-xs text-gray-400">Документы Mavj, не привязанные к оператору</p>
          </div>
        </div>
        <nav className="px-4 mt-4 flex gap-1 overflow-x-auto border-t border-gray-100">
          <NavLink
            to="/settings/company/documents"
            className="flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap text-gray-900"
            style={{ borderColor: colors.active }}
          >
            <FolderOpen size={16} /> Документы
          </NavLink>
        </nav>
      </div>

      <DocumentsManager owner="company" />
    </div>
  );
};

export default CompanySettingsPage;

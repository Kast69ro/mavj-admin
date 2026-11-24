import React from 'react';
import { File, FileArchive, FileImage, FileSpreadsheet, FileText } from 'lucide-react';
import { COMPANY_NAME, fileExtension } from '../../features/documents/documentsApi';
import { getOperatorColors, operatorName } from '../../utils/operatorColors';

const FORMATS = {
  pdf: { icon: FileText, color: 'text-red-600', label: 'PDF' },
  doc: { icon: FileText, color: 'text-blue-600', label: 'Word' },
  docx: { icon: FileText, color: 'text-blue-600', label: 'Word' },
  xls: { icon: FileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
  xlsx: { icon: FileSpreadsheet, color: 'text-emerald-600', label: 'Excel' },
  csv: { icon: FileSpreadsheet, color: 'text-emerald-600', label: 'CSV' },
  txt: { icon: FileText, color: 'text-gray-500', label: 'Текст' },
  jpg: { icon: FileImage, color: 'text-violet-600', label: 'Изображение' },
  jpeg: { icon: FileImage, color: 'text-violet-600', label: 'Изображение' },
  png: { icon: FileImage, color: 'text-violet-600', label: 'Изображение' },
  zip: { icon: FileArchive, color: 'text-amber-600', label: 'ZIP' },
};
const UNKNOWN_FORMAT = { icon: File, color: 'text-gray-400', label: 'Файл' };

export const FormatIcon = ({ fileName, size = 18 }) => {
  const { icon: Icon, color, label } = FORMATS[fileExtension(fileName)] ?? UNKNOWN_FORMAT;
  return (
    <span title={label} className={`shrink-0 ${color}`}>
      <Icon size={size} aria-label={label} />
    </span>
  );
};

// Чей документ: цветная метка + название. Для наших — «Mavj (наши)» со своей меткой
export const OwnerBadge = ({ doc }) => {
  const isCompany = doc.owner === 'company';
  const colors = getOperatorColors(isCompany ? 'company' : doc.operator);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={`w-2.5 h-2.5 shrink-0 ${isCompany ? 'rounded-sm' : 'rounded-full'}`}
        style={{ backgroundColor: colors.bg }}
      />
      <span className="font-medium text-gray-800">
        {doc.operator_name || (isCompany ? COMPANY_NAME : operatorName(doc.operator))}
      </span>
    </span>
  );
};

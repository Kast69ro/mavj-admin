import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DocumentsManager from '../components/documents/DocumentsManager';

// Вкладка «Документы» в «Настройках»: документы выбранного оператора
const OperatorDocumentsPage = () => {
  const { operator } = useOutletContext();
  return <DocumentsManager key={operator.code} owner="operator" operator={operator.code} />;
};

export default OperatorDocumentsPage;

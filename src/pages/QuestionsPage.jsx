import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const QuestionsPage = () => {
  const [file, setFile] = useState(null);
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [currentTestQuestion, setCurrentTestQuestion] = useState(0);
  const [testAnswer, setTestAnswer] = useState('');
  const [testHistory, setTestHistory] = useState([]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    if (uploadedFile) {
      setLoadedQuestions([
        { question: 'Столица Таджикистана?', option1: 'Душанбе', option2: 'Бишкек', option3: 'Ташкент', option4: 'Алматы', correctAnswer: 1, points: 10 },
        { question: 'Сколько континентов на Земле?', option1: '5', option2: '6', option3: '7', option4: '8', correctAnswer: 3, points: 10 },
      ]);
      setCurrentTestQuestion(0);
      setTestHistory([]);
    }
  };

  const handleTestAnswer = () => {
    if (!testAnswer) return;
    const userAnswer = parseInt(testAnswer);
    const currentQ = loadedQuestions[currentTestQuestion];
    const isCorrect = userAnswer === currentQ.correctAnswer;
    setTestHistory([...testHistory, {
      question: currentQ.question,
      userAnswer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      points: isCorrect ? currentQ.points : 0
    }]);
    setTestAnswer('');
    if (currentTestQuestion < loadedQuestions.length - 1) {
      setCurrentTestQuestion(currentTestQuestion + 1);
    }
  };

  const currentQ = loadedQuestions[currentTestQuestion];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Добавление вопросов</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-2">Загрузка файла</h3>
        <p className="text-sm text-gray-500 mb-4">Файл загружается из ПК в Excel формате</p>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload size={40} className="mx-auto text-gray-400 mb-4" />
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block text-sm font-medium">
              Выбрать файл
            </span>
          </label>
          {file && <p className="mt-4 text-sm text-emerald-600 font-medium">✔ Выбран файл: {file.name}</p>}
        </div>
      </div>

      {file && loadedQuestions.length > 0 && currentTestQuestion < loadedQuestions.length && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Тест вопросов</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-lg font-semibold mb-4">{currentQ.question}</p>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="font-bold text-blue-600">{num}</span>
                  <span className="text-sm">{currentQ[`option${num}`]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              max="4"
              value={testAnswer}
              onChange={e => setTestAnswer(e.target.value)}
              placeholder="Введите номер ответа (1-4)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleTestAnswer}
              disabled={!testAnswer}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
            >
              Отправить
            </button>
          </div>
        </div>
      )}

      {testHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">История ответов</h3>
          <div className="space-y-2">
            {testHistory.map((h, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${h.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-medium">{h.question}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ваш ответ: {h.userAnswer} | Правильный: {h.correctAnswer} | {h.isCorrect ? `✔ +${h.points} баллов` : '✗'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
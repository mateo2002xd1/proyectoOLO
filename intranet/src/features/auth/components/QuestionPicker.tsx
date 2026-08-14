export interface CatalogQuestion {
  key: string;
  label: string;
}

interface QuestionPickerProps {
  classPrefix: string;
  catalogQuestions: CatalogQuestion[];
  totalQuestions: number;
  currentIndex: number;
  selectedKeys: string[];
  answers: string[];
  errors: { question?: string; answer?: string };
  onSelectQuestion: (key: string) => void;
  onAnswerChange: (value: string) => void;
}

export function QuestionPicker({
  classPrefix,
  catalogQuestions,
  totalQuestions,
  currentIndex,
  selectedKeys,
  answers,
  errors,
  onSelectQuestion,
  onAnswerChange,
}: QuestionPickerProps) {
  return (
    <>
      <div className={`${classPrefix}-field`}>
        <select
          className={`${classPrefix}-select ${errors.question ? `${classPrefix}-input-error` : ''}`}
          value={selectedKeys[currentIndex] || ''}
          onChange={(e) => onSelectQuestion(e.target.value)}
        >
          <option value="" disabled>Selecciona una opción...</option>
          {catalogQuestions.map((q) => (
            <option
              key={q.key}
              value={q.key}
              disabled={selectedKeys.includes(q.key) && selectedKeys[currentIndex] !== q.key}
            >
              {q.label}
            </option>
          ))}
        </select>
        {errors.question && <span className={`${classPrefix}-error`}>{errors.question}</span>}
      </div>

      <div className={`${classPrefix}-field`}>
        <input
          type="text"
          maxLength={255}
          placeholder="Respuesta"
          value={answers[currentIndex]}
          onChange={(e) => onAnswerChange(e.target.value)}
          className={`${classPrefix}-input ${errors.answer ? `${classPrefix}-input-error` : ''}`}
        />
        {errors.answer && <span className={`${classPrefix}-error`}>{errors.answer}</span>}
      </div>

      <div className={`${classPrefix}-progress`}>
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`${classPrefix}-progress-dot ${i === currentIndex ? `${classPrefix}-progress-active` : ''} ${i < currentIndex ? `${classPrefix}-progress-done` : ''}`}
          />
        ))}
      </div>
    </>
  );
}

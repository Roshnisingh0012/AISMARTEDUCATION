import React, { useEffect, useState } from 'react';
import { fetchQuizPreview, updateQuestion, deleteQuestion, publishQuiz } from '../api/admin';
import { Trash2, Edit2, CheckCircle, Save, X } from 'lucide-react';

interface Props {
  quizId: string;
  onPublished: () => void;
}

export const QuizReviewEditor: React.FC<Props> = ({ quizId, onPublished }) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchQuizPreview(quizId);
      setQuiz(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [quizId]);

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateQuestion(quizId, editingId, editForm);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuestion(quizId, id);
    load();
  };

  const handlePublish = async () => {
    await publishQuiz(quizId);
    onPublished();
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading AI generated draft...</div>;
  if (!quiz) return <div className="text-red-500 p-8 text-center">Failed to load draft quiz.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500">Review generated questions before publishing.</p>
        </div>
        <button 
          onClick={handlePublish}
          className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition"
        >
          <CheckCircle className="mr-2" /> Approve & Publish Quiz
        </button>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q: any, i: number) => {
          const isEditing = editingId === q.id;

          if (isEditing) {
            return (
              <div key={q.id} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <input 
                  className="w-full text-lg font-bold p-2 mb-4 border rounded" 
                  value={editForm.question_text}
                  onChange={e => setEditForm({...editForm, question_text: e.target.value})}
                />
                <div className="space-y-2 mb-4">
                  {editForm.options.map((opt: str, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        checked={editForm.correct_option_index === idx}
                        onChange={() => setEditForm({...editForm, correct_option_index: idx})}
                      />
                      <input 
                        className="flex-1 p-2 border rounded text-sm"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...editForm.options];
                          newOpts[idx] = e.target.value;
                          setEditForm({...editForm, options: newOpts});
                        }}
                      />
                    </div>
                  ))}
                </div>
                <textarea 
                  className="w-full p-2 border rounded text-sm mb-4" 
                  rows={2}
                  value={editForm.explanation}
                  onChange={e => setEditForm({...editForm, explanation: e.target.value})}
                  placeholder="Explanation..."
                />
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                  <button onClick={handleSaveEdit} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Save size={16} className="mr-2"/> Save Changes
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900"><span className="text-blue-600 mr-2">Q{i+1}.</span>{q.question_text}</h3>
                <div className="opacity-0 group-hover:opacity-100 transition flex space-x-2">
                  <button onClick={() => { setEditingId(q.id); setEditForm({...q}); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {q.options.map((opt: string, idx: number) => (
                  <li key={idx} className={`p-3 rounded-lg border ${idx === q.correct_option_index ? 'bg-green-50 border-green-200 font-medium text-green-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    {opt} {idx === q.correct_option_index && <span className="ml-2 text-xs uppercase tracking-wider text-green-600 font-bold">(Correct)</span>}
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 border border-gray-100">
                <strong className="text-gray-800">Explanation: </strong> {q.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

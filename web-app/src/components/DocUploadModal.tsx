import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, X } from 'lucide-react';
import { generateQuizFromDoc } from '../api/admin';

interface Props {
  competencies: { id: string, name: string }[];
  onClose: () => void;
  onSuccess: (quizId: string) => void;
}

export const DocUploadModal: React.FC<Props> = ({ competencies, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [compId, setCompId] = useState(competencies[0]?.id || '');
  const [numQ, setNumQ] = useState(10);
  const [diff, setDiff] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.pdf') || f.name.endsWith('.docx'))) setFile(f);
    else setError('Only PDF or DOCX allowed.');
  };

  const handleGenerate = async () => {
    if (!file) return setError('Please select a file.');
    setLoading(true);
    setError('');
    try {
      const res = await generateQuizFromDoc(file, compId, numQ, diff);
      onSuccess(res.quiz_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate AI Quiz from Document</h2>
        
        {/* Dropzone */}
        <div 
          onDragOver={e => e.preventDefault()} 
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer mb-6"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {file ? (
            <div className="flex items-center justify-center text-blue-600 font-medium">
              <FileText className="mr-2" /> {file.name}
            </div>
          ) : (
            <div>
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Click or drag PDF / DOCX here</p>
              <p className="text-xs text-gray-500 mt-1">Maximum size: 10MB</p>
            </div>
          )}
          <input id="file-upload" type="file" className="hidden" accept=".pdf,.docx" onChange={e => e.target.files && setFile(e.target.files[0])} />
        </div>

        {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{error}</div>}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Competency</label>
            <select value={compId} onChange={e => setCompId(e.target.value)} className="w-full border-gray-300 rounded-lg p-2.5 border">
              {competencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
              <select value={numQ} onChange={e => setNumQ(Number(e.target.value))} className="w-full border-gray-300 rounded-lg p-2.5 border">
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={diff} onChange={e => setDiff(e.target.value)} className="w-full border-gray-300 rounded-lg p-2.5 border">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !file}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="animate-spin mr-2" size={20} /> Extracting & Generating...</>
          ) : (
            'Generate Magic Quiz'
          )}
        </button>
      </div>
    </div>
  );
};

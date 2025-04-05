import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaPlus, FaTrash, FaStar, FaList, FaFont } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

type QuestionType = 'rating' | 'multiple-choice' | 'text';

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
};

type CreateSurveyModalProps = {
  onClose: () => void;
  onSurveyCreated: (questions: Question[]) => void;
  hasActiveSurvey: boolean;
};

const CreateSurveyModal = ({ onClose, onSurveyCreated, hasActiveSurvey }: CreateSurveyModalProps) => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'rating',
      text: '',
      required: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...(q.options || []), '']
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options?.filter((_, i) => i !== optionIndex)
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || [])];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    // Validate questions
    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    if (questions.some(q => !q.text)) {
      setError('All questions must have text');
      return;
    }

    if (questions.some(q => q.type === 'multiple-choice' && (!q.options || q.options.length < 2))) {
      setError('Multiple choice questions must have at least 2 options');
      return;
    }

    try {
      setSaving(true);
      const businessRef = doc(db, 'businesses', currentUser.uid);
      await updateDoc(businessRef, {
        activeSurvey: {
          questions,
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      });
      onSurveyCreated(questions);
      onClose();
    } catch (error) {
      console.error('Error creating survey:', error);
      setError('Failed to create survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (hasActiveSurvey) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-black border border-white/10 rounded-xl p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">Active Survey Exists</h2>
            <p className="text-white/70 mb-6">
              You already have an active survey. Please close the existing survey before creating a new one.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Survey</h2>
              <p className="text-white/70 mt-1">
                Create a new survey to gather customer feedback
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">Question {index + 1}</h3>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 mb-2">Question Text</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={e => updateQuestion(question.id, { text: e.target.value })}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Question Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateQuestion(question.id, { type: 'rating' })}
                        className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                          question.type === 'rating'
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <FaStar />
                        Rating
                      </button>
                      <button
                        onClick={() => updateQuestion(question.id, { type: 'multiple-choice' })}
                        className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                          question.type === 'multiple-choice'
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <FaList />
                        Multiple Choice
                      </button>
                      <button
                        onClick={() => updateQuestion(question.id, { type: 'text' })}
                        className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                          question.type === 'text'
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <FaFont />
                        Text
                      </button>
                    </div>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div>
                      <label className="block text-white/70 mb-2">Options</label>
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={e => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          className="w-full p-2 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${question.id}`}
                      checked={question.required}
                      onChange={e => updateQuestion(question.id, { required: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor={`required-${question.id}`} className="text-white/70">
                      Required
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full p-4 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus />
              Add Question
            </button>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-opacity ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                ) : (
                  'Create Survey'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyModal; 
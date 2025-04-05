"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaCheck } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type QuestionType = 'rating' | 'text' | 'multiple-choice';

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
};

type Answer = {
  questionId: string;
  value: string | number;
};

type SurveyProps = {
  businessId: string;
  businessName?: string;
  incentives?: {
    id: string;
    title: string;
    description: string;
    points: number;
    active: boolean;
  }[];
  onComplete: (points: number) => void;
};

const Survey = ({ businessId, businessName, incentives, onComplete }: SurveyProps) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          if (data.activeSurvey?.status === 'active') {
            setQuestions(data.activeSurvey.questions);
          }
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
        setError('Failed to load survey. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurvey();
  }, [businessId, currentUser]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = (value: string | number) => {
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
      const newAnswer = { questionId: currentQuestion.id, value };
      
      if (existingAnswerIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingAnswerIndex] = newAnswer;
        return newAnswers;
      }
      
      return [...prev, newAnswer];
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.value;
  };

  const canSubmit = () => {
    return questions.every(q => 
      !q.required || answers.some(a => a.questionId === q.id)
    );
  };

  const handleSubmit = async () => {
    if (!currentUser || !canSubmit()) return;

    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: increment(50), // Default points for completing a survey
        completedSurveys: arrayUnion(businessId),
        [`surveyAnswers.${businessId}`]: {
          answers,
          completedAt: new Date().toISOString()
        }
      });

      setIsOpen(false);
      onComplete(50);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-400 text-center">
          {error}
        </div>
      );
    }

    if (!currentQuestion) {
      return null;
    }

    const currentAnswer = getCurrentAnswer();

    switch (currentQuestion.type) {
      case 'rating':
        return (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleAnswer(rating)}
                className={`p-3 rounded-lg transition-colors ${
                  currentAnswer === rating
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <FaStar className={currentAnswer === rating ? 'text-white' : 'text-white/40'} />
              </button>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="grid gap-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  currentAnswer === option
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={currentAnswer as string || ''}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
      >
        <FaStar />
        Take Survey
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-black border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {businessName ? `${businessName} Survey` : 'Customer Survey'}
                      </h2>
                      <p className="text-white/70 mt-1">
                        Help us improve by providing your feedback
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {currentQuestionIndex < questions.length ? (
                      <>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white">
                            {currentQuestion.text}
                          </h3>
                          {renderQuestion()}
                        </div>
                      </>
                    ) : (
                      <>
                        {error && (
                          <div className="text-red-400 text-sm">{error}</div>
                        )}
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setCurrentQuestionIndex(0)}
                            className="px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={!canSubmit() || submitting}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-opacity ${
                              !canSubmit() || submitting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:opacity-90'
                            }`}
                          >
                            {submitting ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                            ) : (
                              'Submit Survey'
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Survey; 
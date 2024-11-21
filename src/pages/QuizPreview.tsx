import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Quiz, Question } from '../types/quiz';
import { ArrowLeft, ArrowRight, Timer, Edit2 } from 'lucide-react';

export default function QuizPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz as Quiz;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  // Points per question is now the total points divided by number of questions
  const pointsPerQuestion = quiz.points ? quiz.points : 100;

  useEffect(() => {
    if (!quiz) {
      navigate('/');
      return;
    }
  }, [quiz, navigate]);

  useEffect(() => {
    if (showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return quiz.timeLimit || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResult]);

  const handleNext = () => {
    // Save answer
    if (selectedAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer
      }));

      // Calculate score
      const correctAnswerId = currentQuestion.choices.find(c => c.isCorrect)?.id;
      if (selectedAnswer === correctAnswerId) {
        // Award full points for the question if answered correctly
        setScore(prevScore => prevScore + pointsPerQuestion);
      }
    }

    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(quiz.timeLimit || 30);
    }
  };

  const handleGoToBuilder = () => {
    navigate('/builder', { state: { quiz } });
  };

  if (!quiz) return null;

  if (showResult) {
    const totalPoints = quiz.points || 100 * quiz.questions.length;
    const percentageCorrect = (score / totalPoints) * 100;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Quiz Complete!</h1>
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-purple-600">
              Your Score: {Math.round(score)} points
            </p>
            <p className="text-gray-600 mt-2">
              {Math.round(percentageCorrect)}% Correct
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleGoToBuilder}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Builder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Preview: {quiz.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-600">
              <Timer className="w-5 h-5 mr-2" />
              {timeLeft}s
            </div>
            <button
              onClick={handleGoToBuilder}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Go to Builder
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {pointsPerQuestion} points
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            
            {/* Display Images if any */}
            {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrls[0]}
                  alt="Question"
                  className="max-h-64 mx-auto object-contain"
                />
              </div>
            )}

            {/* Choices */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedAnswer(choice.id)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswer === choice.id
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <ArrowRight className="w-5 h-5" />
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
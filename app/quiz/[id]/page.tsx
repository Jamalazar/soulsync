"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/data/questions';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // updateDoc needed
import { signInAnonymously } from 'firebase/auth';
import { Loader2, Lock, Heart, ShieldCheck } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let user = auth.currentUser;
        if (!user) {
          const cred = await signInAnonymously(auth);
          user = cred.user;
        }

        const docRef = doc(db, "tests", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Test not found!");
          router.push("/");
          return;
        }

        const data = docSnap.data();
        const userIsHost = user.uid === data.hostUserId;
        
        // Security checks
        if (!userIsHost && data.answersB) {
           router.replace(`/results/${id}`);
           return; 
        }
        if (userIsHost && data.answersA) {
           router.replace(`/results/${id}`);
           return;
        }

        setIsHost(userIsHost);
        setUserName(userIsHost ? "Partner A (Host)" : "Partner B (Guest)");
        
        if (!userIsHost) {
          setShowIntro(true);
          // --- NEW SIGNAL: Notify Sarah that Mark is here ---
          if (!data.guestStarted) {
             updateDoc(docRef, { guestStarted: true }).catch(err => console.error(err));
          }
        }

        setLoading(false);

      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    };

    init();
  }, [id, router]);

  const handleAnswer = async (optionIndex: number) => {
    const questionId = QUESTIONS[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<number, number>) => {
    setSaving(true);
    const docRef = doc(db, "tests", id);
    
    const updateData = isHost 
      ? { answersA: finalAnswers, status: 'waiting_for_guest' }
      : { answersB: finalAnswers, status: 'completed' };

    try {
      await updateDoc(docRef, updateData);
      router.push(`/results/${id}`);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save answers.");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  // --- INTRO SCREEN ---
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-indigo-50">
          
          <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative flex items-center justify-center">
                  <div className="bg-blue-100 text-slate-900 pl-6 pr-8 py-3 rounded-l-full rounded-r-lg relative z-10 flex items-center shadow-sm">
                      <span className="text-3xl font-black tracking-tight">Soul</span>
                  </div>
                  <div className="bg-slate-900 text-white pl-8 pr-6 py-3 rounded-r-full rounded-l-lg relative z-0 -ml-4 shadow-sm flex items-center">
                      <span className="text-3xl font-black tracking-tight">Sync</span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                       <div className="bg-white p-1 rounded-full shadow-sm">
                          <div className="bg-indigo-100 p-1.5 rounded-full">
                              <Heart className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                          </div>
                       </div>
                  </div>
              </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">You've been invited!</h2>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 space-y-5 text-left">
            <div className="flex items-start gap-4">
               <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
               </div>
               <div>
                 <p className="font-bold text-slate-800 text-sm">Total Privacy</p>
                 <p className="text-slate-500 text-sm leading-relaxed mt-1">
                   Answers are private and no one sees them. Not even your partner.
                 </p>
               </div>
            </div>
            <div className="flex items-start gap-4">
               <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                  <Heart className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                 <p className="font-bold text-slate-800 text-sm">Results Only</p>
                 <p className="text-slate-500 text-sm leading-relaxed mt-1">
                   Only the compatibility percentage and category breakdown are visible.
                 </p>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setShowIntro(false)}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ SCREEN ---
  const q = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full relative">
        <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 uppercase tracking-wider">
          {userName}
        </div>
        
        <div className="w-full bg-slate-100 h-2 rounded-full mb-6 mt-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-4">
          {q.category}
        </span>
        
        <h2 className="text-xl font-bold text-slate-800 mb-8 min-h-[60px]">
          {q.text}
        </h2>

        <div className="space-y-3 mb-8">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              disabled={saving}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left px-5 py-4 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-700 font-medium active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
          {saving ? (
            <span className="flex items-center gap-2 text-indigo-600 font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Answers encrypted & hidden</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
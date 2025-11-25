"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Heart, ShieldCheck, Zap, Lock } from 'lucide-react'; 
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startTest = async () => {
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const docRef = await addDoc(collection(db, "tests"), {
        createdAt: serverTimestamp(),
        hostUserId: user.uid,
        status: 'waiting',
        questionsVersion: 'v1'
      });

      router.push(`/quiz/${docRef.id}`);

    } catch (error) {
      console.error("Error starting test:", error);
      alert("Error starting test. Check console.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50">
      
      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        
        {/* LOGO */}
        <div className="mb-8 transform scale-110">
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

        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
          Are you actually <br/>
          <span className="text-indigo-600">compatible?</span>
        </h1>
        
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Take the blind test. Your specific answers remain <strong>100% private</strong>. Only the compatibility results are revealed.
        </p>
        
        <button 
          onClick={startTest}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-3 mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Creating Test...
            </>
          ) : (
            <>
              <span>Start New Test</span>
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </>
          )}
        </button>

        {/* UPDATED: Trust Badge Style for "Answers Never Shown" */}
        <div className="flex items-center justify-center gap-2 bg-white border border-green-200 py-2 px-4 rounded-full shadow-sm">
          <ShieldCheck className="w-4 h-4 text-green-600" /> 
          <span className="text-xs font-bold text-green-800 uppercase tracking-widest">Answers Never Shown</span>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="bg-white px-6 py-12 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto">
          <h3 className="text-slate-900 font-bold text-lg mb-6 text-center">How it Works</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-indigo-700">1</div>
              <div>
                <h4 className="font-bold text-slate-900">Answer 15 Questions</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Honest answers about finances, intimacy, and values. We lock them in a private vault.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-indigo-700">2</div>
              <div>
                <h4 className="font-bold text-slate-900">Invite Your Partner</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Send a link. They answer blindly—they <strong>cannot</strong> see what you chose.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-indigo-700">3</div>
              <div>
                <h4 className="font-bold text-slate-900">Reveal Compatibility</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Once both are done, the score unlocks. Specific answers stay hidden forever.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
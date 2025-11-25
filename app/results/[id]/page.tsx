"use client";

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { QUESTIONS, Question } from '@/data/questions'; 
import { INSIGHTS } from '@/data/insights'; 
import { Loader2, Copy, AlertTriangle, Lock, Heart, Unlock, ShieldCheck, MessageCircle, Sparkles, Save, RefreshCw } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).catch((e) => console.error(e));

    const unsub = onSnapshot(doc(db, "tests", id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTestData(data);
        if (searchParams.get('success') === 'true' && !data.isPremium) {
           updateDoc(doc.ref, { isPremium: true });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id, searchParams]);

  const handleUnlock = async () => {
    setIsPaying(true);
    setTimeout(() => {
       window.location.href = `${window.location.origin}/results/${id}?success=true`;
    }, 1500);
  };

  const handleSaveAccount = () => {
    alert("In the full version, this opens a 'Create Account' modal.");
  };

  const calculateScore = () => {
    if (!testData?.answersA || !testData?.answersB) return null;

    let rawScore = 0;
    let maxPossibleScore = 0;
    let dealbreakerTriggered = false;
    const categories: any = {};

    QUESTIONS.forEach((q: Question) => {
      const ansA = testData.answersA[q.id];
      const ansB = testData.answersB[q.id];
      const weight = q.weight || 1.0; 
      const maxPoints = 10 * weight;
      
      if (!categories[q.category]) categories[q.category] = { totalPoints: 0, maxPoints: 0 };
      categories[q.category].maxPoints += maxPoints;
      maxPossibleScore += maxPoints;

      let questionScore = 0;

      if (q.logicType === 'exact') {
        if (ansA === ansB) questionScore = 10 * weight;
        else if (q.isDealBreaker) dealbreakerTriggered = true;
      } 
      else if (q.logicType === 'linear') {
        const dist = Math.abs(ansA - ansB);
        if (dist === 0) questionScore = 10;
        else if (dist === 1) questionScore = 7;
        else if (dist === 2) questionScore = 4;
        else questionScore = 0;

        if (q.isDealBreaker && dist > 1) dealbreakerTriggered = true;
        questionScore = questionScore * weight;
      }
      else if (q.logicType === 'matrix' && q.matrix) {
        const key = [ansA, ansB].sort().join('-');
        const baseScore = q.matrix[key] !== undefined ? q.matrix[key] : 5;
        questionScore = baseScore * weight;
      }

      rawScore += questionScore;
      categories[q.category].totalPoints += questionScore;
    });

    let percent = Math.max(0, Math.round((rawScore / maxPossibleScore) * 100));
    if (dealbreakerTriggered && percent > 60) percent = 60;

    return { percent, dealbreakerTriggered, categories };
  };

  const copyLink = () => {
    const url = `${window.location.origin}/quiz/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (!testData) return <div>Test not found</div>;

  // --- WAITING SCREEN ---
  if (!testData.answersA || !testData.answersB) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-indigo-50 space-y-8">
          <div className="flex flex-col items-center justify-center">
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
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">You're done!</h2>
            <p className="text-slate-600">Your answers are locked. Send this link to your partner.</p>
          </div>
          {testData.guestStarted && (
             <div className="bg-green-50 border border-green-200 px-6 py-4 rounded-xl flex items-center justify-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-green-800">Partner has started</span>
                    <span className="text-xs text-green-600">Results will appear here instantly</span>
                </div>
             </div>
          )}
          <div className="bg-slate-100 p-4 rounded-lg break-all text-sm text-indigo-600 font-medium border border-indigo-100">
            {window.location.origin}/quiz/{id}
          </div>
          <button onClick={copyLink} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2">
            {copied ? "Copied!" : "Copy Invite Link"} <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  const results = calculateScore();
  if (!results) return null;

  const isPremium = testData.isPremium === true; 
  
  let scoreColor = "text-red-500";
  let scoreBg = "bg-red-50";
  if (results.percent > 40) { scoreColor = "text-yellow-600"; scoreBg = "bg-yellow-50"; }
  if (results.percent > 75) { scoreColor = "text-green-600"; scoreBg = "bg-green-50"; }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        
        <div className="bg-slate-900 p-6 text-center text-white pb-8">
          <div className="flex flex-col items-center justify-center mb-1">
             <div className="relative flex items-center justify-center scale-90 origin-bottom">
                  <div className="bg-blue-100 text-slate-900 pl-6 pr-8 py-2 rounded-l-full rounded-r-lg relative z-10 flex items-center shadow-sm">
                      <span className="text-2xl font-black tracking-tight">Soul</span>
                  </div>
                  <div className="bg-slate-900 text-white pl-8 pr-6 py-2 rounded-r-full rounded-l-lg relative z-0 -ml-4 shadow-sm border border-slate-700 flex items-center">
                      <span className="text-2xl font-black tracking-tight">Sync</span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                       <div className="bg-white p-1 rounded-full shadow-sm">
                          <div className="bg-indigo-100 p-1 rounded-full">
                              <Heart className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                          </div>
                       </div>
                  </div>
              </div>
          </div>
          <p className="text-indigo-200 text-xs font-bold tracking-[0.2em] uppercase opacity-80 mt-2">Compatibility Report</p>
        </div>

        <div className="p-8 text-center border-b border-slate-100 bg-white relative z-20">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${scoreBg} ${scoreColor.replace('text', 'border')} mb-4`}>
            <span className={`text-4xl font-bold ${scoreColor}`}>{results.percent}%</span>
          </div>
          {results.dealbreakerTriggered && (
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm font-medium mt-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Core Value Mismatch Detected</span>
            </div>
          )}
        </div>
        
        <div className="relative p-6 bg-slate-50 min-h-[600px]">
           
           {/* --- PREMIUM INSIGHTS SECTION --- */}
           {isPremium && (
             <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-5 h-5 text-indigo-600" />
                   <h3 className="text-lg font-bold text-slate-800">Your Personalized Insights</h3>
                </div>
                
                {Object.keys(results.categories).map((cat) => {
                   const data = results.categories[cat];
                   const percent = (data.totalPoints / data.maxPoints) * 100;
                   
                   // @ts-ignore
                   const categoryInsights = INSIGHTS[cat] || INSIGHTS['Generic'];
                   let insight = categoryInsights.moderate;
                   let bgClass = "bg-white border-slate-200";
                   let badgeClass = "bg-yellow-50 text-yellow-700";
                   
                   if (percent >= 80) {
                      insight = categoryInsights.high;
                      bgClass = "bg-green-50 border-green-200";
                      badgeClass = "bg-green-100 text-green-800";
                   } else if (percent < 50) {
                      insight = categoryInsights.low;
                      bgClass = "bg-red-50 border-red-200"; 
                      badgeClass = "bg-red-100 text-red-800";
                   }

                   return (
                     <div key={cat} className={`p-5 rounded-xl border ${bgClass} shadow-sm`}>
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-slate-800">{cat} Analysis</h4>
                           <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass}`}>
                             {Math.round(percent)}% Match
                           </span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 mb-1">{insight.title}</h5>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{insight.text}</p>
                        
                        <div className="flex gap-3 items-start bg-white/60 p-3 rounded-lg">
                           <MessageCircle className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                           <div>
                              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">Ask Each Other</p>
                              <p className="text-sm text-slate-700 italic">"{insight.question}"</p>
                           </div>
                        </div>
                     </div>
                   );
                })}

                {/* --- SAVE ACCOUNT SECTION --- */}
                <div className="bg-slate-900 rounded-xl p-6 text-center mt-12">
                   <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Save className="w-5 h-5 text-indigo-400" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-2">Don't lose your results</h3>
                   <p className="text-slate-400 text-sm mb-6">
                     You are currently in Guest Mode. Create a free account to save this report forever.
                   </p>
                   <button 
                     onClick={handleSaveAccount}
                     className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                   >
                     Save Report to Profile
                   </button>
                </div>

             </div>
           )}

           {/* --- PAYWALL OVERLAY --- */}
           {!isPremium && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-6 p-4 text-center rounded-b-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% via-white/40 to-white z-0"></div>
                <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-indigo-100 max-w-sm w-full relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                         <Lock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 text-left leading-tight">Unlock Full Analysis</h3>
                   </div>
                   <p className="text-slate-600 text-sm text-left mb-4 leading-relaxed">
                     Get a deep dive into your <strong>Finances</strong>, <strong>Intimacy</strong>, and <strong>Values</strong>. See where you align and where you need to talk.
                   </p>
                   <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg py-2 px-3 mb-4">
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs font-bold text-green-700 text-left">Your specific answers stay hidden</span>
                   </div>
                   <button 
                     onClick={handleUnlock}
                     disabled={isPaying}
                     className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mb-3"
                   >
                     {isPaying ? <Loader2 className="animate-spin w-4 h-4"/> : <Unlock className="w-4 h-4" />}
                     Unlock for $1.99
                   </button>
                   
                   {/* UPDATED BUTTON STYLE FOR 'START NEW TEST' */}
                   <button 
                     onClick={() => router.push('/')}
                     className="w-full bg-white border border-slate-200 text-slate-500 font-bold py-3 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                   >
                     <RefreshCw className="w-4 h-4" />
                     No thanks, start a new test
                   </button>
                </div>
             </div>
           )}

           {/* --- HEATMAP BARS --- */}
           {!isPremium && <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Category Heatmap</h3>}
           
           <div className={`space-y-4 ${!isPremium ? 'filter blur-[6px] select-none pointer-events-none' : 'hidden'}`}>
             {Object.keys(results.categories).map((cat) => {
               const data = results.categories[cat];
               const matchPercent = (data.totalPoints / data.maxPoints) * 100;
               let colorClass = "bg-red-500";
               if (matchPercent >= 50) colorClass = "bg-yellow-400";
               if (matchPercent >= 80) colorClass = "bg-green-500";

               return (
                 <div key={cat} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                   <span className="font-medium text-slate-700">{cat}</span>
                   <div className="flex gap-1">
                     <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${matchPercent}%` }}></div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>

           {isPremium && (
             <div className="mt-8 pt-4 border-t border-slate-200 relative z-20">
                <button onClick={() => router.push('/')} className="w-full py-3 text-slate-500 font-medium text-sm hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Start a new test
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
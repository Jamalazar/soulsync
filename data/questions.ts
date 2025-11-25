export type Question = {
  id: number;
  text: string;
  category: string;
  options: string[];
  logicType: 'exact' | 'linear' | 'matrix';
  weight?: number; // Defaults to 1.0 if missing
  isDealBreaker?: boolean;
  matrix?: Record<string, number>; // For 'matrix' type only
};

export const QUESTIONS: Question[] = [
  // --- FINANCES ---
  {
    id: 1,
    text: "If we get a $5,000 bonus, what is your instinct?",
    category: "Finances",
    options: ["Invest/Save 100% (Strict Saver)", "Pay off practical needs (Balanced)", "Spend it on a trip/luxury (Spender)"],
    logicType: 'matrix',
    matrix: {
      "0-0": 10, // Saver+Saver
      "0-1": 7,  // Saver+Balanced
      "0-2": 2,  // Saver+Spender (Friction)
      "1-1": 10, // Balanced+Balanced
      "1-2": 5,  // Balanced+Spender
      "2-2": 0   // Spender+Spender (Dangerous)
    }
  },
  {
    id: 2,
    text: "How do you view debt (credit cards, loans)?",
    category: "Finances",
    options: ["Avoid at all costs (High Anxiety)", "Necessary tool for growth (Neutral)", "Don't worry about it (Low Anxiety)"],
    logicType: 'linear'
  },
  {
    id: 3,
    text: "How should married couples handle money?",
    category: "Finances",
    options: ["100% Joint (One Pot)", "Hybrid (Joint Bills + Separate Fun)", "100% Separate"],
    logicType: 'linear'
  },

  // --- INTIMACY ---
  {
    id: 4,
    text: "In an ideal world, how often are we intimate?",
    category: "Intimacy",
    options: ["Every day", "3-4 times a week", "Once a week", "1-2 times a month"],
    logicType: 'linear'
  },
  {
    id: 5,
    text: "Who should initiate sex?",
    category: "Intimacy",
    options: ["I prefer to initiate (Hunter)", "I prefer partner to initiate (Prize)", "50/50 Split"],
    logicType: 'matrix',
    matrix: {
      "0-0": 8,  // Hunter+Hunter
      "0-1": 10, // Hunter+Prize (Perfect)
      "0-2": 10, // Hunter+50/50
      "1-1": 0,  // Prize+Prize (Dead bedroom)
      "1-2": 5,  // Prize+50/50
      "2-2": 10  // 50/50+50/50
    }
  },
  {
    id: 6,
    text: "How comfortable are you with PDA?",
    category: "Intimacy",
    options: ["Love it / Show the world", "Small gestures only (Holding hands)", "Private only"],
    logicType: 'linear'
  },

  // --- VALUES ---
  {
    id: 7,
    text: "Do you want children?",
    category: "Values",
    options: ["Yes, definitely", "Open to it / Unsure", "No, definitely not"],
    logicType: 'linear',
    isDealBreaker: true // Trigger if distance > 1
  },
  {
    id: 8,
    text: "How important is shared faith/spirituality?",
    category: "Values",
    options: ["Very Important", "Somewhat Important", "Not Important"],
    logicType: 'linear'
  },
  {
    id: 9,
    text: "If your family dislikes your partner, what do you do?",
    category: "Values",
    options: ["Defend Partner (Partner First)", "Stay Neutral / Keep Peace", "Side with Family (Family First)"],
    logicType: 'linear'
  },

  // --- LIFESTYLE ---
  {
    id: 10,
    text: "How tidy is your ideal home?",
    category: "Lifestyle",
    options: ["Spotless / Showroom", "Tidy but lived in", "Cluttered / Messy"],
    logicType: 'linear'
  },
  {
    id: 11,
    text: "It's Saturday night. What do we do?",
    category: "Lifestyle",
    options: ["Big Party / Club (Extrovert)", "Dinner with small group (Ambivert)", "Movie on couch (Introvert)"],
    logicType: 'matrix',
    matrix: {
      "0-0": 10, // Extrovert+Extrovert
      "0-1": 8,
      "0-2": 7,  // Extrovert+Introvert (Balance)
      "1-1": 10,
      "1-2": 8,
      "2-2": 10  // Introvert+Introvert
    }
  },
  {
    id: 12,
    text: "How important is healthy eating/fitness?",
    category: "Lifestyle",
    options: ["Strict / Lifestyle (Gym rat)", "Moderate (Try to be healthy)", "Relaxed (Eat whatever)"],
    logicType: 'linear'
  },

  // --- COMMUNICATION ---
  {
    id: 13,
    text: "When we fight, I usually...",
    category: "Communication",
    options: ["Pursue (Need to solve it NOW)", "Withdraw (Need space to cool down)"],
    logicType: 'matrix',
    matrix: {
      "0-0": 6, // Pursue+Pursue (Explosive)
      "0-1": 4, // Pursue+Withdraw (The Trap - Hardest dynamic)
      "1-1": 5  // Withdraw+Withdraw (Unresolved)
    }
  },
  {
    id: 14,
    text: "Do we share phone passcodes?",
    category: "Communication",
    options: ["Yes, open book", "No, privacy matters"],
    logicType: 'exact',
    isDealBreaker: true
  },
  {
    id: 15,
    text: "What matters most in an apology?",
    category: "Communication",
    options: ["Saying 'I'm sorry' (Words)", "Changing behavior (Action)", "Physical touch / Reconnection"],
    logicType: 'exact'
  }
];
import { useState, useEffect } from 'react';

const EMOJIS = [
  { id: 'fire', icon: '🔥', label: 'Fire' },
  { id: 'mindblown', icon: '🤯', label: 'Mindblown' },
  { id: 'rocket', icon: '🚀', label: 'Rocket' },
  { id: 'heart', icon: '❤️', label: 'Love' }
];

const EmojiReactions = ({ postId }) => {
  const [reactions, setReactions] = useState({ fire: 142, mindblown: 56, rocket: 89, heart: 210 });
  const [userReaction, setUserReaction] = useState(null);

  // Load from local storage just to mock persistence for the user
  useEffect(() => {
    const saved = localStorage.getItem(`reaction_${postId}`);
    if (saved) {
      setUserReaction(saved);
      // Increment local count to show their reaction
      setReactions(prev => ({ ...prev, [saved]: prev[saved] + 1 }));
    }
  }, [postId]);

  const handleReact = (emojiId) => {
    if (userReaction === emojiId) {
      // Remove reaction
      setUserReaction(null);
      setReactions(prev => ({ ...prev, [emojiId]: prev[emojiId] - 1 }));
      localStorage.removeItem(`reaction_${postId}`);
    } else {
      // Change or add reaction
      setReactions(prev => {
        const next = { ...prev, [emojiId]: prev[emojiId] + 1 };
        if (userReaction) {
          next[userReaction] = next[userReaction] - 1;
        }
        return next;
      });
      setUserReaction(emojiId);
      localStorage.setItem(`reaction_${postId}`, emojiId);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
      <span className="text-sm font-bold text-slate-500 mr-2">React to this app:</span>
      {EMOJIS.map(emoji => (
        <button
          key={emoji.id}
          onClick={() => handleReact(emoji.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            userReaction === emoji.id 
              ? 'bg-primary/20 border-primary text-primary scale-110 shadow-lg shadow-primary/20' 
              : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10'
          } border font-bold text-sm`}
        >
          <span className="text-lg">{emoji.icon}</span>
          <span>{reactions[emoji.id]}</span>
        </button>
      ))}
    </div>
  );
};

export default EmojiReactions;

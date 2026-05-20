import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatbotPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState({ calories: 2000, protein: 75, fats: 70, carbs: 250 });
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const res = await api.requestChatDaily(goals);
      setReply(res.reply || 'No reply');
    } catch (err) {
      setReply(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Assistant</h1>
        <p>Get a quick analysis of today's progress against your goals.</p>
      </section>

      <section className="panel split-panel">
        <div>
          <label>
            Calories goal
            <input type="number" value={goals.calories} onChange={(e) => setGoals({...goals, calories: Number(e.target.value)})} />
          </label>
          <label>
            Protein (g)
            <input type="number" value={goals.protein} onChange={(e) => setGoals({...goals, protein: Number(e.target.value)})} />
          </label>
          <label>
            Fats (g)
            <input type="number" value={goals.fats} onChange={(e) => setGoals({...goals, fats: Number(e.target.value)})} />
          </label>
          <label>
            Carbs (g)
            <input type="number" value={goals.carbs} onChange={(e) => setGoals({...goals, carbs: Number(e.target.value)})} />
          </label>
          <div style={{ marginTop: 12 }}>
            <button className="button button-primary" onClick={handleAsk} disabled={loading}>{loading ? 'Thinking...' : 'Analyze today'}</button>
          </div>
        </div>
        <div>
          <h3>Assistant reply</h3>
          <div className="chat-box">
            {reply ? <p>{reply}</p> : <p className="empty-state">No analysis yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatbotPage;

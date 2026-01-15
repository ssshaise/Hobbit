import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Zap, Trash2, X, User, Target, BarChart2, Plus, Terminal, Bot, Activity } from 'lucide-react';

import TitleBar from './components/TitleBar';

const API_URL = "http://localhost:8000";

const TargetLogo = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-gray-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

const CompanionPanel = ({ completionRate = 0, weeklyProgress = 0, weeklyCount = 0, weeklyTarget = 15 }) => {
  const getMood = () => {
    if (completionRate >= 80) return { color: "text-green-400", border: "border-green-500", shadow: "shadow-green-500/50", msg: "OPTIMAL EFFICIENCY", sub: "System running at peak performance." };
    if (completionRate >= 50) return { color: "text-cyan-400", border: "border-cyan-500", shadow: "shadow-cyan-500/50", msg: "SYSTEMS NOMINAL", sub: "Protocol execution within acceptable parameters." };
    return { color: "text-yellow-400", border: "border-yellow-500", shadow: "shadow-yellow-500/50", msg: "CALIBRATION NEEDED", sub: "Productivity levels dropping. Engage focus." };
  };

  const mood = getMood();

  return (
    <GlassCard className="h-full p-6 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:30px_30px] [background-position:center] opacity-20 pointer-events-none" />
      
      <div className="w-full flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <span className="text-xs font-mono text-gray-500 tracking-widest">AI_CORE_V2</span>
        <Activity size={14} className={`${mood.color} animate-pulse`} />
      </div>

      <div className="relative mb-8">
        <div className={`w-32 h-32 rounded-full border-2 border-dashed ${mood.border} flex items-center justify-center animate-[spin_10s_linear_infinite] opacity-30`} />
        <div className={`absolute top-0 left-0 w-32 h-32 rounded-full border border-white/10 flex items-center justify-center animate-[spin_5s_linear_infinite_reverse]`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-full border ${mood.border} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10`}>
             <Bot size={32} className={`${mood.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${mood.shadow} animate-ping opacity-20`} />
      </div>

      <h3 className={`text-xl font-bold font-mono mb-2 ${mood.color} tracking-tight`}>{mood.msg}</h3>
      <p className="text-gray-400 text-sm font-mono leading-relaxed mb-8">"{mood.sub}"</p>

      <div className="w-full mt-auto space-y-3">
        <div className="flex justify-between text-xs text-gray-500 font-mono uppercase">
            <span>Daily Logic</span>
            <span>{Math.round(completionRate)}%</span>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} className={`h-full ${mood.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
        </div>
      </div>
    </GlassCard>
  );
};

const AddHabitModal = ({ isOpen, onClose, onAdd }) => {
  const [text, setText] = useState("");
  if (!isOpen) return null;
  return (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm font-mono"><GlassCard className="p-8 rounded-2xl w-[500px] relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" /><button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button><h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3"><Terminal className="text-cyan-400" size={24}/> New Task</h2><input autoFocus type="text" placeholder="e.g. 100 Pushups" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && text) { onAdd(text); setText(""); } }} className="w-full bg-black/50 border border-white/10 text-white p-4 rounded-lg focus:border-cyan-500/50 outline-none mb-6"/><div className="flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white">CANCEL</button><button onClick={() => { if (text) { onAdd(text); setText(""); } }} className="px-6 py-2 rounded-lg bg-cyan-900/50 text-cyan-100 border border-cyan-500/30 flex items-center gap-2"><Plus size={16} /> INITIALIZE</button></div></GlassCard></div>);
};
const ProfileModal = ({ isOpen, onClose, currentGoal, onUpdateGoal, userSettings, onUpdateSettings }) => {
    const [stats, setStats] = useState([]); const [phone, setPhone] = useState(userSettings?.phone_number || ""); const [goalInput, setGoalInput] = useState(currentGoal?.target_count || 15); const [loading, setLoading] = useState(true);
    useEffect(() => { if (isOpen) { fetchStats(); setPhone(userSettings?.phone_number || ""); setGoalInput(currentGoal?.target_count || 15); } }, [isOpen]);
    const fetchStats = async () => { try { const today = new Date(); const res = await axios.get(`${API_URL}/stats/month_breakdown?year=${today.getFullYear()}&month=${today.getMonth() + 1}`); setStats(res.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
    const saveSettings = () => { onUpdateSettings({ phone_number: phone, reminders_enabled: true }); onUpdateGoal(goalInput); onClose(); };
    if (!isOpen) return null; const hasData = stats.some(day => day.count > 0); const maxVal = hasData ? Math.max(...stats.map(s => s.count), 1) : 1; 
    return (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm font-sans"><GlassCard className="p-8 rounded-2xl w-[800px] h-[85vh] overflow-y-auto relative"><button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={28} /></button><h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><User className="text-cyan-400" size={32}/> Operator Profile</h2><div className="mb-10 bg-black/30 p-6 rounded-xl border border-white/5"><h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-200"><Target className="text-yellow-400"/> Weekly Targets</h3><div className="flex items-center gap-4"><input type="number" value={goalInput} onChange={(e) => setGoalInput(parseInt(e.target.value))} className="bg-black/50 border border-white/10 p-3 rounded text-white text-xl w-32 text-center outline-none"/><span className="text-gray-500">tasks / week</span></div></div><div className="mb-10"><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-200"><BarChart2 className="text-cyan-400"/> System Analytics</h3><div className="h-64 border border-white/5 rounded-xl bg-black/20 relative flex items-center justify-center overflow-hidden">{!hasData && !loading ? (<p className="text-gray-500 font-mono">NO_DATA_FOUND</p>) : (<div className="w-full h-full flex items-end gap-1 px-4 pb-2">{stats.map((s) => (<div key={s.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end"><div className="w-full bg-cyan-500/20 rounded-sm" style={{ height: `${(s.count / maxVal) * 80}%` }} /></div>))}</div>)}</div></div><button onClick={saveSettings} className="w-full py-4 bg-green-600/20 text-green-400 border border-green-500/50 rounded-lg font-bold">Save Configuration</button></GlassCard></div>);
};
const InteractionModal = ({ isOpen, step, initialText, onCloseModal, onConfirmCheck, onSaveNote }) => {
    const [noteText, setNoteText] = useState(""); useEffect(() => { if (isOpen) setNoteText(initialText || ""); }, [isOpen, initialText]); if (!isOpen) return null;
    return (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"><GlassCard className="p-8 rounded-2xl w-[600px] relative"><button onClick={onCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>{step === 'ask' && (<><h3 className="text-xl font-bold mb-4 text-white">Add Log Entry?</h3><div className="flex gap-3"><button onClick={onConfirmCheck} className="flex-1 py-3 rounded-lg bg-white/5 text-gray-300">No, Mark Complete</button><button onClick={onSaveNote} className="flex-1 py-3 rounded-lg bg-purple-600/80 text-white">Yes, Add Entry</button></div></>)}{step === 'write' && (<><h3 className="text-2xl font-bold mb-2 text-white font-mono">System Log</h3><textarea autoFocus className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-gray-300 mb-6 outline-none font-mono" rows={8} value={noteText} onChange={(e) => setNoteText(e.target.value)}/><div className="flex gap-3"><button onClick={() => setNoteText("")} className="px-6 py-3 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={20} /></button><button onClick={() => onSaveNote(noteText)} className="flex-1 py-3 rounded-lg bg-green-600/80 text-white font-bold">Save Entry</button></div></>)}</GlassCard></div>);
};

export default function App() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState({ target_count: 15 });
  const [userSettings, setUserSettings] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('ask'); 
  const [activeCell, setActiveCell] = useState(null); 
  const [currentNote, setCurrentNote] = useState(""); 
  
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInView = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  useEffect(() => { fetchData(); }, [currentDate]);

  const fetchData = async () => {
    try {
      const hResponse = await axios.get(`${API_URL}/habits`);
      setHabits(hResponse.data);
      const startStr = format(startOfCurrentWeek, 'yyyy-MM-dd');
      const endStr = format(endOfCurrentWeek, 'yyyy-MM-dd');
      const lResponse = await axios.get(`${API_URL}/logs?start=${startStr}&end=${endStr}`);
      setLogs(lResponse.data);
      const gResponse = await axios.get(`${API_URL}/goal/${startStr}`);
      setWeeklyGoal(gResponse.data);
      const sResponse = await axios.get(`${API_URL}/user/settings`);
      setUserSettings(sResponse.data);
    } catch (error) { console.error(error); }
  };

  const handleUpdateGoal = async (newTarget) => { const startStr = format(startOfCurrentWeek, 'yyyy-MM-dd'); await axios.post(`${API_URL}/goal`, { week_start: startStr, target_count: newTarget }); fetchData(); };
  const handleUpdateSettings = async (newSettings) => { await axios.post(`${API_URL}/user/settings`, newSettings); setUserSettings(newSettings); };
  const handleAddHabit = async (name) => { if (name) { await axios.post(`${API_URL}/habits`, { name }); setAddHabitOpen(false); fetchData(); } };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
        setHabits(habits.filter(h => h.id !== id));
        await axios.delete(`${API_URL}/habits/${id}`); 
        fetchData();
    } catch (error) {
        try { await axios.delete(`${API_URL}/habits?habit_id=${id}`); } catch(e) { console.error(e); }
        console.error("Delete failed", error);
    }
  };

  const executeLongPress = (habitId, dateObj) => { if (isCompleted(habitId, dateObj)) { if (navigator.vibrate) navigator.vibrate(50); submitToggle(habitId, dateObj, "", true); } };
  const executeTap = (habitId, dateObj) => {
    const formattedDate = format(dateObj, 'yyyy-MM-dd');
    const existingLog = logs.find(l => l.habit_id === habitId && l.date_logged === formattedDate);
    const isDone = existingLog ? existingLog.status : false;
    const note = existingLog ? existingLog.note : "";
    setActiveCell({ habitId, dateObj });
    if (isDone) { setCurrentNote(note || ""); setModalStep('write'); setModalOpen(true); } else { setCurrentNote(""); setModalStep('ask'); setModalOpen(true); }
  };
  const submitToggle = async (habitId, dateObj, note, shouldDelete = false) => {
    const formattedDate = format(dateObj, 'yyyy-MM-dd');
    let newLogs = [...logs];
    const existingLog = logs.find(l => l.habit_id === habitId && l.date_logged === formattedDate);
    if (shouldDelete) { if (existingLog) newLogs = newLogs.map(l => l === existingLog ? {...l, status: false} : l); } 
    else { if (existingLog) newLogs = newLogs.map(l => l === existingLog ? {...l, status: true, note: note} : l); else newLogs.push({ habit_id: habitId, date_logged: formattedDate, status: true, note: note }); }
    setLogs(newLogs);
    let url = `${API_URL}/toggle?habit_id=${habitId}&day=${formattedDate}`;
    if (note !== null) url += `&note=${encodeURIComponent(note)}`;
    await axios.post(url);
  };
  const isCompleted = (habitId, dateObj) => { const formattedDate = format(dateObj, 'yyyy-MM-dd'); const log = logs.find(l => l.habit_id === habitId && l.date_logged === formattedDate); return log ? log.status : false; };
  const hasNote = (habitId, dateObj) => { const formattedDate = format(dateObj, 'yyyy-MM-dd'); const log = logs.find(l => l.habit_id === habitId && l.date_logged === formattedDate); return log && log.note && log.note.length > 0; };

  // METRICS
  const tasksCompletedThisWeek = logs.filter(l => l.status).length;
  const totalTasksToday = habits.length;
  const tasksCompletedToday = habits.filter(h => isCompleted(h.id, new Date())).length;
  const dailyCompletionRate = totalTasksToday > 0 ? (tasksCompletedToday / totalTasksToday) * 100 : 0;
  const weeklyCompletionRate = Math.min((tasksCompletedThisWeek / (weeklyGoal?.target_count || 1)) * 100, 100);

  return (
    <div className="w-full h-screen bg-[#0d1117] text-gray-300 font-sans relative selection:bg-cyan-900/30 overflow-hidden flex flex-col">
      
      <TitleBar />

      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} currentGoal={weeklyGoal} onUpdateGoal={handleUpdateGoal} userSettings={userSettings} onUpdateSettings={handleUpdateSettings}/>
      <InteractionModal isOpen={modalOpen} step={modalStep} initialText={currentNote} onCloseModal={() => setModalOpen(false)} onConfirmCheck={() => { submitToggle(activeCell.habitId, activeCell.dateObj, ""); setModalOpen(false); }} onSaveNote={(text) => { if (modalStep === 'ask') setModalStep('write'); else { submitToggle(activeCell.habitId, activeCell.dateObj, text); setModalOpen(false); }}}/>
      <AddHabitModal isOpen={addHabitOpen} onClose={() => setAddHabitOpen(false)} onAdd={handleAddHabit}/>

      <div className="pt-20 w-full h-full flex flex-col p-8">
        
        <header className="w-full flex justify-between items-center mb-8 relative z-10 shrink-0">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-white tracking-tight">
              <Zap className="text-yellow-400 fill-yellow-400" size={28}/> HOBBIT <span className="text-xs bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded ml-2 border border-white/5">v2.0</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">System Status: Operational</p>
          </div>

          <div className="flex gap-4 items-center">
            
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/60 border border-purple-500/30 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md group hover:border-purple-500/60 transition-colors cursor-default">
                <TargetLogo />
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Weekly Protocol</span>
                    <span className="text-sm font-bold text-gray-200 font-mono">
                        {tasksCompletedThisWeek} / {weeklyGoal?.target_count || 15}
                    </span>
                </div>
            </div>

            <button onClick={() => setProfileOpen(true)} className="bg-gray-900/40 backdrop-blur-xl border border-purple-500/30 p-3 rounded-full hover:bg-purple-500/10 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] group">
                <User size={20} className="text-purple-400 group-hover:text-purple-200 transition-colors"/>
            </button>
          </div>
        </header>

        <GlassCard className="w-full flex justify-between items-center mb-4 p-4 rounded-xl relative z-10 shrink-0">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="hover:bg-white/5 p-2 rounded transition-colors text-gray-400 hover:text-white"><ChevronLeft /></button>
          <div className="text-center"><h2 className="text-lg font-bold text-white tracking-wide">{format(startOfCurrentWeek, 'MMM d')} - {format(endOfCurrentWeek, 'MMM d')}</h2></div>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="hover:bg-white/5 p-2 rounded transition-colors text-gray-400 hover:text-white"><ChevronRight /></button>
        </GlassCard>

        <div className="w-full grid grid-cols-[1fr_320px] gap-6 relative z-0 flex-1 overflow-hidden">
          
          <div className="overflow-auto pb-4 scrollbar-hide pr-2">
              <div className="min-w-max">
              <div className="flex mb-2">
                  <div className="w-48 flex-shrink-0 font-bold px-4 pt-4 text-left text-gray-500 uppercase text-xs tracking-widest font-mono">Tasks</div>
                  {daysInView.map((day) => (
                  <div key={day.toString()} className={`w-24 text-center flex flex-col items-center justify-center py-2 rounded ${isSameDay(day, new Date()) ? 'bg-cyan-500/10 border-b-2 border-cyan-500' : ''}`}>
                      <span className="text-xs text-gray-500 uppercase font-bold font-mono">{format(day, 'EEE')}</span>
                      <span className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-cyan-400' : 'text-gray-400'}`}>{format(day, 'd')}</span>
                  </div>
                  ))}
              </div>

              <AnimatePresence mode='wait'>
                  <motion.div key={format(startOfCurrentWeek, 'yyyy-MM-dd')} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-2">
                      {habits.map((habit) => (
                      <div key={habit.id} className="flex items-center p-1 group hover:bg-white/[0.02] rounded-lg transition-colors">
                          
                          <GlassCard className="w-48 flex-shrink-0 px-4 py-3 rounded-lg mr-2 flex flex-col justify-between gap-2 group-hover:border-white/20 transition-colors relative group/card">
                              <span className="font-medium text-gray-300">{habit.name}</span>
                              <button 
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  className="flex items-center gap-1 text-[10px] text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity hover:text-red-300 uppercase tracking-wider font-mono cursor-pointer"
                              >
                                  <Trash2 size={10} /> Delete
                              </button>
                          </GlassCard>

                          {daysInView.map((day) => {
                          const active = isCompleted(habit.id, day);
                          const noteExists = hasNote(habit.id, day);
                          return (
                              <div key={day.toString()} className="w-24 flex justify-center">
                              <motion.button
                                  onTapStart={() => { isLongPressRef.current = false; timerRef.current = setTimeout(() => { isLongPressRef.current = true; executeLongPress(habit.id, day); }, 600); }}
                                  onTap={() => { clearTimeout(timerRef.current); if (!isLongPressRef.current) executeTap(habit.id, day); }}
                                  onTapCancel={() => clearTimeout(timerRef.current)}
                                  whileTap={{ scale: 0.9 }}
                                  className={`w-12 h-12 border-2 rounded-xl transition-all duration-300 flex items-center justify-center relative select-none ${active ? 'bg-purple-600 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                              >
                                  {active && <Zap size={20} className="text-white fill-white pointer-events-none drop-shadow-md" />}
                                  {noteExists && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full pointer-events-none shadow-[0_0_8px_yellow]"></div>}
                              </motion.button>
                              </div>
                          );
                          })}
                      </div>
                      ))}
                  </motion.div>
              </AnimatePresence>
              
              <button onClick={() => setAddHabitOpen(true)} className="mt-6 px-6 py-4 bg-gray-900/40 border border-dashed border-gray-700 text-gray-500 font-bold rounded-xl w-full hover:bg-white/5 hover:text-white hover:border-gray-500 transition-all font-mono tracking-wide flex items-center justify-center gap-2 group backdrop-blur-sm">
                  <Plus size={18} className="group-hover:text-cyan-400 transition-colors"/> ADD NEW TASK
              </button>
              </div>
          </div>

          <div className="h-full min-w-[320px]">
              <CompanionPanel 
                completionRate={dailyCompletionRate} 
                weeklyProgress={weeklyCompletionRate}
                weeklyCount={tasksCompletedThisWeek}
                weeklyTarget={weeklyGoal?.target_count || 15}
              />
          </div>

        </div>
      </div>
    </div>
  );
}
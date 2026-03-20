import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfToday, eachDayOfInterval, subDays, isSameDay, parseISO } from 'date-fns';
import { Plus, Check, X, Trash2, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, Completion, HabitWithStatus } from './types';
import { cn } from './lib/utils';

const COLORS = [
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-orange-500',
];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [completions, setCompletions] = useState<Completion[]>(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      createdAt: Date.now(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
    setCompletions(completions.filter((c) => c.habitId !== id));
  };

  const toggleCompletion = (habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingIndex = completions.findIndex(
      (c) => c.habitId === habitId && c.date === dateStr
    );

    if (existingIndex > -1) {
      const newCompletions = [...completions];
      newCompletions.splice(existingIndex, 1);
      setCompletions(newCompletions);
    } else {
      setCompletions([...completions, { habitId, date: dateStr }]);
    }
  };

  const currentHabitsWithStatus = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return habits.map((habit) => ({
      ...habit,
      completed: completions.some((c) => c.habitId === habit.id && c.date === dateStr),
    }));
  }, [habits, completions, selectedDate]);

  const progress = useMemo(() => {
    if (habits.length === 0) return 0;
    const completedCount = currentHabitsWithStatus.filter((h) => h.completed).length;
    return Math.round((completedCount / habits.length) * 100);
  }, [currentHabitsWithStatus, habits.length]);

  const last7Days = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(startOfToday(), 6),
      end: startOfToday(),
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold tracking-tight">HabitFlow</h1>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
              <TrendingUp size={16} />
              <span>{progress}% Today</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">{format(selectedDate, 'EEEE, MMMM do')}</p>
        </header>

        {/* Date Selector */}
        <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-2xl shadow-sm border border-zinc-100">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {last7Days.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, startOfToday());
              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center min-w-[56px] py-3 rounded-xl transition-all",
                    isSelected ? "bg-[#1A1A1A] text-white shadow-lg scale-105" : "hover:bg-zinc-50 text-zinc-400"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, 'd')}
                  </span>
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setSelectedDate(startOfToday())}
            disabled={isSameDay(selectedDate, startOfToday())}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Add Habit */}
        <form onSubmit={addHabit} className="relative mb-10 group">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Build a new habit..."
            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-md"
          >
            <Plus size={24} />
          </button>
        </form>

        {/* Habits List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Your Habits</h2>
            <span className="text-xs font-medium text-zinc-400">{habits.length} total</span>
          </div>
          
          <AnimatePresence mode="popLayout">
            {currentHabitsWithStatus.length > 0 ? (
              currentHabitsWithStatus.map((habit) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-300",
                    habit.completed ? "border-emerald-100 bg-emerald-50/30" : "border-zinc-100 hover:border-zinc-200 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleCompletion(habit.id)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                        habit.completed 
                          ? cn(habit.color, "text-white scale-110 shadow-lg shadow-emerald-500/20") 
                          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      )}
                    >
                      {habit.completed ? <Check size={24} strokeWidth={3} /> : <Plus size={20} />}
                    </button>
                    <div>
                      <h3 className={cn(
                        "font-semibold transition-all duration-300",
                        habit.completed ? "text-zinc-400 line-through" : "text-[#1A1A1A]"
                      )}>
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={cn("w-2 h-2 rounded-full", habit.color)} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Daily</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-zinc-300" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">No habits yet</h3>
                <p className="text-zinc-500 max-w-[200px] mx-auto mt-1">Start your journey by adding your first habit above.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Overview */}
        {habits.length > 0 && (
          <div className="mt-16 pt-12 border-t border-zinc-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Weekly Consistency</h2>
            <div className="grid grid-cols-7 gap-3">
              {last7Days.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayCompletions = completions.filter(c => c.date === dateStr).length;
                const dayProgress = habits.length > 0 ? (dayCompletions / habits.length) : 0;
                
                return (
                  <div key={date.toString()} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square bg-zinc-100 rounded-lg relative overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${dayProgress * 100}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 transition-all duration-1000"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{format(date, 'EEE')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

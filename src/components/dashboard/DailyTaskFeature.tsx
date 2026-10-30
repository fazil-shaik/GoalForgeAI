"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import { Task, TaskPriority } from "@/types/goal";
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Flame,
  Check,
  X,
  FileText,
  Timer,
  ArrowUpRight,
  Trophy,
  Medal,
  Target,
} from "lucide-react";

export function DailyTaskFeature({
  onNavigateToRecovery,
  onNavigateToBuilder,
}: {
  onNavigateToRecovery?: () => void;
  onNavigateToBuilder?: () => void;
}) {
  const { user } = useAuth();
  const {
    activeGoal,
    milestones,
    tasks,
    completeTask,
    completeGoal,
    skipTask,
    rescheduleTask,
    addTask,
    deleteTask,
  } = useGoal();

  const [filterView, setFilterView] = useState<"today" | "all" | "completed">("today");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Quick Add State
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState(30);
  const [newPriority, setNewPriority] = useState<TaskPriority>("high");
  const [newDueDate, setNewDueDate] = useState(todayDate);
  const [newCriteria, setNewCriteria] = useState("");

  // Task Action Modals
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(tomorrowDate);
  const [skippingTask, setSkippingTask] = useState<Task | null>(null);
  const [skipReason, setSkipReason] = useState("");

  // Focus Timer State (PRD F-23 Focus mode & task timer)
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Auto complete or alert
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const startFocusTimer = (task: Task) => {
    setActiveTimerTask(task);
    setTimerSecondsLeft(task.estimatedMinutes * 60);
    setIsTimerRunning(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filter tasks for the active goal
  const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
  const overdueTasks = goalTasks.filter((t) => t.status === "todo" && t.dueDate < todayDate);
  const todayTasks = goalTasks.filter((t) => t.dueDate === todayDate && t.status === "todo");
  const upcomingTasks = goalTasks.filter((t) => t.dueDate > todayDate && t.status === "todo");
  const completedTasks = goalTasks.filter((t) => t.status === "completed" || t.status === "skipped");

  const totalPlannedToday = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const userDailyCapacity = user?.preferences?.availableMinutesPerDay || 45;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      milestoneId: milestones[0]?.id || "ms_default",
      title: newTitle.trim(),
      description: "Quick task added directly from execution hub",
      estimatedMinutes: newMinutes,
      dueDate: newDueDate,
      priority: newPriority,
      status: "todo",
      completionCriteria: newCriteria.trim() || "Complete action item verification",
    });

    setNewTitle("");
    setNewCriteria("");
    setShowQuickAdd(false);
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingTask) return;
    rescheduleTask(reschedulingTask.id, rescheduleDate);
    setReschedulingTask(null);
  };

  const handleConfirmSkip = () => {
    if (!skippingTask) return;
    skipTask(skippingTask.id, skipReason || "Priorities shifted");
    setSkippingTask(null);
    setSkipReason("");
  };

  if (!activeGoal) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16 px-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md max-w-2xl mx-auto my-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-indigo-600/10 to-emerald-400/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/10">
            <Target className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">No Active Goal Selected</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Your daily execution hub needs an active goal to generate daily sprints and milestones. Synthesize a capacity-paced milestone roadmap with Gemini AI to get started.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {onNavigateToBuilder && (
              <button
                type="button"
                onClick={onNavigateToBuilder}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Forge New Goal with AI
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Active Focus Sprint Timer (PRD F-23) */}
      {activeTimerTask && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/60 p-4 rounded-2xl border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Focus Sprint Active
                </span>
                <span className="text-xs text-slate-400">• {activeTimerTask.title}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white tracking-wider">
                {formatTimer(timerSecondsLeft)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTimerRunning ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => {
                completeTask(activeTimerTask.id, Math.round((activeTimerTask.estimatedMinutes * 60 - timerSecondsLeft) / 60));
                setActiveTimerTask(null);
                setIsTimerRunning(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Done & Log
            </button>
            <button
              onClick={() => {
                setActiveTimerTask(null);
                setIsTimerRunning(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Daily Capacity Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Daily Tasks & Execution Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Focus strictly on today&apos;s actionable priorities. Every completion moves your measurable outcome forward.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeGoal && activeGoal.status !== "completed" && (
            <button
              type="button"
              onClick={() => completeGoal(activeGoal.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm"
              title="Finalize this goal and evaluate Hard Goal Medals"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Complete Goal
            </button>
          )}

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" /> Quick Add Task
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner with 1-Click Recovery (PRD F-13) */}
      {overdueTasks.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                {overdueTasks.length} task(s) slipped past their due date
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Life happened! Don&apos;t worry or burn out trying to rush everything today. Use Goal Recovery Mode to redistribute tasks comfortably.
              </p>
            </div>
          </div>
          {onNavigateToRecovery && (
            <button
              onClick={onNavigateToRecovery}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Open Goal Recovery
            </button>
          )}
        </div>
      )}

      {/* Quick Add Form Drawer */}
      {showQuickAdd && (
        <form
          onSubmit={handleCreateTask}
          className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/40 space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Add New Action Item</span>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What actionable task needs to get done?"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Estimated Duration</span>
                <span className="font-bold text-indigo-400">{newMinutes} min</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Done Criteria</label>
              <input
                type="text"
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="e.g. 10 notes written / quiz passed"
                className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Tabs Filter (Today / All / Completed) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterView("today")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterView === "today"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Today&apos;s Focus ({todayTasks.length})
        </button>
        <button
          onClick={() => setFilterView("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterView === "all"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          All Active Tasks ({goalTasks.filter((t) => t.status === "todo").length})
        </button>
        <button
          onClick={() => setFilterView("completed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterView === "completed"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Completed History ({completedTasks.length})
        </button>
      </div>

      {/* Task List Render */}
      <div className="space-y-3">
        {/* VIEW 1: TODAY'S FOCUS */}
        {filterView === "today" && (
          <>
            {/* Overdue tasks shown first so user is aware */}
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => completeTask(task.id)}
                    title="Mark Complete"
                    className="w-5 h-5 rounded-md border border-amber-500/60 hover:bg-emerald-500 hover:border-emerald-500 flex items-center justify-center shrink-0 mt-0.5 transition-colors group/btn"
                  >
                    <Check className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 text-slate-950" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{task.title}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                        Overdue ({task.dueDate})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-indigo-400">
                        <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                      </span>
                      <span>Done condition: {task.completionCriteria}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => startFocusTimer(task)}
                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs flex items-center gap-1 px-2.5 transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" /> Focus Sprint
                  </button>
                  <button
                    onClick={() => setReschedulingTask(task)}
                    className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setSkippingTask(task)}
                    className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Delete Task"
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Today's scheduled tasks */}
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => completeTask(task.id)}
                    title="Mark Complete"
                    className="w-5 h-5 rounded-md border border-slate-600 hover:bg-emerald-500 hover:border-emerald-500 flex items-center justify-center shrink-0 mt-0.5 transition-colors group/btn"
                  >
                    <Check className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 text-slate-950" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{task.title}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                          task.priority === "high"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-indigo-400">
                        <Clock className="w-3 h-3" /> {task.estimatedMinutes} min
                      </span>
                      <span>Target: {task.completionCriteria}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => startFocusTimer(task)}
                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs flex items-center gap-1 px-2.5 transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" /> Focus Sprint
                  </button>
                  <button
                    onClick={() => setReschedulingTask(task)}
                    className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setSkippingTask(task)}
                    className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Delete Task"
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {todayTasks.length === 0 && overdueTasks.length === 0 && (
              <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All done for today!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You&apos;ve cleared today&apos;s planned work. Rest comfortably without broken-streak anxiety, or preview upcoming milestones.
                </p>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: ALL ACTIVE TASKS */}
        {filterView === "all" && (
          <div className="space-y-3">
            {goalTasks
              .filter((t) => t.status === "todo")
              .map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="w-5 h-5 rounded-md border border-slate-600 hover:bg-emerald-500 hover:border-emerald-500 flex items-center justify-center shrink-0 mt-0.5"
                    >
                      <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100 text-slate-950" />
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-white">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                        <span className="font-mono text-indigo-400">{task.estimatedMinutes}m</span>
                        <span>Due: {task.dueDate}</span>
                        <span className="uppercase text-[9px] px-1 bg-slate-800 rounded">{task.priority}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReschedulingTask(task)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Reschedule
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* VIEW 3: COMPLETED HISTORY */}
        {filterView === "completed" && (
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No completed tasks yet.</p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between opacity-80"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-slate-300 line-through">
                        {task.title}
                      </span>
                      {task.notes && (
                        <span className="text-[10px] text-slate-500 block">{task.notes}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {task.actualMinutes ?? task.estimatedMinutes}m recorded
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal (PRD F-08) */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white">Reschedule Task</h4>
            <p className="text-xs text-slate-300">&quot;{reschedulingTask.title}&quot;</p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">New Scheduled Due Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReschedulingTask(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
              >
                Save Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Task Modal (PRD F-08) */}
      {skippingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white">Skip Task</h4>
            <p className="text-xs text-slate-300">&quot;{skippingTask.title}&quot;</p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Optional Reason / Blocker Note</label>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="e.g. Deprecated topic / no longer necessary"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSkippingTask(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Tasks Screen (64x64px Checkboxes, 24pt Headers)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { fieldDb, FieldTask } from '../../db/fieldDb';
import { Check, Camera, Mic, ArrowLeft, RefreshCw } from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface TasksScreenProps {
  activeStation: StationId;
  onBack: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ activeStation, onBack }) => {
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [showVoiceForTask, setShowVoiceForTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [activeStation]);

  const loadTasks = async () => {
    const list = await fieldDb.field_tasks.where('stationId').equals(activeStation).toArray();
    setTasks(list);
  };

  const handleToggle = async (taskId: string, current: boolean) => {
    await fieldDb.field_tasks.update(taskId, {
      completed: !current,
      completedAt: !current ? new Date().toISOString() : undefined
    });
    loadTasks();
  };

  const handleVoiceNote = async (taskId: string, note: string) => {
    await fieldDb.field_tasks.update(taskId, {
      notes: note
    });
    setShowVoiceForTask(null);
    loadTasks();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
        <button
          onClick={onBack}
          className="antarctic-button h-[64px] px-6 flex items-center gap-3"
        >
          <ArrowLeft className="w-8 h-8 text-[#FFD700]" />
          <span>BACK</span>
        </button>
        <h2 className="antarctic-text-heading text-[#FFFFFF]">ASSIGNED FIELD TASKS</h2>
        <span className="antarctic-text-mono text-[#00FFFF]">
          {tasks.filter(t => t.completed).length}/{tasks.length} DONE
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`antarctic-card flex flex-col gap-4 ${
              task.completed ? 'border-[#00FF00]' : 'border-[#FFFFFF]'
            }`}
          >
            <div className="flex items-start gap-6">
              {/* 64x64px Touch Target Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(task.id, task.completed)}
                className={`antarctic-checkbox shrink-0 ${task.completed ? 'checked' : ''}`}
                aria-label={`Toggle task ${task.title}`}
              >
                {task.completed && <Check className="w-12 h-12 stroke-[4]" />}
              </button>

              <div className="flex-1">
                <h3 className={`antarctic-text-heading ${task.completed ? 'line-through text-[#666666]' : 'text-[#FFFFFF]'}`}>
                  {task.title}
                </h3>
                <div className="antarctic-text-body text-[#AAAAAA] mt-1">
                  LOCATION: <strong className="text-[#FFD700]">{task.location}</strong> · DUE: {task.dueTime}
                </div>
                {task.notes && (
                  <div className="mt-2 p-3 bg-[#111111] border-2 border-[#00FFFF] text-[#00FFFF] text-[16pt]">
                    NOTE: {task.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-4 pt-2 border-t-2 border-[#333333]">
              <button
                onClick={() => setShowVoiceForTask(showVoiceForTask === task.id ? null : task.id)}
                className="antarctic-button flex-1 h-[64px] text-[16pt]"
              >
                <Mic className="w-6 h-6 mr-2 text-[#00FFFF]" />
                <span>{task.notes ? 'EDIT VOICE NOTE' : 'ADD VOICE NOTE'}</span>
              </button>

              <button
                onClick={() => alert(`Photo logged for task: ${task.title} (Cached offline)`)}
                className="antarctic-button h-[64px] px-6 text-[16pt]"
              >
                <Camera className="w-6 h-6 mr-2 text-[#FFD700]" />
                <span>PHOTO</span>
              </button>
            </div>

            {/* Voice Input Container if active */}
            {showVoiceForTask === task.id && (
              <div className="pt-2">
                <VoiceInput
                  label="RECORD FIELD TASK AUDIO"
                  onTranscript={(text) => handleVoiceNote(task.id, text)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

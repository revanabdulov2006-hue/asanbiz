import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Cpu, Play, ToggleLeft, ToggleRight, X } from 'lucide-react';
import './Pages.css';

export const AIAgent = () => {
  const { aiAgent, trainAgent, runAgentTask, toggleAutomationActive } = useStore();
  const [showTrainForm, setShowTrainForm] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [stepsInput, setStepsInput] = useState('');

  const handleTrainSubmit = (e) => {
    e.preventDefault();
    if (!taskName) return;
    const steps = stepsInput.split('\n').filter(Boolean);
    trainAgent({
      taskName,
      description,
      steps
    });
    setTaskName('');
    setDescription('');
    setStepsInput('');
    setShowTrainForm(false);
  };

  const handleRunTask = (name) => {
    runAgentTask(name);
    alert(`AI Agent "${name}" tapşırığını icra etdi!\nUğur statusu: Uğurlu (Success)\nƏtraflı nəticəni AI Log cədvəlində görə bilərsiniz.`);
  };

  return (
    <>
      <motion.div 
        className="page-container fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="page-heading">AI Köməkçisi (AI Agent)</h1>
            <p className="page-subheading">Market rutinlərinin süni intellekt vasitəsilə öyrədilməsi və avtomatlaşdırılması</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowTrainForm(true)}>
            <Cpu size={16} /> AI-a İş Öyrət (Eğit)
          </button>
        </div>

        <div className="ai-agent-layout-grid">
          <div className="ai-controls-left-col">
            <div className="table-card glass-panel">
              <div className="table-header">
                <h3>Aktiv Avtomatlaşdırmalar</h3>
                <span className="count-badge">{aiAgent.automations.length} aktiv qayda</span>
              </div>
              <div className="automations-list-wrapper">
                {aiAgent.automations.map((auto) => (
                  <div key={auto.id} className="automation-card-item">
                    <div className="auto-info">
                      <h4>{auto.taskName}</h4>
                      <p className="trigger-text">
                        Tetikleyici: <strong className="text-primary">{auto.triggerType} ({auto.scheduleExpression || auto.eventType})</strong>
                      </p>
                      <span className="last-run-time">Son icra: {auto.lastRun}</span>
                    </div>
                    <div className="auto-controls">
                      <button className="btn btn-accent btn-sm" onClick={() => handleRunTask(auto.taskName)}>
                        <Play size={10} /> Test Run
                      </button>
                      <button 
                        className="automation-toggle-btn" 
                        onClick={() => toggleAutomationActive(auto.id)}
                      >
                        {auto.isActive ? (
                          <ToggleRight size={28} className="text-green" />
                        ) : (
                          <ToggleLeft size={28} className="text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="table-card glass-panel">
              <div className="table-header">
                <h3>Öyrənilmiş İşlər (AI Models)</h3>
                <span className="count-badge">{aiAgent.trainings.length} model</span>
              </div>
              <div className="trainings-list-wrapper">
                {aiAgent.trainings.map((t) => (
                  <div key={t.id} className="training-model-item">
                    <div className="model-header-line">
                      <h4>{t.taskName}</h4>
                      <span className="status-pill status-success">{t.status}</span>
                    </div>
                    <p>{t.description}</p>
                    <div className="model-steps-bullets">
                      <h5>İcra Addımları:</h5>
                      <ul>
                        {t.steps.map((step, idx) => (
                          <li key={idx}><strong>{idx + 1}.</strong> {step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ai-logs-right-col">
            <div className="table-card glass-panel">
              <div className="table-header">
                <h3>AI İcra Günlüyü (Logs)</h3>
                <span className="count-badge">{aiAgent.logs.length} qeyd</span>
              </div>
              <div className="ai-logs-timeline">
                {aiAgent.logs.map((log) => (
                  <div key={log.id} className={`ai-log-timeline-card log-status-${log.status}`}>
                    <div className="timeline-card-header">
                      <span className="task-name-bold">{log.taskName}</span>
                      <span className={`status-pill ${log.status === 'Success' ? 'status-success' : 'status-danger'}`}>
                        {log.status === 'Success' ? 'Uğurlu' : 'Uğursuz'}
                      </span>
                    </div>
                    <p className="log-result-text">{log.result}</p>
                    <div className="timeline-card-footer">
                      <span>Müddət: <strong>{log.duration} ms</strong></span>
                      <span>Tarix: {log.executedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showTrainForm && (
        <div className="modal-overlay" onClick={() => setShowTrainForm(false)}>
          <motion.div 
            className="modal-content glass-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h3>AI Köməkçisini Öyrət</h3>
              <button className="close-modal-btn" onClick={() => setShowTrainForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleTrainSubmit} className="modal-form">
              <div className="form-group">
                <label>Görüləcək işin (Tapşırığın) adı</label>
                <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Məsələn: Gündəlik endirimli mallar" required />
              </div>
              <div className="form-group">
                <label>Qısa təsvir</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="AI-ın bu tapşırığı nə vaxt etməli olduğunu izah edin" required />
              </div>
              <div className="form-group">
                <label>İcra addımları (Hər sətirdə 1 addım)</label>
                <textarea rows="4" value={stepsInput} onChange={(e) => setStepsInput(e.target.value)} placeholder="Addım 1: Sroklu malları yoxla&#10;Addım 2: Cari qiyməti 30% endir&#10;Addım 3: Siyahını adminə göndər" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTrainForm(false)}>Ləğv et</button>
                <button type="submit" className="btn btn-primary">Öyrət və Saxla</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
export default AIAgent;

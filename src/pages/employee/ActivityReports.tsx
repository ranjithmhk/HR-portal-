import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Calendar,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Download,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Stepper, StepperActionBar, StepItem } from '../../components/ui/Stepper';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RailLayout } from '../../components/ui/RailLayout';
import { FileDropzone } from '../../components/ui/FileDropzone';

export const ActivityReports: React.FC = () => {
  const {
    activityReports,
    submitActivityReport,
    currentUser,
  } = useStore();

  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [periodDate, setPeriodDate] = useState('2026-10-22');
  const [periodLabel, setPeriodLabel] = useState('Oct 22 - Oct 28, 2026');

  // Step 2: Voice & Transcript
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    'This week I finalized the cross-account Redis VPC peering cutover rehearsal with zero packet loss. Prepared the architecture review diagrams for the FinTech client delivery sprint and helped Priya configure SageMaker IAM permissions.'
  );

  // Step 3: AI Structured Sections
  const [accomplishments, setAccomplishments] = useState(
    '1. Finalized cross-account Redis VPC peering rehearsal with zero packet loss.\n2. Completed sections 3 and 4 of FinTech Architecture Review Document.\n3. Mentored Priya Patel on SageMaker cross-account IAM role assumptions.'
  );
  const [blockers, setBlockers] = useState(
    'Awaiting client architecture sign-off on change freeze maintenance window for Nov 1st.'
  );
  const [nextPriorities, setNextPriorities] = useState(
    '1. Execute production cutover runbook for Redis.\n2. Submit SOC 2 Type II sanitization logs to auditor Deloitte.'
  );

  // Step 4: Attachments
  const [attachments, setAttachments] = useState<string[]>(['Redis_Failover_VPC_Report.pdf']);
  const [isDone, setIsDone] = useState(false);

  const steps: StepItem[] = [
    { id: 0, title: 'Select Period', subtitle: 'Type & frequency' },
    { id: 1, title: 'Record Activity', subtitle: 'Voice or transcript' },
    { id: 2, title: 'Review & Edit', subtitle: 'AI structured digest' },
    { id: 3, title: 'Attach & Submit', subtitle: 'Proof & sign-off' },
  ];

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setTranscript(
          prev =>
            prev +
            ' Conducted deep-dive load test on AWS ALB target groups and verified 200 OK responses under 5,000 req/sec.'
        );
      }, 4000);
    }
  };

  const handleGenerateAiReport = () => {
    // Generate AI structured synthesis from voice transcript
    setAccomplishments(
      `Synthesized from voice transcript (${transcript.length} chars):\n• Finalized cross-account Redis VPC peering rehearsal with 0% packet loss.\n• Completed client Architecture Review Document.\n• Configured IAM security roles.`
    );
    setCurrentStep(2);
  };

  const handleSubmit = () => {
    submitActivityReport({
      type: reportType,
      period: periodLabel,
      status: 'Submitted',
      isAiDraft: false,
      accomplishments,
      blockers,
      nextPriorities,
      transcript,
      attachments,
      submittedBy: currentUser.name,
    });
    setIsDone(true);
    setCurrentStep(0);
    setTimeout(() => setIsDone(false), 5000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Activity Reports' }]}
        title="Voice-Powered AI Work Reports"
        subtitle="Dictate daily, weekly, or monthly achievements with automated AI synthesis into client deliverables"
      />

      {isDone && (
        <div className="p-4 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span>
            Activity Report successfully submitted to Marcus Chen and logged into the compliance repository!
          </span>
        </div>
      )}

      {/* 2-Column Command Center: Stepper Workflow (8/12) + Right Rail "My Reports" (4/12) */}
      <RailLayout
        rail={
          /* Right Rail: My Reports */
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="micro-label text-text-secondary">My Recent Reports</span>
              <span className="text-xs text-primary font-semibold">{activityReports.length} logged</span>
            </div>

            <div className="space-y-3">
              {activityReports.map(rep => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge variant="info" size="sm">
                        {rep.type}
                      </StatusBadge>
                      {rep.isAiDraft && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-spark-50 text-spark">
                          AI Draft
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-text-tertiary">{rep.date}</span>
                  </div>

                  <p className="text-xs font-bold text-text truncate">{rep.period}</p>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                    {rep.accomplishments}
                  </p>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <StatusBadge
                      variant={rep.status === 'Submitted' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {rep.status}
                    </StatusBadge>
                    <button
                      onClick={() => alert(`Downloading report ${rep.id}`)}
                      className="text-primary hover:underline font-medium text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        }
      >
        {/* Main 8/12: 4-Step Stepper Workflow */}
        <div className="space-y-6">
          {/* Stepper Bar at Top */}
          <Card className="p-4">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={idx => setCurrentStep(idx)}
            />
          </Card>

          {/* Step 1: Select Period */}
          {currentStep === 0 && (
            <Card className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-text">1. Select Reporting Period</h3>
                <p className="text-xs text-text-secondary">
                  Choose the cadence of your update to tailor the AI prompt structure.
                </p>
              </div>

              {/* 3 Cards: Daily, Weekly, Monthly */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: 'Daily' as const,
                    title: 'Daily Standup',
                    desc: 'End of day recap of tasks and blockers',
                  },
                  {
                    type: 'Weekly' as const,
                    title: 'Weekly Summary',
                    desc: 'Sprint milestones and client deliverables',
                  },
                  {
                    type: 'Monthly' as const,
                    title: 'Monthly Review',
                    desc: 'Executive review & SLA compliance audit',
                  },
                ].map(card => (
                  <div
                    key={card.type}
                    onClick={() => setReportType(card.type)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      reportType === card.type
                        ? 'bg-primary-50 border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'bg-surface border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-bold text-sm text-text">{card.title}</span>
                      {reportType === card.type && (
                        <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary leading-snug">{card.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block micro-label text-text-secondary mb-1">Period Date</label>
                  <input
                    type="date"
                    value={periodDate}
                    onChange={e => setPeriodDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block micro-label text-text-secondary mb-1">Period Title / Scope</label>
                  <input
                    type="text"
                    value={periodLabel}
                    onChange={e => setPeriodLabel(e.target.value)}
                    placeholder="e.g. Oct 22 - Oct 28, 2026"
                    className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Record Activity (Voice & Mic) */}
          {currentStep === 1 && (
            <Card className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-text">2. Voice Dictation & Transcript</h3>
                <p className="text-xs text-text-secondary">
                  Tap the mic to dictate naturally in any accent. Our AI engine transcribes technical terms accurately.
                </p>
              </div>

              {/* Large Mic Button with Pulsing Indigo Ring */}
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="relative">
                  {isRecording && (
                    <span className="absolute -inset-4 rounded-full bg-primary/20 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={handleToggleRecord}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl relative z-10 ${
                      isRecording
                        ? 'bg-[#C81E3A] ring-8 ring-[#C81E3A]/20 scale-105'
                        : 'hero-gradient hover:scale-105'
                    }`}
                    aria-label={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                  >
                    {isRecording ? (
                      <MicOff className="w-8 h-8 animate-pulse" strokeWidth={1.75} />
                    ) : (
                      <Mic className="w-8 h-8" strokeWidth={1.75} />
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-text">
                    {isRecording ? 'Listening & Transcribing... (Speak now)' : 'Click to start voice dictation'}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    Supports AWS terms, Redis, Docker, and DevOps nomenclature
                  </p>
                </div>
              </div>

              {/* Editable Transcript */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="micro-label text-text-secondary">Editable Transcript</label>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    {transcript.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  className="w-full p-3.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateAiReport}
                  className="h-10 px-5 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-2 shadow-sm hover:opacity-95"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                  Generate AI Report →
                </button>
              </div>
            </Card>
          )}

          {/* Step 3: Review & Edit (AI Structured Sections) */}
          {currentStep === 2 && (
            <Card className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="font-heading font-bold text-base text-text">3. AI-Structured Sections</h3>
                  <p className="text-xs text-text-secondary">
                    Review and refine the structured synthesis generated by the MHK AI engine.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full bg-primary-50">
                  AI Generated
                </span>
              </div>

              {/* Accomplishments */}
              <div>
                <label className="block micro-label text-text-secondary mb-1">
                  Key Accomplishments & Deliverables
                </label>
                <textarea
                  rows={4}
                  value={accomplishments}
                  onChange={e => setAccomplishments(e.target.value)}
                  className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono leading-relaxed"
                />
              </div>

              {/* Blockers */}
              <div>
                <label className="block micro-label text-text-secondary mb-1">
                  Blockers, Dependencies & Impediments
                </label>
                <textarea
                  rows={2}
                  value={blockers}
                  onChange={e => setBlockers(e.target.value)}
                  className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                />
              </div>

              {/* Next Priorities */}
              <div>
                <label className="block micro-label text-text-secondary mb-1">
                  Next Planned Priorities & Milestones
                </label>
                <textarea
                  rows={3}
                  value={nextPriorities}
                  onChange={e => setNextPriorities(e.target.value)}
                  className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                />
              </div>
            </Card>
          )}

          {/* Step 4: Attach & Submit */}
          {currentStep === 3 && (
            <Card className="space-y-5 animate-fadeIn">
              <div className="space-y-1 pb-2 border-b border-border">
                <h3 className="font-heading font-bold text-base text-text">4. Attachments & Verification</h3>
                <p className="text-xs text-text-secondary">
                  Attach supporting architecture diagrams, test results, or sprint artifacts before submission.
                </p>
              </div>

              <FileDropzone
                onFileSelect={file => setAttachments(prev => [...prev, file.name])}
                label="Upload supporting evidence or sprint diagrams"
                subtext="PDF, PNG, JPG (max 20 MB)"
              />

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="micro-label text-text-secondary">Attached Files ({attachments.length})</span>
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-surface-muted border border-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />
                        <span className="font-medium text-text">{file}</span>
                      </div>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="text-text-tertiary hover:text-[#C81E3A] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Review summary box */}
              <div className="p-4 rounded-xl bg-surface-muted/60 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Report Type:</span>
                  <span className="font-bold text-text">{reportType} Update</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Author:</span>
                  <span className="font-bold text-text">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Supervisor Delivery Sign-off:</span>
                  <span className="font-bold text-primary">{currentUser.manager}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Stepper Sticky Bottom Action Bar */}
          <StepperActionBar
            onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            backDisabled={currentStep === 0}
            onSaveDraft={() => alert('Saved report as local draft!')}
            onContinue={() => {
              if (currentStep < 3) {
                setCurrentStep(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            continueText={currentStep === 3 ? 'Sign & Submit Report →' : 'Continue →'}
          />
        </div>
      </RailLayout>
    </div>
  );
};

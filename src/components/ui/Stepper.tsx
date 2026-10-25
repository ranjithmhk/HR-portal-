import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div
                onClick={() => isCompleted && onStepClick && onStepClick(idx)}
                className={`flex flex-col items-center relative z-10 ${
                  isCompleted && onStepClick ? 'cursor-pointer group' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-[#15803D] text-white shadow-sm'
                      : isActive
                      ? 'hero-gradient text-white ring-4 ring-primary-100 shadow-md'
                      : 'bg-surface-muted text-text-tertiary border border-border'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-semibold whitespace-nowrap ${
                      isActive ? 'text-primary' : isCompleted ? 'text-text' : 'text-text-tertiary'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.subtitle && (
                    <span className="hidden sm:block text-[10px] text-text-tertiary mt-0.5">
                      {step.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Dot-Line-Dot Connector */}
              {idx < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-2 mb-6">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      idx < currentStep ? 'bg-[#15803D]' : 'bg-border-strong'
                    }`}
                  />
                  <div
                    className={`flex-1 h-[2px] transition-colors ${
                      idx < currentStep ? 'bg-[#15803D]' : 'bg-border'
                    }`}
                  />
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      idx < currentStep ? 'bg-[#15803D]' : 'bg-border-strong'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const StepperActionBar: React.FC<{
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue: () => void;
  backDisabled?: boolean;
  continueDisabled?: boolean;
  continueText?: string;
  isSubmitting?: boolean;
}> = ({
  onBack,
  onSaveDraft,
  onContinue,
  backDisabled = false,
  continueDisabled = false,
  continueText = 'Continue →',
  isSubmitting = false,
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border px-6 py-4 flex items-center justify-between mt-8 shadow-lg">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="h-10 px-4 rounded-btn border border-border-strong text-text font-medium text-xs hover:bg-surface-muted transition-colors disabled:opacity-40"
          >
            ← Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="h-10 px-4 rounded-btn border border-border-strong text-text-secondary font-medium text-xs hover:text-text hover:bg-surface-muted transition-colors"
          >
            Save draft
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || isSubmitting}
          className="h-10 px-6 rounded-btn hero-gradient text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : continueText}
        </button>
      </div>
    </div>
  );
};

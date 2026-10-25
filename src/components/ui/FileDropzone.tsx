import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, File, CheckCircle2, X } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
  label?: string;
  subtext?: string;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptedFormats = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 20,
  label = 'Click to upload or drag & drop',
  subtext = 'PDF, PNG or JPG (max. 20 MB)',
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const sizeKB = (file.size / 1024).toFixed(0);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeDisplay = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    setSelectedFile({ name: file.name, size: sizeDisplay });
    onFileSelect && onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.008, borderColor: 'var(--primary)' }}
      whileTap={{ scale: 0.995 }}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragOver
          ? 'border-primary bg-primary-50/50 scale-[1.01]'
          : selectedFile
          ? 'border-[#00A859]/50 bg-[#EDFBF4]/40'
          : 'border-border hover:bg-primary-50/20'
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-text-secondary">{selectedFile.size} · Ready for upload</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-text-tertiary hover:text-danger rounded-md hover:bg-surface-muted transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.15, y: -2 }}
            className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-3"
          >
            <UploadCloud className="w-6 h-6" strokeWidth={1.75} />
          </motion.div>
          <p className="text-sm font-semibold text-text mb-1">{label}</p>
          <p className="text-xs text-text-secondary">{subtext}</p>
        </div>
      )}
    </motion.div>
  );
};

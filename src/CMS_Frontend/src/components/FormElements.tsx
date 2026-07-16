import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, ...props }: InputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" {...props} />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, ...props }: TextAreaProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <textarea className="form-input" {...props} />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function SelectField({ label, options, error, ...props }: SelectProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-input" {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
}

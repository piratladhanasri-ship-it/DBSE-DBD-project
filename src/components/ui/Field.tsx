import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export const inputClasses =
'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 transition-colors duration-150 ease-out focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100 disabled:bg-mist disabled:text-navy-400';

export function Field({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ?
      <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-800">
          {label}
          {required ? <span className="ml-0.5 text-negative">*</span> : null}
        </label> :
      null}
      {children}
      {error ?
      <p className="flex items-center gap-1.5 text-xs font-medium text-negative" role="alert">
          <AlertCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p> :
      hint ?
      <p className="text-xs text-navy-400">{hint}</p> :
      null}
    </div>);

}

export function TextInput({ className, invalid, ...props }) {
  return (
    <input
      className={cn(inputClasses, invalid && 'border-negative focus:border-negative focus:ring-negative/15', className)}
      aria-invalid={invalid || undefined}
      {...props} />);


}

export function TextArea({ className, invalid, rows = 5, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(inputClasses, 'resize-y', invalid && 'border-negative focus:border-negative focus:ring-negative/15', className)}
      aria-invalid={invalid || undefined}
      {...props} />);


}

export function SelectInput({ className, invalid, children, ...props }) {
  return (
    <select
      className={cn(inputClasses, 'appearance-none bg-white pr-9', invalid && 'border-negative', className)}
      aria-invalid={invalid || undefined}
      {...props}>
      
      {children}
    </select>);

}
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from '../LoadingSpinner';

const VARIANTS = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 disabled:bg-navy-300',
  gold: 'bg-gold-400 text-navy-900 hover:bg-gold-300 disabled:bg-gold-100 disabled:text-navy-300',
  outline: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-400 hover:bg-navy-50',
  ghost: 'text-navy-600 hover:bg-navy-50 hover:text-navy-900',
  danger: 'border border-negative/30 bg-white text-negative hover:bg-negative/5',
  subtle: 'bg-navy-50 text-navy-700 hover:bg-navy-100'
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center'
};

export function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 ease-out',
    'disabled:cursor-not-allowed disabled:opacity-70',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content =
  <>
      {loading ? <LoadingSpinner size="sm" tone={variant === 'primary' ? 'light' : 'dark'} /> : null}
      {children}
    </>;


  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>);

  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>);

  }
  const Tag = as;
  return (
    <Tag className={classes} disabled={disabled || loading} {...props}>
      {content}
    </Tag>);

}
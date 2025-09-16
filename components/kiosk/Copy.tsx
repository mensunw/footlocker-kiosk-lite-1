import { ReactNode } from 'react';
import styles from './Copy.module.css';

interface CopyProps {
  children: ReactNode;
  variant?: 'V1' | 'V2';
  size?: 'headline' | 'subheadline' | 'body' | 'caption';
  animation?: 'slideUp' | 'explode' | 'pulse' | 'breathe' | 'fade';
  gradient?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Copy({
  children,
  variant = 'V1',
  size = 'headline',
  animation = 'fade',
  gradient = false,
  className = '',
  style = {}
}: CopyProps) {
  const classes = [
    styles.copy,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`variant${variant}`],
    styles[`anim${animation.charAt(0).toUpperCase() + animation.slice(1)}`],
    gradient && styles.gradient,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
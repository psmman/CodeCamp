import { type ReactNode } from 'react';

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  size?: 'large' | 'medium' | 'small';
  variant?: 'default' | 'danger';
}

export interface HeaderProps {
  children: ReactNode;
  showCloseButton?: boolean;
}

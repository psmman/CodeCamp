import React, {
  type ReactNode,
  createContext,
  useContext,
  Fragment
} from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { CloseButton } from '../close-button';
import { type ModalProps, type HeaderProps } from './types';

// There is a close button on the right side of the modal title.
// Some extra padding needs to be added to the left of the title text
// so that the title is properly centered.
// The value of the left padding is the width of the close button.
const TITLE_LEFT_PADDING = 24;

const PANEL_DEFAULT_CLASSES = [
  'flex',
  'flex-col',
  'border-solid',
  'border-1',
  'border-foreground-secondary',
  'bg-background-secondary'
];

const HEADER_DEFAULT_CLASSES = [
  'p-[15px]',
  'border-b-1',
  'border-solid',
  'border-foreground-secondary'
];

const ModalContext = createContext<Pick<ModalProps, 'onClose' | 'variant'>>({
  onClose: () => {},
  variant: 'default'
});

const Header = ({ children, showCloseButton = true }: HeaderProps) => {
  const { onClose, variant } = useContext(ModalContext);

  const classes = [...HEADER_DEFAULT_CLASSES];

  if (variant === 'danger') {
    classes.push('bg-foreground-danger');
  }

  if (showCloseButton) {
    classes.push(...['flex', 'items-center', 'justify-between']);

    return (
      <div className={classes.join(' ')}>
        <Dialog.Title
          className={`m-0 pl-[${TITLE_LEFT_PADDING}px] flex-1 text-md text-center`}
        >
          {children}
        </Dialog.Title>
        <CloseButton onClick={onClose} />
      </div>
    );
  }

  return (
    <div className={classes.join(' ')}>
      <Dialog.Title className={'m-0 text-md text-center'}>
        {children}
      </Dialog.Title>
    </div>
  );
};

const Body = ({ children }: { children: ReactNode }) => {
  return (
    <div className='p-[15px] border-b-1 border-solid border-foreground-secondary'>
      {children}
    </div>
  );
};

const Footer = ({ children }: { children: ReactNode }) => {
  return <div className='p-[15px]'>{children}</div>;
};

export const Modal = ({
  children,
  open,
  onClose,
  size = 'medium',
  variant = 'default'
}: ModalProps) => {
  const classes = [...PANEL_DEFAULT_CLASSES];

  switch (size) {
    case 'large':
      classes.push('w-[900px]');
      break;
    case 'small':
      classes.push('w-[300px]');
      break;
    default:
      classes.push('w-[600px]');
  }

  switch (variant) {
    case 'danger':
      classes.push('text-background-danger');
      break;
    default:
      classes.push('text-foreground-secondary');
  }

  return (
    <ModalContext.Provider value={{ onClose, variant }}>
      <Transition.Root show={open} as={Fragment}>
        <Dialog onClose={onClose} className='relative z-50'>
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div
            aria-hidden
            className='fixed inset-0 bg-foreground-primary opacity-50'
          />

          {/* Full-screen container of the panel */}
          <div className='fixed inset-0 w-screen flex items-start justify-center pt-[30px]'>
            <Transition.Child
              as={Fragment}
              enter='transition-all duration-300 ease-out'
              enterFrom='opacity-0 -translate-y-1/4'
              enterTo='opacity-100 translate-y-0'
              leave='transition-all duration-300 ease-out'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 -translate-y-1/4'
            >
              <Dialog.Panel className={classes.join(' ')}>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </ModalContext.Provider>
  );
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

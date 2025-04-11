import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import useMediaQuery from '../../../src/hooks/useMediaQuery';
import { useTheme } from '../../theme';

interface IContext {
  isOpen: boolean;
  toggleMenu: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLUListElement | null>;
}

export const AppMenuContext = createContext({} as IContext);

export const useAppMenu = () => useContext(AppMenuContext);

const AppMenuProvider = ({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [theme] = useTheme();
  const isDesktop = useMediaQuery(
    `(min-width: ${theme.breakpoints.desktop}px)`
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    if (isOpen && !isDesktop) {
      // Prevent background scrolling when menu is open and on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalStyle;
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, isDesktop]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();

      if (contentRef.current && document.activeElement === contentRef.current) {
        console.log('Menu successfully focused');
      } else {
        console.log(
          'Failed to focus menu - current focus is on:',
          document.activeElement
        );
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const closeMenuOutsideClick = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }

      if (!isOpen || !contentRef.current) return;

      const focusableElements = Array.from(
        contentRef.current.querySelectorAll('[role="menuitem"]')
      ).filter((el) => {
        const element = el as HTMLElement;
        return (
          element.getAttribute('aria-disabled') !== 'true' &&
          element.tabIndex >= 0 &&
          element.offsetParent !== null
        );
      }) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      if (event.key === 'Tab') {
        // Loop focus on Tab/Shift+Tab
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      } else if (event.key === 'ArrowDown') {
        // Move focus to next item
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
          event.preventDefault();
        } else {
          firstElement.focus();
          event.preventDefault();
        }
      } else if (event.key === 'ArrowUp') {
        // Move focus to previous item
        if (currentIndex !== -1) {
          const prevIndex =
            (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;
          focusableElements[prevIndex].focus();
          event.preventDefault();
        } else {
          lastElement.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('mousedown', closeMenuOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', closeMenuOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prevOpen) => !prevOpen);

  const value = {
    isOpen,
    toggleMenu,
    triggerRef,
    contentRef,
  };

  return (
    <AppMenuContext.Provider value={value}>{children}</AppMenuContext.Provider>
  );
};

export default AppMenuProvider;

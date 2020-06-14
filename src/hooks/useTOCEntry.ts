import { useEffect, useRef } from 'react';
import { TOCContainer } from '../context/TOCContext';
import ParentChildContext from '../context/ParentChildContext';

/**
 * Adds Element to TOC List and manages viewport intersection events
 * @param element Element to include in TOC
 * @param id Unique identifier for the element, also used for in-page navigation
 */
function useTOCEntry(sectionObj: Omit<Section, 'parent'>): void {
  const {
    determineActiveSection,
    addSection,
    activeSection,
  } = TOCContainer.useContainer();
  const {
    parent,
    addChild,
    isParentOrChild,
  } = ParentChildContext.useContainer();
  const { element, id, text } = sectionObj;

  const observer = useRef<IntersectionObserver>();
  const intersected = useRef<boolean>(false);

  const callback = () => {
    determineActiveSection(element, id);
  };

  const startObserver = () => {
    if (element?.current && observer?.current)
      observer.current.observe(element.current);
  };

  const stopObserver = () => {
    if (element?.current && observer?.current) {
      observer.current.unobserve(element.current);
      observer.current.disconnect();
      observer.current = undefined;
    }
  };

  const handleIntersection = (entries: Array<IntersectionObserverEntry>) => {
    const entry = entries[0] || {};
    const { isIntersecting, intersectionRatio } = entry;
    const isInViewport =
      typeof isIntersecting !== 'undefined'
        ? isIntersecting
        : intersectionRatio > 0;

    // enterring viewport
    if (!intersected.current && isInViewport) {
      intersected.current = true;
      window.addEventListener('scroll', callback);
      return;
    }

    // leaving viewport
    if (intersected.current && !isInViewport) {
      intersected.current = false;
      window.removeEventListener('scroll', callback);

      // ?: Remove as activeSection?
    }
  };

  const initObserver = () => {
    if (!observer?.current)
      observer.current = new IntersectionObserver(handleIntersection, {
        threshold: 0,
      });
  };

  /** EFFECTS */

  useEffect(() => {
    initObserver();
    startObserver();

    return () => {
      window.removeEventListener('scroll', callback);
      stopObserver();
    };
  }, []);

  useEffect(() => {
    if (!element) return;

    addSection({ element, id, text, parent });
    addChild(id);
  }, []);
}

export default useTOCEntry;
/**
 * Tests for animation utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  easings,
  durations,
  prefersReducedMotion,
  getAccessibleVariants,
  createStagger,
  createSpring,
  createTransition,
  fadeVariants,
  slideVariants,
  scaleVariants,
  cardVariants,
  buttonVariants,
  modalVariants
} from './animations';

describe('Animation Utilities', () => {
  describe('Timing Functions', () => {
    it('should export easing configurations', () => {
      expect(easings.easeOut).toEqual([0.16, 1, 0.3, 1]);
      expect(easings.easeIn).toEqual([0.5, 0, 0.84, 0.36]);
      expect(easings.easeInOut).toEqual([0.65, 0, 0.35, 1]);
    });

    it('should export spring configurations', () => {
      expect(easings.spring).toHaveProperty('type', 'spring');
      expect(easings.spring).toHaveProperty('stiffness', 280);
      expect(easings.spring).toHaveProperty('damping', 30);
    });
  });

  describe('Duration Scale', () => {
    it('should export duration values', () => {
      expect(durations.fast).toBe(0.2);
      expect(durations.normal).toBe(0.4);
      expect(durations.slow).toBe(0.6);
    });
  });

  describe('Motion Preference Detection', () => {
    let originalMatchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should detect when user prefers reduced motion', () => {
      window.matchMedia = (query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should detect when user does not prefer reduced motion', () => {
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      });

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('Accessible Variants', () => {
    let originalMatchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should return normal variants when motion is not reduced', () => {
      window.matchMedia = () => ({ matches: false });
      
      const normalVariants = { hidden: { x: -100 }, visible: { x: 0 } };
      const result = getAccessibleVariants(normalVariants);
      
      expect(result).toEqual(normalVariants);
    });

    it('should return fade variants when motion is reduced and no custom reduced variants provided', () => {
      window.matchMedia = (query) => ({
        matches: query === '(prefers-reduced-motion: reduce)'
      });
      
      const normalVariants = { hidden: { x: -100 }, visible: { x: 0 } };
      const result = getAccessibleVariants(normalVariants);
      
      expect(result).toEqual(fadeVariants);
    });

    it('should return custom reduced variants when provided', () => {
      window.matchMedia = (query) => ({
        matches: query === '(prefers-reduced-motion: reduce)'
      });
      
      const normalVariants = { hidden: { x: -100 }, visible: { x: 0 } };
      const reducedVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      const result = getAccessibleVariants(normalVariants, reducedVariants);
      
      expect(result).toEqual(reducedVariants);
    });
  });

  describe('Helper Functions', () => {
    it('should create stagger configuration', () => {
      const stagger = createStagger(0.2, 0.1);
      
      expect(stagger).toHaveProperty('hidden');
      expect(stagger).toHaveProperty('visible');
      expect(stagger.visible.transition.staggerChildren).toBe(0.2);
      expect(stagger.visible.transition.delayChildren).toBe(0.1);
    });

    it('should create spring configuration', () => {
      const spring = createSpring(400, 25);
      
      expect(spring.type).toBe('spring');
      expect(spring.stiffness).toBe(400);
      expect(spring.damping).toBe(25);
    });

    it('should create transition configuration', () => {
      const transition = createTransition(0.5, easings.easeIn);
      
      expect(transition.duration).toBe(0.5);
      expect(transition.ease).toEqual(easings.easeIn);
    });
  });

  describe('Animation Variants', () => {
    it('should export fade variants', () => {
      expect(fadeVariants).toHaveProperty('hidden');
      expect(fadeVariants).toHaveProperty('visible');
      expect(fadeVariants).toHaveProperty('exit');
      expect(fadeVariants.hidden.opacity).toBe(0);
      expect(fadeVariants.visible.opacity).toBe(1);
    });

    it('should export slide variants', () => {
      expect(slideVariants.up).toHaveProperty('hidden');
      expect(slideVariants.up).toHaveProperty('visible');
      expect(slideVariants.up.hidden.y).toBe(20);
      expect(slideVariants.up.visible.y).toBe(0);
    });

    it('should export scale variants', () => {
      expect(scaleVariants).toHaveProperty('hidden');
      expect(scaleVariants).toHaveProperty('visible');
      expect(scaleVariants.hidden.scale).toBe(0.95);
      expect(scaleVariants.visible.scale).toBe(1);
    });

    it('should export card variants', () => {
      expect(cardVariants).toHaveProperty('rest');
      expect(cardVariants).toHaveProperty('hover');
      expect(cardVariants).toHaveProperty('tap');
      expect(cardVariants.hover.scale).toBe(1.015);
    });

    it('should export button variants', () => {
      expect(buttonVariants).toHaveProperty('rest');
      expect(buttonVariants).toHaveProperty('hover');
      expect(buttonVariants).toHaveProperty('tap');
      expect(buttonVariants.tap.scale).toBe(0.95);
    });

    it('should export modal variants for desktop and mobile', () => {
      expect(modalVariants).toHaveProperty('desktop');
      expect(modalVariants).toHaveProperty('mobile');
      expect(modalVariants.mobile.hidden.y).toBe('100%');
      expect(modalVariants.mobile.visible.y).toBe(0);
    });
  });
});

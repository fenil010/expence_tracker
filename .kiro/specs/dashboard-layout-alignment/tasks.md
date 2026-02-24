# Implementation Plan: Dashboard Layout Alignment

## Overview

This implementation plan converts the dashboard layout alignment design into discrete coding tasks. Each task builds incrementally, starting with the main Dashboard container, then moving to individual card components, and finally to the Layout wrapper. The approach ensures that spacing changes are applied systematically and can be validated at each step.

## Tasks

- [-] 1. Update Dashboard.jsx main container spacing
  - Replace hardcoded spacing values with CSS variables
  - Update section spacing (header, summary cards) to use --spacing-8 (32px)
  - Update Grid container spacing from 40 to 24 (--spacing-6)
  - Update bottom padding to --spacing-8 (32px)
  - Update left and right column gap spacing to --spacing-6 (24px)
  - _Requirements: 1.1, 2.1, 2.4, 5.1, 5.2, 5.3, 5.4_

- [ ] 1.1 Write property test for CSS variable usage in Dashboard.jsx
  - **Property 1: CSS Variable Usage for Spacing**
  - **Validates: Requirements 1.1**

- [-] 2. Update SummaryCards.jsx spacing
  - Replace Tailwind gap-8 class with inline style using --spacing-4 (16px)
  - Ensure card padding uses --spacing-6 (24px) via CSS variable
  - Verify icon marginBottom uses --spacing-4 (16px)
  - _Requirements: 1.1, 2.2_

- [ ] 2.1 Write unit test for SummaryCards grid gap
  - Verify gap value is 16px (--spacing-4)
  - _Requirements: 2.2_

- [-] 3. Update SpendingChart.jsx spacing
  - Update card padding from 28px to --spacing-6 (24px)
  - Update header marginBottom from 32px to --spacing-5 (20px)
  - Update header marginTop from 6px to --spacing-2 (8px)
  - Update summary section marginTop from 24px to --spacing-5 (20px)
  - Update summary section paddingTop from 24px to --spacing-5 (20px)
  - _Requirements: 1.1, 3.1, 6.1, 6.4_

- [ ] 3.1 Write unit test for SpendingChart spacing values
  - Verify card padding is 24px
  - Verify header marginBottom is 20px
  - Verify summary spacing is 20px
  - _Requirements: 3.1, 6.4_

- [ ] 4. Update Recent Transactions spacing in Dashboard.jsx
  - Update card padding to --spacing-6 (24px)
  - Update list item gap to --spacing-3 (12px)
  - Update header marginBottom to --spacing-5 (20px)
  - _Requirements: 1.1, 3.5, 6.1, 6.2_

- [ ] 5. Update sidebar card components for equal heights and consistent padding
  - [x] 5.1 Update BudgetOverview.jsx
    - Replace Material-UI p: 3 with padding: 'var(--spacing-6)'
    - Add height: '100%' to ensure equal height with siblings
    - Add display: 'flex', flexDirection: 'column' for proper layout
    - _Requirements: 1.1, 3.2, 4.1_
  
  - [x] 5.2 Update CategoryChart.jsx
    - Replace Material-UI p: 3 with padding: 'var(--spacing-6)'
    - Add height: '100%' to ensure equal height with siblings
    - Add display: 'flex', flexDirection: 'column' for proper layout
    - _Requirements: 1.1, 3.3, 4.1_
  
  - [x] 5.3 Update SavingsGoals.jsx
    - Replace Material-UI p: 3 with padding: 'var(--spacing-6)'
    - Add height: '100%' to ensure equal height with siblings
    - Add display: 'flex', flexDirection: 'column' for proper layout
    - _Requirements: 1.1, 3.4, 4.1_

- [ ] 5.4 Write property test for sidebar card height equality
  - **Property 5: Sidebar Card Height Equality**
  - **Validates: Requirements 4.1**

- [ ] 5.5 Write property test for card padding uniformity
  - **Property 4: Card Padding Uniformity**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 6. Checkpoint - Verify spacing changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update Layout.jsx responsive padding
  - Replace hardcoded padding values with CSS variables
  - Update mobile (xs) padding to --spacing-4 (16px)
  - Update tablet (sm) padding to --spacing-5 (20px)
  - Update desktop (md) padding to --spacing-6 (24px)
  - Update bottom padding to --spacing-8 (32px)
  - Maintain existing top padding for AppBar offset
  - _Requirements: 1.1, 7.1, 7.2, 7.3, 10.1, 10.4_

- [ ] 7.1 Write unit tests for Layout responsive padding
  - Verify mobile padding is 16px
  - Verify tablet padding is 20px
  - Verify desktop padding is 24px
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. Add responsive grid spacing for mobile
  - Update Dashboard.jsx Grid container to use responsive spacing
  - Set spacing to 16px (--spacing-4) for viewports below 960px
  - Maintain 24px (--spacing-6) for desktop
  - _Requirements: 2.3, 7.4_

- [ ] 8.1 Write property test for responsive spacing adaptation
  - **Property 3: Responsive Spacing Adaptation**
  - **Validates: Requirements 2.3**

- [ ] 9. Update Dashboard header title spacing
  - Change marginBottom from 10px to --spacing-2 (8px)
  - _Requirements: 6.5_

- [ ] 10. Final verification and testing
  - [ ] 10.1 Visual inspection at all breakpoints
    - Test desktop view (>960px)
    - Test tablet view (600px-960px)
    - Test mobile view (<600px)
    - _Requirements: All_
  
  - [ ] 10.2 Write property test for spacing hierarchy
    - **Property 8: Spacing Hierarchy Maintenance**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
  
  - [ ] 10.3 Write property test for spacing-only modifications
    - **Property 9: Spacing-Only Modifications**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7**
  
  - [ ] 10.4 Write property test for section spacing consistency
    - **Property 2: Section Spacing Consistency**
    - **Validates: Requirements 2.4, 5.5**

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and spacing values
- Visual inspection is critical to verify no unintended design changes
- All spacing values should use CSS variables from index.css
- No changes to colors, fonts, icons, or visual effects

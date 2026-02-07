import { useState } from 'react';
import {
  GlassContainer,
  GlassModal,
  GlassCard,
  GlassNav,
  GlassDropdown,
  GlassTooltip,
  GlassButton,
  GlassInput,
  GlassBadge,
} from '../ui/GlassComponents';

/**
 * Glassmorphism Showcase Component
 * Demonstrates all glassmorphism utilities and component patterns
 * This component serves as both documentation and testing for glassmorphism effects
 */
export default function GlassmorphismShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <GlassNav className="mb-8 p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Glassmorphism Showcase
          </h1>
          <div className="flex items-center gap-4">
            <GlassBadge variant="primary">Premium</GlassBadge>
            <GlassButton 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </GlassButton>
          </div>
        </div>
      </GlassNav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Basic Glass Variants */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Glass Variants</h3>
          <div className="space-y-4">
            <GlassContainer variant="light" className="p-4 rounded-lg">
              <p className="text-sm">Light Glass Effect</p>
            </GlassContainer>
            <GlassContainer variant="subtle" className="p-4 rounded-lg">
              <p className="text-sm">Subtle Glass Effect</p>
            </GlassContainer>
            <GlassContainer variant="strong" className="p-4 rounded-lg">
              <p className="text-sm">Strong Glass Effect</p>
            </GlassContainer>
          </div>
        </GlassCard>

        {/* Colored Glass Effects */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Colored Glass</h3>
          <div className="space-y-4">
            <GlassContainer variant="blue" className="p-4 rounded-lg">
              <p className="text-sm font-medium">Blue Tinted Glass</p>
            </GlassContainer>
            <GlassContainer variant="green" className="p-4 rounded-lg">
              <p className="text-sm font-medium">Green Tinted Glass</p>
            </GlassContainer>
            <GlassContainer variant="red" className="p-4 rounded-lg">
              <p className="text-sm font-medium">Red Tinted Glass</p>
            </GlassContainer>
            <GlassContainer variant="orange" className="p-4 rounded-lg">
              <p className="text-sm font-medium">Orange Tinted Glass</p>
            </GlassContainer>
          </div>
        </GlassCard>

        {/* Interactive Components */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Interactive Elements</h3>
          <div className="space-y-4">
            <div className="relative">
              <GlassButton 
                variant="primary"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full"
              >
                Toggle Dropdown
              </GlassButton>
              <GlassDropdown 
                isOpen={isDropdownOpen}
                position="bottom-left"
                className="w-full"
              >
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                    Option 1
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                    Option 2
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                    Option 3
                  </button>
                </div>
              </GlassDropdown>
            </div>

            <GlassTooltip
              content="This is a glass tooltip!"
              isVisible={tooltipVisible}
              position="top"
            >
              <GlassButton
                variant="default"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                className="w-full"
              >
                Hover for Tooltip
              </GlassButton>
            </GlassTooltip>
          </div>
        </GlassCard>

        {/* Form Elements */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
          <div className="space-y-4">
            <GlassInput
              label="Glass Input Field"
              placeholder="Enter some text..."
            />
            <GlassInput
              label="With Error"
              placeholder="This has an error"
              error="This field is required"
            />
            <div className="flex gap-2">
              <GlassButton variant="success" size="sm">
                Save
              </GlassButton>
              <GlassButton variant="danger" size="sm">
                Cancel
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Badge Showcase */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Glass Badges</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <GlassBadge variant="default" size="xs">New</GlassBadge>
              <GlassBadge variant="primary" size="sm">Premium</GlassBadge>
              <GlassBadge variant="success" size="md">Active</GlassBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              <GlassBadge variant="warning">Warning</GlassBadge>
              <GlassBadge variant="danger">Error</GlassBadge>
            </div>
          </div>
        </GlassCard>

        {/* Blur Variations */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Blur Variations</h3>
          <div className="space-y-4">
            <GlassContainer blur="sm" className="p-4 rounded-lg bg-white/60">
              <p className="text-sm">Small Blur (4px)</p>
            </GlassContainer>
            <GlassContainer blur="lg" className="p-4 rounded-lg bg-white/60">
              <p className="text-sm">Large Blur (12px)</p>
            </GlassContainer>
            <GlassContainer blur="3xl" className="p-4 rounded-lg bg-white/60">
              <p className="text-sm">Extra Large Blur (32px)</p>
            </GlassContainer>
          </div>
        </GlassCard>
      </div>

      {/* Glass Modal Example */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Glass Modal</h2>
          <p className="text-gray-600 mb-6">
            This is a modal with glassmorphism effects. Notice the backdrop blur
            and the translucent background.
          </p>
          <div className="flex gap-3">
            <GlassButton 
              variant="primary" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Confirm
            </GlassButton>
            <GlassButton 
              variant="default" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Background Elements for Glass Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-300 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
}
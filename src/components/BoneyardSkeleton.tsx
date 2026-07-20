import React from 'react';

export interface BoneyardSkeletonProps {
  loading: boolean;
  children: React.ReactNode;
  /** Custom preset layout to render instead of auto-generated content */
  variant?: 'auto' | 'card' | 'list' | 'chat' | 'board' | 'stats';
  /** Custom wrapper styling */
  className?: string;
  /** Multiplier for list or chat items to repeat */
  count?: number;
}

/**
 * Boneyard Skeleton Loading Framework
 * Auto-generates high-fidelity skeleton placeholders by parsing and matching React components.
 * Also provides high-performance preset loading states.
 */
export const BoneyardSkeleton: React.FC<BoneyardSkeletonProps> = ({
  loading,
  children,
  variant = 'auto',
  className = '',
  count = 1,
}) => {
  if (!loading) return <>{children}</>;

  // Preset 1: Standard Card Skeleton
  if (variant === 'card') {
    return (
      <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-neutral-850 rounded w-1/3" />
            <div className="h-2.5 bg-neutral-850 rounded w-2/3" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-neutral-850 rounded w-full" />
          <div className="h-3 bg-neutral-850 rounded w-5/6" />
          <div className="h-3 bg-neutral-850 rounded w-2/3" />
        </div>
        <div className="h-10 bg-neutral-850 rounded-xl w-full mt-4" />
      </div>
    );
  }

  // Preset 2: List Skeleton
  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-neutral-900/50 border border-neutral-850 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-neutral-800 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-neutral-800 rounded w-1/4" />
                <div className="h-2 bg-neutral-850 rounded w-1/2" />
              </div>
            </div>
            <div className="w-16 h-8 bg-neutral-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Preset 3: Chat Skeleton (for Coach AI messages)
  if (variant === 'chat') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div key={idx} className={`flex items-start gap-2.5 animate-pulse ${isEven ? '' : 'flex-row-reverse'}`}>
              <div className="w-7 h-7 bg-neutral-800 rounded-full shrink-0" />
              <div className={`p-3 rounded-2xl max-w-[80%] space-y-2 ${isEven ? 'bg-neutral-900 rounded-tl-none' : 'bg-blue-600/10 rounded-tr-none'}`}>
                <div className={`h-2.5 bg-neutral-800 rounded ${isEven ? 'w-24' : 'w-16 ml-auto'}`} />
                <div className="h-3 bg-neutral-800 rounded w-48" />
                <div className="h-3 bg-neutral-800 rounded w-36" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Preset 4: Chess Board Grid Skeleton
  if (variant === 'board') {
    return (
      <div className={`aspect-square w-full bg-neutral-950 border border-neutral-850 rounded-xl p-1 animate-pulse flex flex-col justify-between ${className}`}>
        {Array.from({ length: 8 }).map((_, rIdx) => (
          <div key={rIdx} className="flex-1 flex justify-between">
            {Array.from({ length: 8 }).map((_, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              return (
                <div
                  key={cIdx}
                  className={`flex-1 aspect-square m-[0.5px] rounded-sm ${
                    isDark ? 'bg-neutral-900/60' : 'bg-neutral-850/40'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Preset 5: Stats Screen Skeleton
  if (variant === 'stats') {
    return (
      <div className={`space-y-6 animate-pulse ${className}`}>
        {/* Profile Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-neutral-800 rounded-2xl" />
          <div className="space-y-3 flex-1 w-full text-center md:text-left">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mx-auto md:mx-0" />
            <div className="h-3 bg-neutral-850 rounded w-1/4 mx-auto md:mx-0" />
            <div className="h-10 bg-neutral-850/50 rounded-xl w-2/3 mx-auto md:mx-0 mt-2" />
          </div>
        </div>
        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 h-44" />
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 h-44" />
        </div>
      </div>
    );
  }

  // Preset 6 (Default): Recursively auto-generate skeleton shadow from active children!
  const convertToSkeleton = (node: React.ReactNode, index: number = 0): React.ReactNode => {
    if (node === null || node === undefined) return null;

    // String/Number Leaf Text Node: convert to shimmering line
    if (typeof node === 'string' || typeof node === 'number') {
      const textLength = String(node).trim().length;
      if (textLength === 0) return null;
      const widthPercent = textLength > 40 ? 'w-full' : textLength > 20 ? 'w-3/4' : textLength > 10 ? 'w-1/2' : 'w-1/4';
      return (
        <span
          key={`text-sk-${index}`}
          className={`inline-block h-3 bg-neutral-800/80 rounded animate-pulse ${widthPercent} min-w-[40px]`}
        />
      );
    }

    if (React.isValidElement(node)) {
      const { type, props } = node;

      // Handle specific tag types
      if (type === 'img') {
        return (
          <div
            key={`img-sk-${index}`}
            className={`bg-neutral-800 animate-pulse rounded-lg inline-block ${props.className || 'w-10 h-10'}`}
            style={props.style}
          />
        );
      }

      if (type === 'button') {
        return (
          <div
            key={`btn-sk-${index}`}
            className={`bg-neutral-800/90 animate-pulse rounded-xl inline-block ${props.className || 'h-9 w-24'}`}
            style={props.style}
          />
        );
      }

      if (type === 'h1' || type === 'h2' || type === 'h3' || type === 'h4' || type === 'h5' || type === 'h6') {
        const hHeight = type === 'h1' ? 'h-5' : type === 'h2' ? 'h-4' : 'h-3';
        return (
          <div key={`h-sk-${index}`} className="py-1 w-full">
            <div className={`bg-neutral-800 animate-pulse rounded ${hHeight} w-3/4`} />
          </div>
        );
      }

      // If there are children, recursively parse and map them
      if (props && props.children) {
        const convertedChildren = React.Children.map(props.children, (child, cIdx) => 
          convertToSkeleton(child, cIdx)
        );

        return React.cloneElement(node as React.ReactElement<any>, {
          ...props,
          key: `container-sk-${index}`,
          onClick: undefined,
          onChange: undefined,
          onSubmit: undefined,
          disabled: true,
          children: convertedChildren,
          className: `${props.className || ''} pointer-events-none select-none duration-150`.trim(),
        });
      }

      // Leaf icons or custom tags
      const hasIconClass = props.className && (props.className.includes('material-') || props.className.includes('lucide'));
      if (hasIconClass || type === 'svg') {
        return (
          <div key={`icon-sk-${index}`} className="w-5 h-5 bg-neutral-800/80 animate-pulse rounded-full inline-block" />
        );
      }

      if (type === 'input') {
        return (
          <div
            key={`input-sk-${index}`}
            className={`bg-neutral-950/40 border border-neutral-800/80 animate-pulse rounded-xl ${props.className || 'h-10 w-full'}`}
          />
        );
      }

      // Generic layout nodes: Clone structure and add pulse overlay
      return React.cloneElement(node as React.ReactElement<any>, {
        ...props,
        key: `generic-sk-${index}`,
        onClick: undefined,
        children: null,
        className: `${props.className || ''} bg-neutral-800/40 border border-neutral-850/50 animate-pulse pointer-events-none`.trim(),
      });
    }

    return node;
  };

  return (
    <div className={`pointer-events-none select-none ${className}`}>
      {React.Children.map(children, (child, idx) => convertToSkeleton(child, idx))}
    </div>
  );
};

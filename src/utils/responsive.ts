export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
}

export const RESPONSIVE_BREAKPOINTS = [
  { name: 'xxl', minWidth: BREAKPOINTS.xxl },
  { name: 'xl', minWidth: BREAKPOINTS.xl },
  { name: 'lg', minWidth: BREAKPOINTS.lg },
  { name: 'md', minWidth: BREAKPOINTS.md },
  { name: 'sm', minWidth: BREAKPOINTS.sm },
  { name: 'xs', minWidth: BREAKPOINTS.xs }
]

export function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth

  if (width >= BREAKPOINTS.xxl) return 'xxl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

export function isBreakpoint(breakpoint: Breakpoint): boolean {
  return getCurrentBreakpoint() === breakpoint
}

export function isAboveBreakpoint(breakpoint: Breakpoint): boolean {
  return window.innerWidth >= BREAKPOINTS[breakpoint]
}

export function isBelowBreakpoint(breakpoint: Breakpoint): boolean {
  return window.innerWidth < BREAKPOINTS[breakpoint]
}

export function onBreakpointChange(
  callback: (breakpoint: Breakpoint) => void
): () => void {
  let currentBreakpoint = getCurrentBreakpoint()

  const handler = () => {
    const newBreakpoint = getCurrentBreakpoint()
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint
      callback(newBreakpoint)
    }
  }

  window.addEventListener('resize', handler)

  return () => window.removeEventListener('resize', handler)
}

export const isMobile = () => window.innerWidth < 768
export const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024
export const isDesktop = () => window.innerWidth >= 1024
export const isWideScreen = () => window.innerWidth >= 1280

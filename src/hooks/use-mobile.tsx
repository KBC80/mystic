import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with a consistent value (e.g., false for desktop-first)
  // to prevent hydration mismatch.
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // This effect runs only on the client, after hydration.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Set the actual value on the client after mount
    onChange(); 
    mql.addEventListener("change", onChange)
    
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array ensures this runs once on mount

  return isMobile
}

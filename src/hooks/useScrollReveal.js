import { useEffect, useRef, useState } from 'react'

// Drives the signature blur-to-sharp scroll reveal. Attach the returned ref
// to a whole section wrapper (never to individual text nodes — the design
// spec calls for animating sections, not every element, to avoid jank).
// Returns [ref, isVisible] — isVisible flips to true once the element enters
// the viewport, and stays true (the reveal only happens once per element).
export function useScrollReveal({ threshold = 0.15 } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

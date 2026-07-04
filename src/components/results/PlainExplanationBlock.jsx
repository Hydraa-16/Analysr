// PlainExplanationBlock — plain-language text, primary and default visible.
// Larger type, written for zero medical background. Always renders above
// the medical block per the dual-language spec (plain first, medical second).

function PlainExplanationBlock({ text, blurred = false }) {
  if (!text) return null

  return (
    <p
      className={`text-base text-text-primary leading-relaxed transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
    >
      {text}
    </p>
  )
}

export default PlainExplanationBlock

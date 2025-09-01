export default function ScrollTopButton({ show }) {
  if (!show) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 bg-[#F6AD55] text-white p-3 rounded-full shadow-lg hover:bg-orange-500 transition"
      aria-label="Scroll to top"
    >
      <i className="ph ph-caret-up" />
    </button>
  )
}

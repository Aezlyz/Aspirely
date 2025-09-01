export default function FaqItem({ q, a, html, open, onToggle }) {
  return (
    <div className="rounded-xl bg-blue-50/60 border border-blue-100 shadow-sm">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left px-5 py-4"
      >
        <span className="font-medium">{q}</span>
        <span className={`text-[#F6AD55] text-xl font-bold transition-transform ${open ? 'rotate-90' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 -mt-1 text-sm text-gray-700">
          {html ? <p dangerouslySetInnerHTML={{ __html: a }} /> : <p>{a}</p>}
        </div>
      )}
    </div>
  )
}

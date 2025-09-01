// src/components/FeatureCard.jsx
import { Compass, Lightbulb, GraduationCap, FileText, Circle } from "lucide-react";

const ICONS = {
  compass: Compass,
  lightbulb: Lightbulb,
  "graduation-cap": GraduationCap,
  "file-text": FileText,
};

export default function FeatureCard({ icon = "circle", title, text }) {
  const Icon = ICONS[icon] ?? Circle;

  return (
    <article className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </article>
  );
}

import Link from 'next/link';

const features = [
  {
    title: 'Reading Assessment',
    desc: 'Read paragraphs aloud and get scored on accuracy, fluency, and pronunciation.',
    href: '/reading',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    gradient: 'from-blue-500 to-blue-600',
    badge: 'New',
  },
  {
    title: 'Pronunciation',
    desc: 'Practice tricky words with AI feedback on your pronunciation.',
    href: '/pronunciation',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Translation',
    desc: 'Translate between English and Hindi using your voice.',
    href: '/translate',
    icon: 'M3 5h12M9 3v2m0 4h6m-6 4h4m-4 4h2M3 19h18',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Conversation',
    desc: 'Practice English conversations with an AI partner on any topic.',
    href: '/conversation',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Interview Prep',
    desc: 'Practice interview questions with role-specific AI feedback.',
    href: '/interview',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    gradient: 'from-red-500 to-red-600',
  },
  {
    title: 'Grammar Practice',
    desc: 'Master English grammar with adaptive Hindi-to-English exercises.',
    href: '/exercises',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    gradient: 'from-pink-500 to-pink-600',
    badge: 'New',
  },
  {
    title: 'History',
    desc: 'Review your past practice sessions and track your progress.',
    href: '/history',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    gradient: 'from-gray-500 to-gray-600',
  },
];

export default function Home() {
  return (
    <div>
      <div className="text-center mb-10 pt-4 animate-fadeIn">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          SpeakBetter
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-lg">
          Improve your English speaking, pronunciation, and grammar with AI-powered feedback.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
          <Link
            key={f.title}
            href={f.href}
            className="group relative block p-5 rounded-2xl border border-gray-200/80 bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-200 animate-slideUp"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {f.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">
                {f.badge}
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </div>
            <h2 className="font-semibold text-base mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

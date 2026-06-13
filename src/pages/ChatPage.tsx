import type { UserProfile } from '../types'
import ChatWindow from '../components/ChatWindow'
 
interface ChatPageProps {
  profile: UserProfile
}
 
export default function ChatPage({ profile }: ChatPageProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] max-h-[850px] space-y-4">
      {/* Context banner */}
      <div 
        className="p-3.5 rounded-2xl flex items-center justify-between animate-fade-in-up"
        style={{ 
          background: 'linear-gradient(135deg, rgba(99,119,255,0.08), rgba(168,85,247,0.06))',
          border: '1px solid rgba(99,119,255,0.12)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6377ff] animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase select-none" style={{ color: 'var(--text-secondary)' }}>
            Chatting as a <span className="text-[#6377ff]">{profile.examType}</span> student
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-60">Empathetic Mode Active</span>
      </div>
 
      {/* Full screen ChatWindow */}
      <div className="flex-1 min-h-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ChatWindow examType={profile.examType} studentName={profile.name} />
      </div>
    </div>
  )
}

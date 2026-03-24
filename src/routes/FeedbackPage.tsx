import { useState } from 'react';
import { useNavigate } from 'react-router';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import MessageSquareHeart from 'lucide-react/dist/esm/icons/message-square-heart';
import { cn } from '@/lib/utils';

const RATING_OPTIONS = [
 { id: 'easy', label: 'Mudah banget', emoji: '😄' },
 { id: 'okay', label: 'Lumayan', emoji: '🙂' },
 { id: 'confusing', label: 'Ada yang bikin bingung', emoji: '😕' },
] as const;

type RatingId = (typeof RATING_OPTIONS)[number]['id'];

export default function FeedbackPage() {
 const navigate = useNavigate();
 const [selectedRating, setSelectedRating] = useState<RatingId | null>(null);
 const [feedback, setFeedback] = useState('');
 const [email, setEmail] = useState('');
 const [submitted, setSubmitted] = useState(false);

 const placeholderByRating: Record<RatingId, string> = {
  easy: 'Fitur apa yang paling kamu suka?',
  okay: 'Apa yang bisa kami tingkatkan?',
  confusing: 'Apa yang bikin ribet / membingungkan?',
 };

 const handleSubmit = () => {
  console.log({ rating: selectedRating, feedback, email });
  setSubmitted(true);
 };

 if (submitted) {
  return (
   <main className="bg-[#f6f8f6] min-h-dvh max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center gap-4">
    <div className="size-16 rounded-full bg-[rgba(19,236,91,0.2)] flex items-center justify-center">
     <CheckCircle2 className="size-8 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900">Terima kasih!</h2>
    <p className="text-slate-500">
     Feedback kamu sudah kami terima. Terima kasih sudah membantu kami menjadi
     lebih baik.
    </p>
    <button
     type="button"
     onClick={() => navigate('/')}
     className="mt-4 text-green-600 font-semibold text-base cursor-pointer"
    >
     Kembali ke Beranda
    </button>
   </main>
  );
 }

 return (
  <main className="bg-white min-h-dvh max-w-lg mx-auto flex flex-col">
   {/* Top App Bar */}
   <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-100 flex items-center px-4 py-4">
    <button
     type="button"
     onClick={() => navigate('/')}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer"
    >
     <ArrowLeft className="size-4 text-slate-900" />
    </button>
    <div className="flex-1 pr-10 text-center">
     <h1 className="text-lg font-bold text-slate-900 tracking-[-0.45px]">
      Feedback
     </h1>
    </div>
   </header>

   {/* Content */}
   <div className="flex-1 flex flex-col gap-8 px-6 pt-8 pb-14">
    {/* Header Section */}
    <div className="flex flex-col items-center gap-5">
     <div className="size-16 rounded-full bg-[rgba(19,236,91,0.2)] flex items-center justify-center">
      <MessageSquareHeart className="size-6 text-green-600" />
     </div>
     <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 leading-[30px]">
       Gimana pengalaman pakai
       <br />
       app ini?
      </h2>
      <p className="text-sm text-slate-500 mt-2">
       Masukan kamu sangat berarti untuk kami.
      </p>
     </div>
    </div>

    {/* Rating Buttons */}
    <div className="flex flex-col gap-3">
     {RATING_OPTIONS.map((option) => {
      const isSelected = selectedRating === option.id;
      return (
       <button
        key={option.id}
        type="button"
        onClick={() => setSelectedRating(option.id)}
        className={cn(
         'flex items-center justify-between p-[18px] rounded-xl border-2 cursor-pointer transition-colors',
         isSelected
          ? 'bg-[rgba(19,236,91,0.1)] border-[#13ec5b]'
          : 'bg-slate-50 border-slate-100 hover:border-slate-200',
        )}
       >
        <span className="text-base font-semibold text-slate-900">
         {option.emoji} {option.label}
        </span>
        <CheckCircle2
         className={cn(
          'size-5 transition-colors',
          isSelected ? 'text-green-600' : 'text-slate-200',
         )}
        />
       </button>
      );
     })}
    </div>

    {/* Feedback Area — shown after selecting a rating */}
    {selectedRating && (
     <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
       <label className="text-base font-semibold text-slate-900">
        Boleh cerita sedikit?
       </label>
       <label className="text-sm text-slate-500">Opsional</label>
       <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={placeholderByRating[selectedRating]}
        className="w-full min-h-[140px] rounded-xl border border-slate-200 bg-white p-4 text-base placeholder:text-slate-400 placeholder:font-semibold resize-none focus:outline-none focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b]"
       />
      </div>

      <div className="flex flex-col gap-1">
       <label className="text-base font-semibold text-slate-900">Email</label>
       <p className="text-sm text-slate-500 leading-5">
        Opsional. Kalau perlu tanya lebih lanjut, kami bisa hubungi kamu.
       </p>
       <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nama@email.com"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-[19px] text-base placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b]"
       />
      </div>
     </div>
    )}

    {/* Footer */}
    {selectedRating && (
     <div className="flex flex-col gap-6 pt-4">
      <p className="text-lg font-bold text-slate-900 text-center">
       Terima kasih 🙌
      </p>
      <p className="text-md font-semibold text-slate-600 text-center">
       Kami baca semua feedback 👀
      </p>
      <button
       type="button"
       onClick={handleSubmit}
       className="w-full py-4 rounded-xl bg-[#13ec5b] text-lg font-bold text-slate-900 cursor-pointer shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)] hover:brightness-95 transition-all"
      >
       Kirim Feedback
      </button>
     </div>
    )}
   </div>
  </main>
 );
}

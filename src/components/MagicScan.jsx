import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, playBubble, speakWord } from '../utils/audio';
import { WordCardImage } from './MainHub';

export default function MagicScan({ word, onNext, onBack }) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [scanCompleted, setScanCompleted] = useState(false);
  const [showRipples, setShowRipples] = useState([]);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  // 1초 완성 롱프레스 핸들러
  const handleStart = (e) => {
    e.preventDefault();
    if (scanCompleted) return;

    setIsPressing(true);
    setProgress(0);
    playBubble();
    
    startTimeRef.current = Date.now();

    // 애니메이션 프레임으로 정밀하게 1초 동안 게이지 채우기
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / 1000) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        triggerSuccess();
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleEnd = () => {
    if (scanCompleted) return;
    
    setIsPressing(false);
    setProgress(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // 1초 스캔 완료 시 트리거
  const triggerSuccess = () => {
    setScanCompleted(true);
    setIsPressing(false);
    setProgress(100);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // 마법 사운드 및 피드백
    playChime();
    
    // 폭죽 효과 (Confetti)
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff7597', '#d6c5f8', '#ffd859', '#a2e8dd', '#a3daff']
    });

    // 마법 리플 이펙트
    setShowRipples(prev => [...prev, Date.now()]);

    // TTS 읽어주기 (단어와 설명)
    speakWord(word.text, () => {
      // 단어 명칭 완료 후 설명 읽기
      setTimeout(() => {
        speakWord(word.desc || `${word.text}! 참 재밌는 단어예요!`);
      }, 500);
    });
  };

  // 다시 스캔
  const handleReset = () => {
    setScanCompleted(false);
    setProgress(0);
    speakWord("다시 한 번 스캔해보자!");
  };

  useEffect(() => {
    // 첫 로딩 시 안내 방송
    speakWord("글자나 그림을 일 초 동안 꾹 눌러봐! 마법이 일어날 거야!");
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.speechSynthesis.cancel();
    };
  }, [word]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 백그라운드 리플 렌더러 */}
      {showRipples.map(id => (
        <div key={id} className="magic-ripple" style={{ left: 'calc(50% - 125px)', top: 'calc(45% - 125px)' }} />
      ))}

      {/* 상단 툴바 */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', px: '20px' }}>
        <button className="kids-btn kids-btn-lavender" onClick={onBack}>
          ← 돌아가기
        </button>
        <div style={{
          background: 'white',
          padding: '8px 24px',
          borderRadius: '20px',
          fontSize: '1.2rem',
          color: '#634fa6',
          border: '2px solid var(--lavender)'
        }}>
          마법 스캔 단계 🔍
        </div>
        <div style={{ width: '100px' }}></div> {/* 균형용 빈 태그 */}
      </div>

      {/* 중앙: 대형 매직 카드 */}
      <div
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        style={{
          width: '320px',
          height: '420px',
          background: scanCompleted 
            ? 'linear-gradient(135deg, #ffffff 0%, #fff0f5 100%)'
            : isPressing 
              ? 'linear-gradient(135deg, #fffcf0 0%, #ffe6ee 100%)'
              : 'white',
          border: scanCompleted
            ? '6px solid var(--pink-primary)'
            : isPressing
              ? '6px solid var(--yellow)'
              : '6px solid var(--lavender)',
          borderRadius: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          boxShadow: scanCompleted ? '0 15px 35px rgba(255, 117, 151, 0.3)' : 'var(--shadow-md)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
          transform: isPressing ? 'scale(0.96)' : scanCompleted ? 'scale(1.02)' : 'scale(1)',
          touchAction: 'none'
        }}
      >
        {/* 원형 마법 게이지 테두리 */}
        {isPressing && (
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
            <rect
              x="6"
              y="6"
              width="308"
              height="408"
              rx="34"
              fill="none"
              stroke="var(--pink-primary)"
              strokeWidth="8"
              strokeDasharray="1432" // (308 + 408) * 2 = 1432
              strokeDashoffset={1432 - (1432 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
        )}

        {/* 상단 장식 별 */}
        <div style={{ display: 'flex', gap: '8px', color: scanCompleted ? 'var(--pink-primary)' : '#ddd' }}>
          <Sparkles className={isPressing ? 'float-effect' : ''} />
          <Sparkles />
          <Sparkles className={isPressing ? 'float-effect' : ''} />
        </div>

        {/* 큰 일러스트 이미지 / 아이콘 */}
        <div style={{
          transform: isPressing ? 'scale(1.1) rotate(10deg)' : 'scale(1)',
          transition: 'transform 0.2s',
          filter: scanCompleted ? 'drop-shadow(0 8px 12px rgba(255,117,151,0.25))' : 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <WordCardImage word={word} size={130} />
        </div>

        {/* 대형 글자 */}
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 'bold',
          color: scanCompleted ? 'var(--pink-dark)' : '#4a3e4d',
          letterSpacing: '4px',
          textShadow: scanCompleted ? '0 4px 10px rgba(255, 117, 151, 0.2)' : 'none'
        }}>
          {word.text}
        </div>

        {/* 스캔 완료 아이콘 혹은 안내 */}
        <div style={{ height: '30px', display: 'flex', alignItems: 'center' }}>
          {scanCompleted ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playBubble();
                speakWord(word.text);
              }}
              style={{
                background: 'var(--pink-light)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pink-primary)',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={20} />
            </button>
          ) : (
            <span style={{ fontSize: '1.2rem', color: isPressing ? 'var(--pink-primary)' : '#a594a9' }}>
              {isPressing ? '마법을 모으는 중... ✨' : '여기를 1초 꾹~ 누르기'}
            </span>
          )}
        </div>
      </div>

      {/* 하단 제어부 및 메 Mascot 안내 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        zIndex: 5
      }}>
        {/* 요정 메시지 */}
        <div style={{
          background: 'white',
          padding: '12px 24px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-sm)',
          border: '2px solid rgba(255,117,151,0.15)',
          maxWidth: '500px',
          textAlign: 'center',
          fontSize: '1.2rem',
          color: '#634fa6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🧚 <b>로롱 요정:</b>
          <span>
            {scanCompleted 
              ? `우와! 글자 요술이 풀렸어! "${word.text}"이(가) 나타났네!`
              : isPressing 
                ? '좋아 좋아! 손가락을 떼지 말고 조금만 더 꾹~ 눌러줘!'
                : '카드를 1초 동안 꾹~ 눌러서 숨겨진 목소리를 찾아봐!'}
          </span>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {scanCompleted && (
            <>
              <button className="kids-btn kids-btn-lavender" onClick={handleReset}>
                <RotateCcw size={20} /> 다시 스캔하기
              </button>
              <button
                className="kids-btn kids-btn-pink"
                style={{
                  fontSize: '1.4rem',
                  padding: '12px 32px',
                  boxShadow: '0 8px 0 var(--pink-dark)',
                  animation: 'magicPulse 1.5s infinite'
                }}
                onClick={onNext}
              >
                글자 쓰러 가기! <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

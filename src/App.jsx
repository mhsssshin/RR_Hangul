import React, { useState } from 'react';
import MainHub from './components/MainHub';
import MagicScan from './components/MagicScan';
import DynamicTracing from './components/DynamicTracing';
import StickerBoard from './components/StickerBoard';
import Gallery from './components/Gallery';
import { Sparkles, Award } from 'lucide-react';
import { playBubble, playSuccess, speakWord } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  const [screen, setScreen] = useState('hub'); // 'hub', 'scan', 'trace', 'stickers', 'gallery'
  const [basket, setBasket] = useState([]); // 학습 바구니 단어들
  const [currentIdx, setCurrentIdx] = useState(0); // 현재 학습 중인 단어의 인덱스
  const [showAllClearModal, setShowAllClearModal] = useState(false);

  const activeWord = basket[currentIdx];

  // 놀이 시작
  const handleStartLearning = () => {
    if (basket.length === 0) return;
    setCurrentIdx(0);
    setScreen('scan');
  };

  // 마법 스캔 완료 -> 글자 쓰기로 이동
  const handleScanComplete = () => {
    setScreen('trace');
  };

  // 글자 쓰기 완료 -> 스티커판 꾸미기로 이동
  const handleTraceComplete = () => {
    setScreen('stickers');
  };

  // 스티커판 꾸미기 완료 -> 다음 단어 혹은 올클리어 처리
  const handleStickersComplete = () => {
    if (currentIdx < basket.length - 1) {
      // 다음 단어로 이동
      setCurrentIdx(currentIdx + 1);
      setScreen('scan');
    } else {
      // 바구니 내 모든 단어 완료
      triggerAllClear();
    }
  };

  // 바구니의 모든 단어를 다 공부했을 때
  const triggerAllClear = () => {
    playSuccess();
    
    // 폭죽 연속 발사
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff7597', '#ffd859']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a2e8dd', '#a3daff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setShowAllClearModal(true);
    speakWord("축하합니다! 오늘 담은 단어 바구니를 모두 완성했어요! 대단해!");
  };

  const handleCloseAllClear = () => {
    playBubble();
    setShowAllClearModal(false);
    setBasket([]); // 학습 완료 후 바구니 비우기
    setScreen('hub');
  };

  return (
    <div className="app-container">
      {/* 글로벌 상단 헤더 */}
      <header className="app-header">
        <div className="logo-section" onClick={() => {
          playBubble();
          setScreen('hub');
        }}>
          <span style={{ fontSize: '2.5rem' }}>🧚‍♀️</span>
          <h1 className="logo-text">로롱한글</h1>
        </div>
        
        {/* 상단 현재 학습 요약 (메인이 아닐 때만 노출) */}
        {screen !== 'hub' && screen !== 'gallery' && activeWord && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '6px 20px',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: '2.5px solid var(--pink-soft)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>{activeWord.icon}</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--pink-dark)', fontWeight: 'bold' }}>
              공부 중: {activeWord.text} ({currentIdx + 1}/{basket.length})
            </span>
          </div>
        )}

        <div className="header-buttons">
          {screen !== 'hub' && (
            <button className="kids-btn kids-btn-lavender" onClick={() => {
              playBubble();
              setScreen('hub');
            }}>
              처음으로 🏠
            </button>
          )}
        </div>
      </header>

      {/* 스크린 전환 뷰 */}
      <main className="app-content">
        {screen === 'hub' && (
          <MainHub
            basket={basket}
            setBasket={setBasket}
            onStart={handleStartLearning}
            onViewGallery={() => {
              playBubble();
              setScreen('gallery');
            }}
          />
        )}
        
        {screen === 'scan' && activeWord && (
          <MagicScan
            word={activeWord}
            onNext={handleScanComplete}
            onBack={() => {
              playBubble();
              setScreen('hub');
            }}
          />
        )}

        {screen === 'trace' && activeWord && (
          <DynamicTracing
            word={activeWord}
            onNext={handleTraceComplete}
            onBack={() => {
              playBubble();
              setScreen('scan');
            }}
          />
        )}

        {screen === 'stickers' && activeWord && (
          <StickerBoard
            word={activeWord}
            onNext={handleStickersComplete}
            onBackToHub={() => {
              playBubble();
              setScreen('hub');
            }}
          />
        )}

        {screen === 'gallery' && (
          <Gallery
            onBack={() => {
              playBubble();
              setScreen('hub');
            }}
          />
        )}
      </main>

      {/* 최종 올클리어 축하 모달 */}
      {showAllClearModal && (
        <div className="kids-modal-overlay">
          <div className="kids-modal" style={{ border: '6px solid var(--yellow)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🏆</div>
            <h3>참 잘했어요! 한글 박사님!</h3>
            <p>오늘 바구니에 담은 한글 단어를 모두 마스터했어요!</p>
            <div style={{
              background: '#fffdeb',
              border: '2px dashed var(--yellow)',
              borderRadius: '24px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center'
            }}>
              {basket.map(word => (
                <span key={word.id} style={{
                  fontSize: '1.3rem',
                  background: 'white',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #ffe89e'
                }}>
                  {word.icon} {word.text}
                </span>
              ))}
            </div>
            <button
              className="kids-btn kids-btn-pink"
              style={{
                fontSize: '1.4rem',
                padding: '14px 48px',
                borderRadius: '20px',
                boxShadow: '0 8px 0 var(--pink-dark)',
                animation: 'magicPulse 1.5s infinite'
              }}
              onClick={handleCloseAllClear}
            >
              야호! 신난다! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

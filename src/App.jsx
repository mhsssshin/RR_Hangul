import React, { useState } from 'react';
import MainHub from './components/MainHub';
import MagicScan from './components/MagicScan';
import DynamicTracing from './components/DynamicTracing';
import StickerBoard from './components/StickerBoard';
import Gallery from './components/Gallery';
import ProfileSetup from './components/ProfileSetup';
import CategorySelect from './components/CategorySelect';
import { Sparkles, Award } from 'lucide-react';
import { playBubble, playSuccess, speakWord } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('rorong_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem('rorong_profile');
    return saved ? 'modes' : 'profile';
  });
  
  const [basket, setBasket] = useState([]); // 학습 바구니 단어들
  const [activeMode, setActiveMode] = useState(null); // 'custom' 또는 선택 테마
  const [currentIdx, setCurrentIdx] = useState(0); // 현재 학습 중인 단어의 인덱스
  const [showAllClearModal, setShowAllClearModal] = useState(false);
  const [threshold, setThreshold] = useState(75); // 쓰기 민감도 난이도 (55: 쉬움, 75: 보통, 90: 꼼꼼히)
  const [drawnWordPaths, setDrawnWordPaths] = useState([]); // 아동이 음절별로 직접 그린 글자 궤적들

  const activeWord = basket[currentIdx];

  // 프로필 설정 완료 시
  const handleProfileComplete = (newProfile) => {
    setProfile(newProfile);
    setScreen('modes');
  };

  // 프로필 리셋 (이름 수정)
  const handleResetProfile = () => {
    localStorage.removeItem('rorong_profile');
    setProfile(null);
    setScreen('profile');
  };

  // 모드 선택 완료 시
  const handleSelectMode = (selectedList) => {
    if (selectedList === null) {
      // 내가 직접 고르는 바구니 모드 진입
      setActiveMode('custom');
      setBasket([]);
      setScreen('hub');
    } else {
      // 특정 카테고리 자동 바구니 학습 모드 진입
      setActiveMode('selected');
      setBasket(selectedList);
      setCurrentIdx(0);
      setScreen('scan'); // 스캔으로 즉시 시작!
    }
  };

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
  const handleTraceComplete = (paths) => {
    setDrawnWordPaths(paths);
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
    speakWord("축하합니다! 오늘 선택한 한글 단어 카드를 모두 완성했어요! 대단해!");
  };

  const handleCloseAllClear = () => {
    playBubble();
    setShowAllClearModal(false);
    setBasket([]); // 학습 완료 후 바구니 비우기
    setActiveMode(null);
    setScreen('modes'); // 다시 테마 선택창으로 이동
  };

  return (
    <div className="app-container">
      {/* 글로벌 상단 헤더 */}
      <header className="app-header">
        <div className="logo-section" onClick={() => {
          playBubble();
          setScreen(profile ? 'modes' : 'profile');
        }}>
          <span style={{ fontSize: '2.5rem' }}>🧚‍♀️</span>
          <h1 className="logo-text">로롱한글</h1>
        </div>
        
        {/* 상단 현재 학습 요약 (메인/프로필이 아닐 때만 노출) */}
        {screen !== 'hub' && screen !== 'gallery' && screen !== 'profile' && screen !== 'modes' && activeWord && (
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
          {/* 난이도 설정 (학습 중일 때만 노출하여 인체공학적 피복률 유도) */}
          {screen !== 'profile' && screen !== 'modes' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              border: '2px solid rgba(255, 117, 151, 0.15)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#634fa6', fontFamily: 'var(--font-kids)' }}>난이도:</span>
              <button
                onClick={() => { playBubble(); setThreshold(55); speakWord("쉬운 한글 쓰기!"); }}
                style={{
                  padding: '2px 8px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', cursor: 'pointer',
                  background: threshold === 55 ? 'var(--mint)' : 'transparent',
                  color: threshold === 55 ? 'white' : '#4a3e4d',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: threshold === 55 ? 'bold' : 'normal'
                }}
              >
                쉬움
              </button>
              <button
                onClick={() => { playBubble(); setThreshold(75); speakWord("보통 한글 쓰기!"); }}
                style={{
                  padding: '2px 8px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', cursor: 'pointer',
                  background: threshold === 75 ? 'var(--yellow)' : 'transparent',
                  color: threshold === 75 ? '#8c6b00' : '#4a3e4d',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: threshold === 75 ? 'bold' : 'normal'
                }}
              >
                보통
              </button>
              <button
                onClick={() => { playBubble(); setThreshold(90); speakWord("꼼꼼한 한글 쓰기!"); }}
                style={{
                  padding: '2px 8px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', cursor: 'pointer',
                  background: threshold === 90 ? 'var(--pink-soft)' : 'transparent',
                  color: threshold === 90 ? 'white' : '#4a3e4d',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: threshold === 90 ? 'bold' : 'normal'
                }}
              >
                꼼꼼히
              </button>
            </div>
          )}

          {screen !== 'modes' && screen !== 'profile' && (
            <button className="kids-btn kids-btn-lavender" onClick={() => {
              playBubble();
              setScreen('modes');
            }}>
              처음으로 🏠
            </button>
          )}
        </div>
      </header>

      {/* 스크린 전환 뷰 */}
      <main className="app-content">
        {screen === 'profile' && (
          <ProfileSetup onComplete={handleProfileComplete} />
        )}

        {screen === 'modes' && (
          <CategorySelect
            profile={profile}
            onSelectMode={handleSelectMode}
            onResetProfile={handleResetProfile}
          />
        )}

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
              setScreen(activeMode === 'custom' ? 'hub' : 'modes');
            }}
          />
        )}

        {screen === 'trace' && activeWord && (
          <DynamicTracing
            word={activeWord}
            threshold={threshold}
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
            drawnWordPaths={drawnWordPaths}
            onNext={handleStickersComplete}
            onBackToHub={() => {
              playBubble();
              setScreen(activeMode === 'custom' ? 'hub' : 'modes');
            }}
          />
        )}

        {screen === 'gallery' && (
          <Gallery
            onBack={() => {
              playBubble();
              setScreen('modes');
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

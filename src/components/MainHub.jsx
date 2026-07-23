import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Sparkles, Heart } from 'lucide-react';
import { playBubble, speakWord } from '../utils/audio';

const DEFAULT_WORDS = [
  { id: '1', text: '엄마', icon: '👩', desc: '엄마! 나를 가장 사랑하는 우리 엄마예요!' },
  { id: '2', text: '아빠', icon: '👨', desc: '아빠! 든든하고 다정한 우리 아빠예요!' },
  { id: '3', text: '토끼', icon: '🐰', desc: '토끼! 깡충깡충 귀여운 토끼예요!' },
  { id: '4', text: '사과', icon: '🍎', desc: '사과! 새콤달콤 빨간 사과예요!' },
  { id: '5', text: '나비', icon: '🦋', desc: '나비! 팔랑팔랑 꽃밭을 날아다녀요!' },
  { id: '6', text: '우주', icon: '🚀', desc: '우주! 별들이 반짝이는 신비한 우주예요!' },
  { id: '7', text: '사랑', icon: '💖', desc: '사랑! 따뜻하고 행복한 하트 사랑이에요!' },
  { id: '8', text: '노래', icon: '🎵', desc: '노래! 신나게 랄랄라 부르는 노래예요!' },
  { id: '9', text: '바다', icon: '🌊', desc: '바다! 철썩철썩 푸르고 넓은 바다예요!' },
  { id: '10', text: '로롱', icon: '🧚', desc: '로롱! 한글 나라의 꼬마 요정 친구예요!' },
  { id: '11', text: '아기', icon: '👶', desc: '아기! 방긋방긋 웃는 귀여운 아기예요!' },
  { id: '12', text: '하늘', icon: '🌤️', desc: '하늘! 파랗고 뭉게구름이 떠 있는 예쁜 하늘이에요!' },
  { id: '13', text: '자동차', icon: '🚗', desc: '자동차! 빵빵 달리는 멋진 자동차예요!' },
  { id: '14', text: '꽃', icon: '🌸', desc: '꽃! 알록달록 예쁘고 향기로운 꽃이에요!' },
  { id: '15', text: '사자', icon: '🦁', desc: '사자! 어흥 소리 내는 멋진 동물의 왕 사자예요!' },
  { id: '16', text: '무지개', icon: '🌈', desc: '무지개! 하늘에 일곱 색깔 무지개가 떴어요!' },
  { id: '17', text: '과자', icon: '🍪', desc: '과자! 바삭바삭 맛있는 달콤한 과자예요!' },
  { id: '18', text: '원숭이', icon: '🐵', desc: '원숭이! 바나나를 좋아하는 장난꾸러기 원숭이예요!' },
  { id: '19', text: '별', icon: '⭐', desc: '별! 밤하늘에 반짝반짝 빛나는 별이에요!' },
  { id: '20', text: '햇님', icon: '☀️', desc: '햇님! 아침에 둥실 떠서 따뜻하게 비춰주는 햇님이에요!' },
  { id: '21', text: '수박', icon: '🍉', desc: '수박! 시원하고 달콤한 여름 과일 초록 수박이에요!' },
  { id: '22', text: '기차', icon: '🚂', desc: '기차! 칙칙폭폭 길게 달리는 기차예요!' },
  { id: '23', text: '우산', icon: '🌂', desc: '우산! 비 오는 날 비를 막아주는 고마운 우산이에요!' },
  { id: '24', text: '물고기', icon: '🐟', desc: '물고기! 물속에서 헤엄치는 예쁜 물고기예요!' }
];

const EMOJI_OPTIONS = ['🍎', '🐰', '🦋', '🚀', '💖', '👑', '🦄', '🦖', '🚗', '🍦', '🧸', '👩', '👨', '🧚', '🐱', '🐶'];

export default function MainHub({ basket, setBasket, onStart, onViewGallery }) {
  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('rorong_custom_words');
    return saved ? [...DEFAULT_WORDS, ...JSON.parse(saved)] : DEFAULT_WORDS;
  });
  
  const [newText, setNewText] = useState('');
  const [newIcon, setNewIcon] = useState('👑');
  const [showCreator, setShowCreator] = useState(false);

  // 단어 클릭 시 바구니에 담고 발음 들려주기
  const handleWordClick = (word) => {
    addToBasket(word);
  };

  // 단어 바구니에 담기
  const addToBasket = (word) => {
    if (basket.some(item => item.id === word.id)) {
      speakWord("이미 바구니에 있는 단어예요!");
      return;
    }
    playBubble();
    setBasket([...basket, word]);
    speakWord(word.text); // 담을 때 소리 내어 말하기
  };

  const removeFromBasket = (wordId) => {
    playBubble();
    setBasket(basket.filter(item => item.id !== wordId));
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, word) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(word));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const word = JSON.parse(e.dataTransfer.getData('text/plain'));
      addToBasket(word);
    } catch (err) {
      console.error(err);
    }
  };

  // 커스텀 단어 등록
  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    
    const newWord = {
      id: 'custom_' + Date.now(),
      text: newText.trim(),
      icon: newIcon,
      desc: `${newText.trim()}! 내가 직접 만든 예쁜 단어예요!`
    };

    const saved = localStorage.getItem('rorong_custom_words');
    const customList = saved ? JSON.parse(saved) : [];
    const updated = [...customList, newWord];
    localStorage.setItem('rorong_custom_words', JSON.stringify(updated));

    setLibrary([...DEFAULT_WORDS, ...updated]);
    addToBasket(newWord);
    setNewText('');
    setShowCreator(false);
    
    speakWord(`${newWord.text} 단어가 생겼어요!`);
  };

  return (
    <div className="hub-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 타이틀 및 갤러리 링크 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#ff5c8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#ffd859" fill="#ffd859" />
            안녕, 로롱! 오늘 어떤 단어를 만나볼까?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#8c7694', marginTop: '4px' }}>
            그림을 누르면 단어 소리가 나요! 바구니로 드래그하거나 [+]를 눌러 담아보세요.
          </p>
        </div>
        <button className="kids-btn kids-btn-lavender" onClick={onViewGallery}>
          우리들 갤러리 🖼️
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* 왼쪽: 단어 도서관 */}
        <div style={{
          flex: 1.3,
          background: 'rgba(255, 255, 255, 0.45)',
          borderRadius: '32px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid rgba(255, 255, 255, 0.6)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.4rem', color: '#634fa6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={24} /> 단어 도서관
            </span>
            <button
              className="kids-btn kids-btn-pink"
              style={{ padding: '6px 16px', fontSize: '1rem', borderRadius: '15px' }}
              onClick={() => setShowCreator(true)}
            >
              단어 만들기 ✍️
            </button>
          </div>

          <div className="app-content" style={{ padding: 0, overflowY: 'auto' }}>
            <div className="words-grid">
              {library.map((word) => {
                const isInBasket = basket.some(item => item.id === word.id);
                return (
                  <div
                    key={word.id}
                    className="word-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, word)}
                    onClick={() => handleWordClick(word)}
                    style={{
                      background: isInBasket ? 'var(--pink-light)' : 'white',
                      borderColor: isInBasket ? 'var(--pink-soft)' : 'rgba(255,255,255,0.9)'
                    }}
                  >
                    <span className="word-icon">{word.icon}</span>
                    <span className="word-text">{word.text}</span>
                    {isInBasket && (
                      <span className="word-badge">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오른쪽: 오늘의 학습 바구니 */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            flex: 0.7,
            background: 'linear-gradient(180deg, #fffcf3 0%, #fff7d6 100%)',
            border: '4px dashed var(--yellow)',
            borderRadius: '32px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.03)',
            position: 'relative'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#aa820a', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              🧺 오늘의 학습 바구니
            </h3>
            <p style={{ fontSize: '1rem', color: '#c0a24b' }}>여기에 공부할 카드를 쏙 담아주세요</p>
          </div>

          <div style={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignContent: 'flex-start',
            justifyContent: 'center',
            padding: '8px'
          }}>
            {basket.length === 0 ? (
              <div style={{
                margin: 'auto',
                textAlign: 'center',
                color: '#dcd0a5',
                fontSize: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Heart size={48} strokeWidth={1.5} color="#e0d7b2" />
                <span>바구니가 텅 비었어요!</span>
              </div>
            ) : (
              basket.map((word) => (
                <div
                  key={word.id}
                  className="word-card float-effect"
                  style={{
                    width: '110px',
                    height: '110px',
                    padding: '8px',
                    gap: '4px',
                    border: '2px solid white',
                    boxShadow: '0 6px 12px rgba(220,180,60,0.15)'
                  }}
                >
                  <span className="word-icon" style={{ fontSize: '2.5rem' }}>{word.icon}</span>
                  <span className="word-text" style={{ fontSize: '1.2rem' }}>{word.text}</span>
                  <button
                    onClick={() => removeFromBasket(word.id)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d63e65',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 시작 버튼 */}
          <button
            className="kids-btn kids-btn-pink"
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '1.6rem',
              borderRadius: '24px',
              marginTop: '16px',
              animation: basket.length > 0 ? 'magicPulse 2s infinite' : 'none'
            }}
            onClick={() => {
              if (basket.length === 0) {
                speakWord("바구니에 공부할 단어를 먼저 담아주세요!");
              } else {
                onStart();
              }
            }}
          >
            놀이 시작하기! 🪄
          </button>
        </div>
      </div>

      {/* 단어 만들기 팝업 모달 */}
      {showCreator && (
        <div className="kids-modal-overlay" onClick={() => setShowCreator(false)}>
          <div className="kids-modal" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ 나만의 단어 만들기</h3>
            <p>공부하고 싶은 단어와 마음에 드는 그림을 골라보세요!</p>
            <form onSubmit={handleCreateCustom}>
              <input
                type="text"
                maxLength={6}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="예: 내이름, 초코, 루피"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '1.4rem',
                  borderRadius: '16px',
                  border: '3px solid var(--pink-soft)',
                  fontFamily: 'var(--font-kids)',
                  textAlign: 'center',
                  marginBottom: '20px',
                  outline: 'none'
                }}
                autoFocus
              />

              {/* 이모지 선택 */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '1.2rem', color: '#634fa6', display: 'block', marginBottom: '10px' }}>
                  아이콘 그림 고르기
                </span>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: '#f9f6fc',
                  borderRadius: '16px',
                  border: '1px solid #eedcff'
                }}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        playBubble();
                        setNewIcon(emoji);
                      }}
                      style={{
                        fontSize: '1.8rem',
                        background: newIcon === emoji ? 'var(--lavender)' : 'white',
                        border: newIcon === emoji ? '2px solid #9a65f8' : '2px solid transparent',
                        borderRadius: '12px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      className={newIcon === emoji ? 'float-effect' : ''}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="kids-btn kids-btn-lavender"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setShowCreator(false)}
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="kids-btn kids-btn-pink"
                  style={{ flex: 1, padding: '12px' }}
                >
                  만들기 완료! ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

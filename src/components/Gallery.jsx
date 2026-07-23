import React, { useState, useEffect } from 'react';
import { Trash2, ArrowLeft, Heart, Calendar } from 'lucide-react';
import { playBubble, speakWord } from '../utils/audio';
import { WordCardImage } from './MainHub';

const BACKGROUNDS = [
  { css: 'linear-gradient(135deg, #ffeef2 0%, #ffc5d3 100%)' },
  { css: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' },
  { css: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }
];

export default function Gallery({ onBack }) {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('rorong_gallery');
    if (saved) {
      setBoards(JSON.parse(saved));
    }
    speakWord("우리들이 예쁘게 꾸민 갤러리에 온 걸 환영해!");
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    playBubble();
    if (confirm("정말 이 스티커판을 삭제할까요?")) {
      const updated = boards.filter(b => b.id !== id);
      setBoards(updated);
      localStorage.setItem('rorong_gallery', JSON.stringify(updated));
      speakWord("스티커판이 지워졌어요!");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '10px 0'
    }}>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 10px' }}>
        <button className="kids-btn kids-btn-lavender" onClick={onBack}>
          <ArrowLeft size={18} /> 메인으로 가기
        </button>
        <h2 style={{ fontSize: '2rem', color: '#634fa6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🖼️ 로롱 한글 우리들 갤러리
        </h2>
        <div style={{ width: '120px' }}></div>
      </div>

      {/* 메인 갤러리 앨범 스크롤 영역 */}
      <div className="app-content" style={{ flex: 1, padding: '10px' }}>
        {boards.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80%',
            color: '#a594a9',
            gap: '16px',
            textAlign: 'center'
          }}>
            <Heart size={64} color="#ffb8c6" strokeWidth={1.5} />
            <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-kids)' }}>
              아직 완성된 스티커판이 없어요.<br />
              한글 공부를 마치고 첫 스티커판을 자랑해 보세요!
            </span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px',
            paddingBottom: '24px'
          }}>
            {boards.map((board) => (
              <div
                key={board.id}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  border: '3px solid #eee',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  cursor: 'default',
                  position: 'relative'
                }}
                className="gallery-frame"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.borderColor = 'var(--pink-soft)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#eee';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* 캔버스 축소형 복원 렌더러 */}
                <div style={{
                  height: '210px',
                  background: BACKGROUNDS[board.bgIdx]?.css || 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  borderBottom: '2px dashed #ddd',
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                  // 540x420 실제 크기를 290x210 비율로 배율 축소하여 표시
                  // 축소 배율: 약 0.5
                }}>
                  {board.stickers?.map((sticker) => {
                    const scaleFactor = 0.52; // 축소 비율
                    const x = sticker.x * scaleFactor;
                    const y = sticker.y * scaleFactor;
                    const scale = sticker.scale * scaleFactor;
 
                    if (sticker.isMain) {
                      return (
                        <div
                          key={sticker.id}
                          style={{
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: `translate(-50%, -50%) scale(${scale}) rotate(${sticker.rotation}deg)`,
                            width: '160px',
                            background: 'white',
                            borderRadius: '24px',
                            border: '3px solid var(--pink-soft)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            pointerEvents: 'none'
                          }}
                        >
                          <WordCardImage word={sticker} size={50} />
                          <span style={{ fontSize: '1.8rem', color: 'var(--pink-dark)', marginTop: '4px', fontWeight: 'bold' }}>
                            {sticker.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={sticker.id}
                        style={{
                          position: 'absolute',
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: `translate(-50%, -50%) scale(${scale}) rotate(${sticker.rotation}deg)`,
                          fontSize: '3.8rem',
                          pointerEvents: 'none'
                        }}
                      >
                        {sticker.char}
                      </div>
                    );
                  })}
                </div>

                {/* 하단 설명 카드 정보 */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '1.4rem',
                      color: 'var(--pink-dark)',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {board.wordIcon} {board.wordText} 카드
                    </span>
                    <button
                      onClick={(e) => handleDelete(board.id, e)}
                      style={{
                        background: '#fff2f4',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pink-dark)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ffdce2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff2f4'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#8c7694' }}>
                    <Calendar size={14} />
                    <span>{board.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

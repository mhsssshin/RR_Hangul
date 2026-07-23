import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Save, ArrowRight, RefreshCw, X, Trash } from 'lucide-react';
import { playBubble, playSuccess, speakWord } from '../utils/audio';
import confetti from 'canvas-confetti';
import { WordCardImage } from './MainHub';

const STICKERS = [
  { char: '👑', label: '왕관' },
  { char: '💖', label: '하트' },
  { char: '🐰', label: '토끼' },
  { char: '🌟', label: '빛나는별' },
  { char: '🌈', label: '무지개' },
  { char: '🎈', label: '풍선' },
  { char: '🧸', label: '곰인형' },
  { char: '🦄', label: '유니콘' },
  { char: '🪄', label: '요술봉' },
  { char: '🎀', label: '리본' }
];

const BACKGROUNDS = [
  { name: '핑크 솜사탕 🌸', css: 'linear-gradient(135deg, #ffeef2 0%, #ffc5d3 100%)' },
  { name: '하늘 구름나라 ☁️', css: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' },
  { name: '보라 은하수 ✨', css: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }
];

export default function StickerBoard({ word, onNext, onBackToHub }) {
  const [bgIdx, setBgIdx] = useState(0);
  const [placedStickers, setPlacedStickers] = useState([
    // 기본적으로 학습한 글자와 아이콘이 메인 스티커로 가운데 배치되어 있음
    {
      id: 'main',
      char: word.icon,
      text: word.text, // 한글 텍스트 포함
      image: word.image, // 고품질 실사/일러스트 이미지 URL 보존
      x: 180,
      y: 160,
      scale: 1.6,
      rotation: 0,
      isMain: true
    }
  ]);
  const [activeId, setActiveId] = useState(null);
  const canvasAreaRef = useRef(null);

  // 드래그 제어용 상태
  const dragInfo = useRef({
    isDragging: false,
    isRotating: false,
    startX: 0,
    startY: 0,
    startScale: 1,
    startRotation: 0,
    offsetX: 0,
    offsetY: 0
  });

  useEffect(() => {
    speakWord("글자 공부 완료! 스티커판을 예쁘게 꾸며보자!");
  }, [word]);

  // 스티커 추가
  const addSticker = (emoji) => {
    playBubble();
    const newSticker = {
      id: 'sticker_' + Date.now(),
      char: emoji,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      scale: 1.0,
      rotation: 0
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setActiveId(newSticker.id);
  };

  // 삭제
  const deleteSticker = (id, e) => {
    e.stopPropagation();
    playBubble();
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  // 폰터 인터랙션 시작
  const handlePointerDown = (id, e) => {
    e.stopPropagation();
    setActiveId(id);
    const sticker = placedStickers.find(s => s.id === id);
    if (!sticker) return;

    const areaRect = canvasAreaRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    dragInfo.current = {
      isDragging: true,
      isRotating: false,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - (sticker.x + areaRect.left),
      offsetY: clientY - (sticker.y + areaRect.top)
    };
  };

  // 로테이션/스케일 조작 시작
  const handleRotateStart = (id, e) => {
    e.stopPropagation();
    const sticker = placedStickers.find(s => s.id === id);
    if (!sticker) return;

    const areaRect = canvasAreaRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // 스티커 중심점 구하기
    const centerX = sticker.x + areaRect.left;
    const centerY = sticker.y + areaRect.top;

    // 각도 및 거리 초기화
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const startAngle = Math.atan2(dy, dx);
    const startDist = Math.sqrt(dx * dx + dy * dy);

    dragInfo.current = {
      isDragging: false,
      isRotating: true,
      centerX,
      centerY,
      startAngle,
      startDist,
      startScale: sticker.scale,
      startRotation: sticker.rotation
    };
  };

  // 폰터 이동
  const handlePointerMove = (e) => {
    if (!activeId) return;

    const sticker = placedStickers.find(s => s.id === activeId);
    if (!sticker) return;

    const areaRect = canvasAreaRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (dragInfo.current.isDragging) {
      // 드래그 이동 (경계면 제한)
      let newX = clientX - areaRect.left - dragInfo.current.offsetX;
      let newY = clientY - areaRect.top - dragInfo.current.offsetY;

      // 캔버스 밖으로 나가지 못하게 제한
      newX = Math.max(20, Math.min(areaRect.width - 20, newX));
      newY = Math.max(20, Math.min(areaRect.height - 20, newY));

      setPlacedStickers(prev => prev.map(s => s.id === activeId ? { ...s, x: newX, y: newY } : s));
    } else if (dragInfo.current.isRotating) {
      // 회전 및 스케일 동시 조작
      const dx = clientX - dragInfo.current.centerX;
      const dy = clientY - dragInfo.current.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const dAngle = angle - dragInfo.current.startAngle;
      const dDistRatio = dist / dragInfo.current.startDist;

      const newRotation = dragInfo.current.startRotation + (dAngle * 180) / Math.PI;
      const newScale = Math.max(0.4, Math.min(3.0, dragInfo.current.startScale * dDistRatio));

      setPlacedStickers(prev => prev.map(s => s.id === activeId ? {
        ...s,
        rotation: newRotation,
        scale: newScale
      } : s));
    }
  };

  const handlePointerUp = () => {
    dragInfo.current.isDragging = false;
    dragInfo.current.isRotating = false;
  };

  // 갤러리에 완성 보드 저장
  const handleSave = () => {
    playSuccess();
    
    // 로컬 스토리지에 구조화된 보드 데이터 저장
    const newBoard = {
      id: 'board_' + Date.now(),
      wordText: word.text,
      wordIcon: word.icon,
      bgIdx: bgIdx,
      stickers: placedStickers,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const saved = localStorage.getItem('rorong_gallery');
    const galleryList = saved ? JSON.parse(saved) : [];
    localStorage.setItem('rorong_gallery', JSON.stringify([newBoard, ...galleryList]));

    // 축하 꽃가루
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    speakWord("우와! 정말 예쁜 칭찬 스티커판이 완성되었어! 갤러리에 저장 완료!");
    alert("갤러리에 저장되었어요! 부모님 자랑용 갤러리 화면에서 확인할 수 있습니다.");
  };

  // 캔버스 외부 클릭 시 포커스 해제
  const deselectSticker = () => {
    setActiveId(null);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        position: 'relative'
      }}
    >
      {/* 상단 컨트롤 */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <button className="kids-btn kids-btn-lavender" onClick={onBackToHub}>
          🏠 메인화면
        </button>
        
        {/* 배경 체인저 */}
        <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd' }}>
          {BACKGROUNDS.map((bg, idx) => (
            <button
              key={idx}
              onClick={() => {
                playBubble();
                setBgIdx(idx);
              }}
              style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '0.9rem',
                border: bgIdx === idx ? '2px solid var(--pink-primary)' : '1px solid #eee',
                background: bgIdx === idx ? 'var(--pink-light)' : 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              {bg.name}
            </button>
          ))}
        </div>

        <button className="kids-btn kids-btn-yellow" onClick={handleSave}>
          <Save size={18} /> 자랑방에 저장! 🖼️
        </button>
      </div>

      {/* 꾸미기 캔버스 영역 */}
      <div
        ref={canvasAreaRef}
        onClick={deselectSticker}
        style={{
          width: '540px',
          height: '420px',
          background: BACKGROUNDS[bgIdx].css,
          borderRadius: '36px',
          border: '6px solid white',
          boxShadow: '0 15px 35px rgba(255, 117, 151, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default'
        }}
      >
        {/* 장식 문구 가이드 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(74, 62, 77, 0.4)',
          fontSize: '1.4rem',
          pointerEvents: 'none',
          fontFamily: 'var(--font-hand)'
        }}>
          ✨ 참 잘했어요! 나만의 한글 캔버스 ✨
        </div>

        {/* 스티커 렌더러 */}
        {placedStickers.map((sticker) => {
          const isActive = activeId === sticker.id;
          
          if (sticker.isMain) {
            // 중심 메인 카드 (한글 단어 카드)
            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handlePointerDown(sticker.id, e)}
                className={`sticker-element ${isActive ? 'sticker-active' : ''}`}
                style={{
                  left: `${sticker.x}px`,
                  top: `${sticker.y}px`,
                  transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                  width: '160px',
                  background: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                  border: '3px solid var(--pink-soft)',
                  flexDirection: 'column',
                  padding: '12px'
                }}
              >
                <WordCardImage word={sticker} size={50} />
                <span style={{ fontSize: '1.8rem', color: 'var(--pink-dark)', marginTop: '4px', fontWeight: 'bold' }}>
                  {sticker.text}
                </span>

                {/* 컨트롤러 (이동 전용이라 회전/크기 조정만 제공) */}
                {isActive && (
                  <div
                    className="sticker-control sticker-rotate"
                    onPointerDown={(e) => handleRotateStart(sticker.id, e)}
                  >
                    🔄
                  </div>
                )}
              </div>
            );
          }

          // 일반 칭찬 데코 스티커
          return (
            <div
              key={sticker.id}
              onPointerDown={(e) => handlePointerDown(sticker.id, e)}
              className={`sticker-element ${isActive ? 'sticker-active' : ''}`}
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                fontSize: '3.8rem',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
              }}
            >
              {sticker.char}

              {/* 딜리트 / 로테이션 컨트롤러 */}
              {isActive && (
                <>
                  <div
                    className="sticker-control sticker-delete"
                    onClick={(e) => deleteSticker(sticker.id, e)}
                  >
                    <X size={12} strokeWidth={4} />
                  </div>
                  <div
                    className="sticker-control sticker-rotate"
                    onPointerDown={(e) => handleRotateStart(sticker.id, e)}
                  >
                    🔄
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 스티커 선택 트레이 */}
      <div style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.5)',
        border: '2px solid rgba(255, 117, 151, 0.15)',
        borderRadius: '24px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.1rem', color: '#634fa6' }}>
          왕관, 하트, 토끼 스티커를 꾹~ 눌러 화면에 붙여보세요! 👇
        </span>
        
        {/* 스티커 목록 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          overflowX: 'auto',
          padding: '6px 8px',
          justifyContent: 'center'
        }}>
          {STICKERS.map((st) => (
            <button
              key={st.char}
              onClick={() => addSticker(st.char)}
              style={{
                fontSize: '2.5rem',
                background: 'white',
                border: '2px solid white',
                borderRadius: '16px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              className="float-effect"
            >
              {st.char}
            </button>
          ))}
        </div>
      </div>

      {/* 학습 완료 다음 단계 */}
      <button
        className="kids-btn kids-btn-pink"
        style={{
          fontSize: '1.4rem',
          padding: '14px 40px',
          borderRadius: '24px',
          boxShadow: '0 8px 0 var(--pink-dark)',
          animation: 'magicPulse 2s infinite'
        }}
        onClick={onNext}
      >
        학습 완료! 다음 놀이하러 가기 🌈
      </button>
    </div>
  );
}

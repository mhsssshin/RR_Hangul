import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Trash2, ArrowRight, Check } from 'lucide-react';
import { playBubble, playSuccess, speakWord } from '../utils/audio';
import confetti from 'canvas-confetti';

// 아동의 친필 드로잉 궤적을 SVG 패스 스트링으로 변환해 주는 헬퍼 함수
const getSvgPathData = (strokes, svgSize) => {
  if (!strokes || strokes.length === 0) return '';
  const scale = svgSize / 350; // CANVAS_SIZE(350) 기준
  return strokes.map(stroke => {
    if (stroke.length === 0) return '';
    const start = `M ${stroke[0].x * scale} ${stroke[0].y * scale}`;
    const lines = stroke.slice(1).map(pt => `L ${pt.x * scale} ${pt.y * scale}`).join(' ');
    return `${start} ${lines}`;
  }).join(' ');
};

export default function DynamicTracing({ word, threshold = 75, onNext, onBack }) {
  // 단어를 글자(음절) 단위로 쪼개기. 예: '사과' -> ['사', '과']
  const syllables = Array.from(word.text);
  const [currentIdx, setCurrentIdx] = useState(0);
  const char = syllables[currentIdx];

  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coverage, setCoverage] = useState(0); // 0 to 100
  const [completed, setCompleted] = useState(false);
  const [wordPaths, setWordPaths] = useState([]); // 각 음절별 드로잉 경로들

  // 파티클 (요술봉 별무리 효과)
  const particlesRef = useRef([]);
  const requestRef = useRef(null);

  // 오프스크린 캔버스 (한글 글자 마스크 및 사용자 드로잉 오버랩 계산용)
  const offscreenTextCanvasRef = useRef(null);
  const offscreenDrawCanvasRef = useRef(null);

  const CANVAS_SIZE = 350;

  // 글자 마스크 생성 및 그리기
  useEffect(() => {
    initCanvas();
    speakWord(`글자 "${char}"를 따라 써보자! 반짝반짝 요술봉을 움직여봐!`);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [char]);

  const initCanvas = () => {
    setCompleted(false);
    setCoverage(0);
    particlesRef.current = [];
    pathsRef.current = [];

    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    
    // 고해상도 지원을 위한 스케일링
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    bgCanvas.width = CANVAS_SIZE;
    bgCanvas.height = CANVAS_SIZE;

    // 1. 배경 가이드 글자 그리기 (연한 회색 점선 또는 투명 텍스트)
    bgCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 점선 그리드
    bgCtx.strokeStyle = 'rgba(255, 117, 151, 0.15)';
    bgCtx.lineWidth = 2;
    bgCtx.setLineDash([6, 6]);
    bgCtx.beginPath();
    bgCtx.moveTo(CANVAS_SIZE / 2, 0);
    bgCtx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
    bgCtx.moveTo(0, CANVAS_SIZE / 2);
    bgCtx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
    bgCtx.stroke();
    bgCtx.setLineDash([]);

    // 가이드 글자 렌더링
    bgCtx.fillStyle = '#f0edf5';
    bgCtx.font = 'bold 220px "Jua", sans-serif';
    bgCtx.textAlign = 'center';
    bgCtx.textBaseline = 'middle';
    bgCtx.fillText(char, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);

    // 테두리도 그려주기 (따라 쓰기 쉽게)
    bgCtx.strokeStyle = '#dcd5e8';
    bgCtx.lineWidth = 4;
    bgCtx.strokeText(char, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);

    // 2. 드로잉 캔버스 초기화
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 3. 오프스크린 캔버스 구축 (크기 100x100으로 줄여서 메모리/계산 최적화)
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 100;
    textCanvas.height = 100;
    const tCtx = textCanvas.getContext('2d');
    
    tCtx.fillStyle = 'black';
    tCtx.font = 'bold 64px "Jua", sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(char, 50, 52);
    offscreenTextCanvasRef.current = textCanvas;

    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = 100;
    drawCanvas.height = 100;
    offscreenDrawCanvasRef.current = drawCanvas;

    // 파티클 애니메이션 루프 시작
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animateParticles);
  };

  // 파티클(요술봉 요정 별) 생성
  const createSparkles = (x, y) => {
    const colors = ['#ffd859', '#ff7597', '#a2e8dd', '#a3daff', '#d6c5f8'];
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1, // 위쪽으로 살짝 뜨게
        alpha: 1,
        life: 0.8, // 0.8초 생존
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10
      });
    }
  };

  // 파티클 애니메이션 루프
  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 파티클 업데이트
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      p.angle += p.spin;
      p.life -= 0.02;

      if (p.life <= 0 || p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // 드로잉 캔버스 렌더링 주기
    // 파티클 지우고 다시 그리는 건 사용자 궤적은 남겨야 하므로 매 프레임 초기화하는 게 아니라,
    // 화면에 별무리만 그릴 수 있도록 캔버스를 어떻게 구조화할 것인가:
    // 실제 드로잉 라인은 canvas에 그리고, 파티클은 드로잉 라인을 망치지 않게 '사용자 드로잉 레이어'와 '파티클 레이어'를 분리하는 것이 좋습니다.
    // 하지만 단순하게 캔버스를 두 개 겹쳐놓거나 드로잉 패스를 매번 다시 그릴 수 있습니다.
    // 여기서는 사용자 드로잉 패스를 배열로 관리해서 매 프레임 [1. 클리어 -> 2. 드로잉 패스 선 그리기 -> 3. 별 파티클 그리기] 로 처리하여 고품질 그래픽을 구현합니다!
    redrawCanvas();

    requestRef.current = requestAnimationFrame(animateParticles);
  };

  // 드로잉 데이터 저장
  const pathsRef = useRef([]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. 사용자 드로잉 선 그리기
    ctx.strokeStyle = '#ff7597';
    ctx.lineWidth = 26; // 두껍게
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 네온 글로우 효과 추가
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 117, 151, 0.4)';

    pathsRef.current.forEach(path => {
      if (path.length < 1) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });

    // 섀도우 제거 (파티클에는 글로우 안 함)
    ctx.shadowBlur = 0;

    // 2. 반짝이 파티클 그리기
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;

      // 별 모양 그리기
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = p.size;
      const innerRadius = p.size / 2;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((clientY - rect.top) / rect.height) * CANVAS_SIZE
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (completed) return;
    setIsDrawing(true);
    const coord = getCoordinates(e);
    pathsRef.current.push([coord]);
    createSparkles(coord.x, coord.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || completed) return;
    const coord = getCoordinates(e);
    
    // 최근 선에 점 추가
    const currentPath = pathsRef.current[pathsRef.current.length - 1];
    if (currentPath) {
      currentPath.push(coord);
    }

    createSparkles(coord.x, coord.y);
    calculateCoverage();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 커버리지(따라 쓰기 비율) 계산
  const calculateCoverage = () => {
    const drawCanvas = offscreenDrawCanvasRef.current;
    const textCanvas = offscreenTextCanvasRef.current;
    if (!drawCanvas || !textCanvas) return;

    const dCtx = drawCanvas.getContext('2d');
    dCtx.clearRect(0, 0, 100, 100);

    // 유저의 캔버스 궤적을 100x100 오프스크린 캔버스로 스케일 다운해서 그리기
    dCtx.strokeStyle = 'white';
    dCtx.lineWidth = 7; // 브러쉬 번짐으로 인한 인접 셀 강제 충전을 막기 위해 판정 브러쉬 굵기를 축소 (기존 11)
    dCtx.lineCap = 'round';
    dCtx.lineJoin = 'round';

    pathsRef.current.forEach(path => {
      if (path.length < 1) return;
      dCtx.beginPath();
      // 좌표 축소 (CANVAS_SIZE -> 100)
      const scale = 100 / CANVAS_SIZE;
      dCtx.moveTo(path[0].x * scale, path[0].y * scale);
      for (let i = 1; i < path.length; i++) {
        dCtx.lineTo(path[i].x * scale, path[i].y * scale);
      }
      dCtx.stroke();
    });

    // 픽셀 검수
    const tCtx = textCanvas.getContext('2d');
    const textImgData = tCtx.getImageData(0, 0, 100, 100).data;
    const drawImgData = dCtx.getImageData(0, 0, 100, 100).data;

    // 16x16 그리드 분석 (격자를 더욱 촘촘하게 나누어 획 누락을 방지)
    const GRID_SIZE = 16;
    const CELL_PIXELS = 100 / GRID_SIZE; // 6.25 pixels
    
    let activeCells = 0;
    let hitCells = 0;
    
    // 3x3 구역별 조기 성공 버그 해결용 상태 맵
    const cellActive = Array(16).fill(0).map(() => Array(16).fill(false));
    const cellHit = Array(16).fill(0).map(() => Array(16).fill(false));
    
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        const startX = Math.floor(gx * CELL_PIXELS);
        const startY = Math.floor(gy * CELL_PIXELS);
        const endX = Math.min(Math.floor((gx + 1) * CELL_PIXELS), 100);
        const endY = Math.min(Math.floor((gy + 1) * CELL_PIXELS), 100);
        
        let textPixelCount = 0;
        let userHitPixelCount = 0;
        
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * 100 + x) * 4;
            const alphaText = textImgData[idx + 3];
            if (alphaText > 50) {
              textPixelCount++;
              const alphaDraw = drawImgData[idx + 3];
              if (alphaDraw > 50) {
                userHitPixelCount++;
              }
            }
          }
        }
        
        if (textPixelCount > 1) {
          activeCells++;
          cellActive[gy][gx] = true;
          if (userHitPixelCount / textPixelCount >= 0.25) {
            hitCells++;
            cellHit[gy][gx] = true;
          }
        }
      }
    }

    // 3x3 블록별 완전한 획 통과 체크 (구역이 존재하는데 사용자가 전혀 그리지 않은 부위가 있으면 성공 차단!)
    const BLOCK_RANGES = [
      { start: 0, end: 5 },
      { start: 6, end: 10 },
      { start: 11, end: 15 }
    ];

    let allBlocksMet = true;

    for (let by = 0; by < 3; by++) {
      for (let bx = 0; bx < 3; bx++) {
        const ry = BLOCK_RANGES[by];
        const rx = BLOCK_RANGES[bx];
        
        let blockActiveCells = 0;
        let blockHitCells = 0;
        
        for (let gy = ry.start; gy <= ry.end; gy++) {
          for (let gx = rx.start; gx <= rx.end; gx++) {
            if (cellActive[gy][gx]) {
              blockActiveCells++;
              if (cellHit[gy][gx]) {
                blockHitCells++;
              }
            }
          }
        }
        
        // 블록 내에 글씨가 유의미하게 존재하는 경우 (필수 구역)
        if (blockActiveCells >= 3) {
          // 해당 구역의 20% 이상을 칠해야 그 구역을 통과한 것으로 처리
          if (blockHitCells / blockActiveCells < 0.2) {
            allBlocksMet = false;
          }
        }
      }
    }

    if (activeCells > 0) {
      let pct = Math.floor((hitCells / activeCells) * 100);
      
      // 획을 빼먹은 구역이 있는 경우 진행률을 70%로 강제 제한하여 조기 통과 방지!
      if (!allBlocksMet) {
        pct = Math.min(pct, 70);
      }
      
      setCoverage(Math.min(pct, 100));
    }
  };

  // 아이가 손을 떼고 다 썼어요 버튼을 누르면 성공 체크 진행!
  const checkWriting = () => {
    playBubble();
    if (coverage >= threshold) {
      triggerSuccess();
    } else {
      speakWord("글자가 조금 덜 써졌어요! 연한 분홍색 글자를 요술봉으로 더 꼼꼼히 채워볼까요?");
    }
  };

  const triggerSuccess = () => {
    setCompleted(true);
    setIsDrawing(false);
    playSuccess();

    // 퐁퐁 팡 터지는 Confetti 축하
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ffd859', '#ff7597']
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#a2e8dd', '#a3daff']
    });

    speakWord(`${char} 쓰기 성공! 아주 멋져!`);
  };

  const clearCanvas = () => {
    playBubble();
    pathsRef.current = [];
    setCoverage(0);
    setCompleted(false);
    setTimeout(() => {
      initCanvas();
    }, 50);
  };

  // 다음 글자로 넘어가거나 스티커판으로 가기
  const handleProceed = () => {
    playBubble();
    
    const currentPaths = [...pathsRef.current];
    const updatedPaths = [...wordPaths];
    updatedPaths[currentIdx] = currentPaths;
    setWordPaths(updatedPaths);

    if (currentIdx < syllables.length - 1) {
      setCurrentIdx(currentIdx + 1);
      pathsRef.current = [];
      setCoverage(0);
      setCompleted(false);
      setTimeout(() => {
        initCanvas();
      }, 50);
    } else {
      onNext(updatedPaths); // 모든 음절을 다 썼으면 전체 친필 경로를 부모 컴포넌트로 전송!
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      position: 'relative'
    }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <button className="kids-btn kids-btn-lavender" onClick={onBack}>
          ← 스캔하기로 돌아가기
        </button>
        <div style={{
          background: 'white',
          padding: '8px 24px',
          borderRadius: '20px',
          fontSize: '1.2rem',
          color: '#634fa6',
          border: '2px solid var(--lavender)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span>한글 따라 쓰기 단계 ✍️</span>
          <span style={{
            background: 'var(--pink-primary)',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 8px',
            fontSize: '1rem'
          }}>
            {currentIdx + 1} / {syllables.length}
          </span>
        </div>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* 중앙: 가이드선 캔버스 */}
      <div style={{
        position: 'relative',
        width: `${CANVAS_SIZE}px`,
        height: `${CANVAS_SIZE}px`,
        background: 'white',
        borderRadius: '32px',
        border: completed ? '6px solid var(--mint)' : '6px solid var(--pink-soft)',
        boxShadow: completed ? '0 12px 30px rgba(162,232,221,0.3)' : 'var(--shadow-md)',
        overflow: 'hidden',
        touchAction: 'none'
      }}>
        {/* 가이드 글자 레이어 */}
        <canvas
          ref={bgCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />

        {/* 유저 드로잉 레이어 */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: completed ? 'default' : 'crosshair',
            touchAction: 'none'
          }}
        />

        {/* 완성 축하 체크 오버레이 */}
        {completed && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(162, 232, 221, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              border: '4px solid var(--mint)'
            }}>
              <Check size={48} color="var(--mint)" strokeWidth={4} />
            </div>
          </div>
        )}
      </div>

      {/* 단어 조립 진행 상태 (친필 글씨 누적 노출) */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px 0',
        background: 'rgba(255, 255, 255, 0.4)',
        padding: '10px 24px',
        borderRadius: '24px',
        border: '1.5px solid rgba(255, 255, 255, 0.6)'
      }}>
        {syllables.map((char, idx) => {
          const isWritten = idx < currentIdx;
          const isActive = idx === currentIdx;
          const syllableStrokes = wordPaths[idx] || [];

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '65px',
                height: '65px',
                background: isActive ? '#fffbfa' : 'white',
                borderRadius: '16px',
                border: isActive
                  ? '3px solid var(--pink-primary)'
                  : isWritten
                    ? '2px solid var(--mint)'
                    : '2px solid #ebdcf5',
                boxShadow: isActive ? '0 0 12px rgba(255,117,151,0.2)' : 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}
            >
              {/* 연한 가이드 텍스트 배경 (쓴 글자도 뒤에 살짝 보여서 가이드 제공) */}
              <span style={{
                position: 'absolute',
                fontSize: '2.2rem',
                color: isActive 
                  ? 'rgba(255, 117, 151, 0.15)' 
                  : isWritten 
                    ? 'rgba(162, 232, 221, 0.15)' 
                    : 'rgba(74, 62, 77, 0.08)',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 0
              }}>
                {char}
              </span>

              {/* 쓴 글자 (친필 드로잉 렌더링) */}
              {isWritten && (
                <svg width="100%" height="100%" viewBox="0 0 65 65" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
                  <path
                    d={getSvgPathData(syllableStrokes, 65)}
                    fill="none"
                    stroke="var(--pink-primary)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* 현재 쓰고 있는 글자 하이라이트 아이콘 */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  fontSize: '0.8rem',
                  background: 'var(--pink-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  ✏️
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 제어 및 피드백 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        zIndex: 5
      }}>
        {/* 학습 게이지 미터기 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '320px' }}>
          <span style={{ fontSize: '1.1rem', color: '#8c7694', whiteSpace: 'nowrap' }}>마법 충전:</span>
          <div style={{
            flex: 1,
            height: '20px',
            background: '#e8e3f0',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid white',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: `${coverage}%`,
              height: '100%',
              background: completed
                ? 'linear-gradient(90deg, var(--mint) 0%, #76ddcb 100%)'
                : 'linear-gradient(90deg, #ffaec4 0%, var(--pink-primary) 100%)',
              borderRadius: '10px',
              transition: 'width 0.1s ease-out'
            }} />
          </div>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: completed ? 'var(--mint)' : 'var(--pink-primary)',
            width: '100px',
            textAlign: 'right',
            whiteSpace: 'nowrap'
          }}>
            {coverage}% / {threshold}%
          </span>
        </div>

        {/* 요정의 칭찬 한마디 */}
        <div style={{
          background: 'white',
          padding: '12px 24px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-sm)',
          border: '2px solid rgba(162,232,221,0.25)',
          maxWidth: '500px',
          textAlign: 'center',
          fontSize: '1.2rem',
          color: '#4a3e4d',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🧚 <b>요술 가이드:</b>
          <span>
            {completed
              ? `참 잘했어요! "${char}" 글자가 반짝반짝 빛나요!`
              : coverage > 40
                ? '거의 다 채워졌어! 요술봉을 끝까지 움직여봐!'
                : '연한 분홍색 글자를 문지르듯이 요술봉으로 따라 그려봐!'}
          </span>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {!completed ? (
            <>
              <button className="kids-btn kids-btn-lavender" onClick={clearCanvas} style={{ fontSize: '1.2rem', padding: '12px 24px' }}>
                <Trash2 size={20} /> 지우기 🧼
              </button>
              <button
                className="kids-btn kids-btn-pink"
                style={{
                  fontSize: '1.3rem',
                  padding: '12px 28px',
                  boxShadow: '0 6px 0 var(--pink-dark)'
                }}
                onClick={checkWriting}
              >
                다 썼어요! 🪄
              </button>
            </>
          ) : (
            <button
              className="kids-btn kids-btn-mint"
              style={{
                fontSize: '1.4rem',
                padding: '12px 36px',
                animation: 'magicPulse 1.5s infinite',
                boxShadow: '0 8px 0 #3ebfa9'
              }}
              onClick={handleProceed}
            >
              {currentIdx < syllables.length - 1 
                ? '다음 글자 쓰러 가기! ✍️' 
                : '칭찬 스티커 붙이기! 👑'}
              <ArrowRight size={20} style={{ marginLeft: '6px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

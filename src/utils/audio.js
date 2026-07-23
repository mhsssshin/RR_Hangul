// Web Audio API 사운드 신디사이저 및 TTS 유틸리티

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 뾰로롱~ 마법의 요술봉 사운드 (Chime)
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // 도, 미, 솔, 높은 도 (C5, E5, G5, C6)
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.35);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// 보글보글 쏙! 귀여운 물방울 사운드 (Bubble/Pop)
export function playBubble() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// 빰빠밤! 성공 축하 사운드 (Success Fanfare)
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00], // C4 (도, 미, 솔)
      [349.23, 440.00, 523.25], // F4 (파, 라, 도)
      [523.25, 659.25, 783.99, 1046.50] // C5 아르페지오 마무리
    ];
    
    chords.forEach((freqs, chordIndex) => {
      const startTime = now + chordIndex * 0.25;
      const duration = chordIndex === 2 ? 0.6 : 0.2;
      
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// 한국어 어린이 톤을 흉내 낸 귀여운 TTS 읽어주기 (SpeechSynthesis)
export function speakWord(text, onEnd = null) {
  try {
    if ('speechSynthesis' in window) {
      // 진행중인 발음 모두 멈춤
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      
      // 목소리 피치와 속도 조절 (5세 아이에게 최적화)
      utterance.pitch = 1.45; // 높은 솔~라 톤의 아기자기한 음성 피치
      utterance.rate = 0.85;  // 단어를 정확하고 차분하게 들려줌
      
      // 한국어 전용 목소리 찾기 (선택사항)
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang.includes('ko-KR'));
      if (koVoice) {
        utterance.voice = koVoice;
      }
      
      if (onEnd) {
        utterance.onend = onEnd;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.error("SpeechSynthesis error:", e);
    if (onEnd) onEnd();
  }
}

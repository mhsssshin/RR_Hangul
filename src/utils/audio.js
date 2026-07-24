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

// 일레븐랩스(Bella 목소리)로 사전 생성한 정적 음원 매핑 테이블 (로컬 static 보관)
const TTS_FILE_MAP = {
  '안녕! 반가워! 한글 놀이를 하기 전에 너의 이름을 먼저 알려줘!': 'welcome_name.mp3',
  '너의 이름을 적어줘!': 'input_name.mp3',
  '와! 만나서 반가워 친구야! 우리 함께 재미있는 한글 놀이하러 출바알~!': 'let_go.mp3',
  '오늘 어떤 카드 방에 들어가 볼까? 마법의 한글 카드가 기다리고 있어!': 'select_room.mp3',
  '글자가 조금 덜 써졌어요! 연한 분홍색 글자를 요술봉으로 더 꼼꼼히 채워볼까요?': 'try_again.mp3',
  '우리들이 예쁘게 꾸민 갤러리에 온 걸 환영해!': 'welcome_gallery.mp3',
  '스티커판이 지워졌어요!': 'gallery_deleted.mp3',
  '글자 공부 완료! 스티커판을 예쁘게 꾸며보자!': 'sticker_start.mp3',
  '우와! 정말 예쁜 칭찬 스티커판이 완성되었어! 갤러리에 저장 완료!': 'sticker_save.mp3',
  '다시 한 번 스캔해보자!': 'scan_retry.mp3',
  '글자나 그림을 일 초 동안 꾹 눌러봐! 마법이 일어날 거야!': 'scan_hint.mp3',
  '바구니에 공부할 단어를 먼저 담아주세요!': 'basket_empty.mp3',
  '이미 바구니에 있는 단어예요!': 'already_in_basket.mp3',
  '축하합니다! 오늘 선택한 한글 단어 카드를 모두 완성했어요! 대단해!': 'all_clear.mp3',
  '쉬운 한글 쓰기!': 'easy_level.mp3',
  '보통 한글 쓰기!': 'normal_level.mp3',
  '꼼꼼한 한글 쓰기!': 'hard_level.mp3',
  // 카테고리 시작 멘트 7종
  '우리 가족 한글 쓰기 놀이를 시작하자!': 'start_family.mp3',
  '숲속 동물 친구들 한글 카드 방으로 출발!': 'start_animals.mp3',
  '재미있는 사물 단어 카드 방으로 출발!': 'start_objects.mp3',
  '샤방샤방 마법의 캐치 티니핑 카드 방으로 출발!': 'start_teenieping.mp3',
  '쿵쾅쿵쾅 공룡 나라 카드 방으로 출발!': 'start_dinosaurs.mp3',
  '어떤 단어가 나올까? 알쏭달쏭 랜덤 카드 방으로 출발!': 'start_random.mp3',
  '내가 직접 골라 담는 한글 바구니 방으로 출발!': 'start_custom.mp3',
  // 단순화된 가이드 멘트
  '화면에 글자를 따라 써보자!': 'trace_guide.mp3',
  '쓰기 성공! 아주 멋져!': 'trace_success.mp3',
  '새로운 단어가 생겼어요!': 'new_word_created.mp3',
  '참 재밌는 단어예요!': 'fun_word.mp3'
};

// 29종 단어 및 설명글 매핑 (로컬 mp3 매칭용)
const WORDS_DESC_MAP = {
  '사자': '사자! 멋진 갈기가 있고 으르렁 소리를 내는 동물의 왕 사자예요!',
  '호랑이': '호랑이! 멋진 주황색 줄무늬가 있는 용맹한 호랑이예요!',
  '코끼리': '코끼리! 코가 아주 길고 몸집이 커다란 회색 코끼리예요!',
  '토끼': '토끼! 긴 귀를 쫑긋거리며 깡충깡충 뛰어다니는 귀여운 토끼예요!',
  '기린': '기린! 목이 아주 길어서 높은 나뭇잎을 냠냠 먹는 기린이에요!',
  '원숭이': '원숭이! 나무를 잘 타고 바나나를 좋아하는 장난꾸러기 원숭이예요!',
  '판다': '판다! 눈 주변이 까맣고 맛있는 대나무를 좋아하는 둥글둥글 판다예요!',
  '곰': '곰! 꿀을 좋아하고 느릿느릿 걸어 다니지만 든든하고 큰 곰이에요!',
  '우산': '우산! 비가 올 때 머리 위에서 비를 막아주는 고마운 우산이에요!',
  '가방': '가방! 책과 필통을 쏙 넣어서 어깨에 매는 튼튼한 책가방이에요!',
  '모자': '모자! 눈부신 햇살로부터 얼굴을 지켜주는 예쁜 모자예요!',
  '시계': '시계! 째깍째깍 바쁘게 움직이며 지금 시간을 알려주는 시계예요!',
  '인형': '인형! 폭신폭신 부드러워서 안고 자면 잠이 솔솔 오는 곰인형이에요!',
  '안경': '안경! 눈앞에 있는 책과 글씨를 선명하게 잘 보이도록 돕는 안경이에요!',
  '신발': '신발! 발을 아프지 않게 감싸주어 마음껏 뛰놀 수 있게 하는 운동화예요!',
  '가위': '가위! 색종이를 싹둑싹둑 잘라 예쁜 모양을 만드는 놀이용 안전가위예요!',
  '하츄핑': '하츄핑! 사랑의 감정을 담아 요술을 부리는 귀여운 핑크빛 리더 하츄핑이에요!',
  '조아핑': '조아핑! 언제나 친절하고 다정한 미소로 친구들을 돕는 노란 조아핑이에요!',
  '방글핑': '방글핑! 웃음이 퐁퐁 솟아나며 신나게 폭죽을 터트리는 명랑한 방글핑이에요!',
  '믿어핑': '믿어핑! 굳센 신뢰와 우정으로 친구를 끝까지 믿어주는 푸른색 믿어핑이에요!',
  '포실핑': '포실핑! 새콤달콤 솜사탕처럼 부드럽고 새하얗고 순수한 마음의 포실핑이에요!',
  '샤샤핑': '샤샤핑! 시원한 아이스크림을 나눠주고 마음도 살살 녹여주는 달콤한 샤샤핑이에요!',
  '말랑핑': '말랑핑! 쫀득쫀득 달콤한 젤리처럼 귀여운 매력이 넘치는 말랑핑이에요!',
  '티라노': '티라노! 엄청 큰 이빨과 튼튼한 다리로 달리는 무서운 육식 공룡 티라노예요!',
  '트리케라': '트리케라! 이마에 3개의 큰 뿔이 나 있는 멋진 초식 공룡 트리케라톱스예요!',
  '브라키오': '브라키오! 목이 산만큼 아주아주 길어서 높은 나뭇잎을 냠냠 먹는 브라키오사우루스예요!',
  '스테고': '스테고! 등에 뾰족뾰족 단단한 뼈 판이 줄지어 솟아나 있는 꼬리뿔 공룡 스테고사우루스예요!',
  '프테라': '프테라! 커다란 날개뼈를 활짝 펴서 푸른 구름 사이를 씽씽 비행하는 하늘의 왕 프테라노돈이에요!',
  '벨로키': '벨로키! 몸집은 작지만 아주 날쌔고 영리해서 사냥을 척척 잘하는 벨로키라프토르예요!'
};

const SYLLABLES_SET = new Set([
  '사', '자', '호', '랑', '이', '코', '끼', '리', '토', '기', '린', '원', '숭', '판',
  '다', '곰', '우', '산', '가', '방', '모', '시', '계', '인', '형', '안', '경', '신',
  '발', '위', '하', '츄', '핑', '조', '아', '글', '믿', '어', '포', '실', '샤', '말',
  '티', '라', '노', '트', '케', '브', '키', '오', '스', '테', '고', '프', '벨', '로'
]);

let currentTtsAudio = null;

// 일레븐랩스 사전 생성 음원 우선 재생 및 가변 텍스트 브라우저 TTS 대체
export function speakWord(text, onEnd = null) {
  try {
    // 1. 기존 재생 중인 일레븐랩스 오디오가 있으면 중단
    if (currentTtsAudio) {
      currentTtsAudio.pause();
      currentTtsAudio = null;
    }
    
    // 2. 브라우저 TTS 발음 중단
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      if (onEnd) onEnd();
      return;
    }

    const baseUrl = import.meta.env.BASE_URL || '/';
    let audioUrl = null;

    // 1) 정적 문장 매핑 확인
    if (TTS_FILE_MAP[trimmedText]) {
      audioUrl = `${baseUrl}audio/tts/${TTS_FILE_MAP[trimmedText]}`;
    }
    // 2) 단어 매핑 확인
    else if (WORDS_DESC_MAP[trimmedText]) {
      audioUrl = `${baseUrl}audio/tts/words/${trimmedText}.mp3`;
    }
    // 3) 단어 설명글 매핑 확인
    else {
      const matchedWord = Object.keys(WORDS_DESC_MAP).find(w => WORDS_DESC_MAP[w] === trimmedText);
      if (matchedWord) {
        audioUrl = `${baseUrl}audio/tts/descriptions/${matchedWord}.mp3`;
      }
      // 4) 낱글자(음절) 매핑 확인
      else if (trimmedText.length === 1 && SYLLABLES_SET.has(trimmedText)) {
        audioUrl = `${baseUrl}audio/tts/syllables/${trimmedText}.mp3`;
      }
    }

    if (audioUrl) {
      // 로컬 음성 파일 재생
      const audio = new Audio(audioUrl);
      currentTtsAudio = audio;

      if (onEnd) {
        audio.onended = () => {
          if (currentTtsAudio === audio) {
            currentTtsAudio = null;
          }
          onEnd();
        };
      }

      audio.play().catch(err => {
        console.warn("ElevenLabs pre-rendered audio play failed:", err);
        if (onEnd) onEnd();
      });
    } else {
      // 5) 사용자 커스텀 글자/이름은 음성을 출력하지 않음 (브라우저 TTS 완전 배제)
      if (onEnd) onEnd();
    }
  } catch (e) {
    console.error("speakWord error:", e);
    if (onEnd) onEnd();
  }
}

// 브라우저 기본 TTS 완전 비활성화
function playBrowserTTS(text, onEnd) {
  if (onEnd) onEnd();
}

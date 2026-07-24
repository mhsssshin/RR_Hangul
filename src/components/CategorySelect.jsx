import React, { useEffect } from 'react';
import { Sparkles, Users, Award, BookOpen, Settings, Smile } from 'lucide-react';
import { playBubble, playChime, speakWord } from '../utils/audio';
import { ANIMAL_WORDS, OBJECT_WORDS, TEENIEPING_WORDS, DINOSAUR_WORDS } from '../utils/wordsData';

export default function CategorySelect({ profile, onSelectMode, onResetProfile }) {
  const childName = profile?.childName || '꼬마';

  useEffect(() => {
    speakWord("오늘 어떤 카드 방에 들어가 볼까? 마법의 한글 카드가 기다리고 있어!");
  }, []);

  const handleSelect = (modeKey) => {
    playChime();
    
    let selectedList = [];
    let announceText = "";

    switch(modeKey) {
      case 'family':
        // 가족 단어장 생성
        selectedList = [
          {
            id: 'fam_1',
            text: profile.childName,
            icon: '👶',
            image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400',
            desc: `${profile.childName}! 바로 세상에서 가장 소중하고 사랑스러운 나예요!`
          },
          {
            id: 'fam_2',
            text: profile.momName,
            icon: '👩',
            image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400',
            desc: `${profile.momName}! 나를 세상에서 제일 많이 안아주는 우리 엄마예요!`
          },
          {
            id: 'fam_3',
            text: profile.dadName,
            icon: '👨',
            image: 'https://images.unsplash.com/photo-1542382257-201b7f682e40?w=400',
            desc: `${profile.dadName}! 나랑 가장 재미있게 놀아주는 멋진 우리 아빠예요!`
          }
        ];
        announceText = "우리 가족 한글 쓰기 놀이를 시작하자!";
        break;
      case 'animals':
        selectedList = ANIMAL_WORDS;
        announceText = "숲속 동물 친구들 한글 카드 방으로 출발!";
        break;
      case 'objects':
        selectedList = OBJECT_WORDS;
        announceText = "재미있는 사물 단어 카드 방으로 출발!";
        break;
      case 'teenieping':
        selectedList = TEENIEPING_WORDS;
        announceText = "샤방샤방 마법의 캐치 티니핑 카드 방으로 출발!";
        break;
      case 'dinosaurs':
        selectedList = DINOSAUR_WORDS;
        announceText = "쿵쾅쿵쾅 공룡 나라 카드 방으로 출발!";
        break;
      case 'random':
        // 모든 리스트 섞어 무작위 8개 추출
        const all = [...ANIMAL_WORDS, ...OBJECT_WORDS, ...TEENIEPING_WORDS, ...DINOSAUR_WORDS];
        const shuffled = all.sort(() => 0.5 - Math.random());
        selectedList = shuffled.slice(0, 8);
        announceText = "어떤 단어가 나올까? 알쏭달쏭 랜덤 카드 방으로 출발!";
        break;
      case 'custom':
        // 선택 모드는 빈 바구니를 가진 메인 허브로 진입
        selectedList = null;
        announceText = "내가 직접 골라 담는 한글 바구니 방으로 출발!";
        break;
      default:
        break;
    }

    speakWord(announceText);
    onSelectMode(selectedList); // 부모 컴포넌트에 단어 세트 전달
  };

  const categories = [
    {
      key: 'family',
      title: '우리 가족 쓰기 👨‍👩‍👧',
      desc: `${profile?.childName || '나'}, 엄마, 아빠 이름을 써보아요`,
      color: 'linear-gradient(135deg, #ffeef2 0%, #ffc5d3 100%)',
      border: '#ff9bb5',
      icon: '🏠'
    },
    {
      key: 'animals',
      title: '동물 친구들 🦁',
      desc: '사자, 코끼리, 토끼 등 신비한 동물들의 이름',
      color: 'linear-gradient(135deg, #fffcf3 0%, #fff7d6 100%)',
      border: '#ffea8f',
      icon: '🦒'
    },
    {
      key: 'objects',
      title: '방 안의 사물 🧸',
      desc: '우산, 가방, 안경 등 자주 쓰는 물건들의 이름',
      color: 'linear-gradient(135deg, #effaf8 0%, #cbf2ec 100%)',
      border: '#a2e8dd',
      icon: '🎒'
    },
    {
      key: 'teenieping',
      title: '캐치 티니핑 ✨',
      desc: '하츄핑, 조아핑, 포실핑 등 마법 요정 이름',
      color: 'linear-gradient(135deg, #fbf2ff 0%, #eedaff 100%)',
      border: '#e3daff',
      icon: '💖'
    },
    {
      key: 'dinosaurs',
      title: '공룡 나라 🦖',
      desc: '티라노, 트리케라 등 거대한 공룡들의 이름',
      color: 'linear-gradient(135deg, #ebf8ff 0%, #cdeeff 100%)',
      border: '#a3daff',
      icon: '🦕'
    },
    {
      key: 'random',
      title: '랜덤 카드 쓰기 🎲',
      desc: '어떤 글자가 나타날까? 알쏭달쏭 뽑기 놀이',
      color: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '#86efac',
      icon: '🧩'
    },
    {
      key: 'custom',
      title: '내가 고르기 🧺',
      desc: '단어 도서관에서 원하는 글자만 바구니에 쏙!',
      color: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      border: '#ffedd5',
      icon: '🧺'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '10px 0'
    }}>
      {/* 상단 웰컴 배너 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'rgba(255, 255, 255, 0.45)',
        padding: '16px 32px',
        borderRadius: '24px',
        border: '2px solid rgba(255, 255, 255, 0.6)'
      }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--pink-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile color="var(--pink-primary)" fill="var(--pink-light)" size={32} />
            {childName}아, 오늘 어떤 한글 놀이 카드를 열어볼까?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#8c7694', marginTop: '4px' }}>
            마음에 드는 문을 누르면 신기한 그림 카드 방이 열려요!
          </p>
        </div>
        <button
          className="kids-btn kids-btn-lavender"
          style={{ display: 'flex', gap: '8px', fontSize: '1rem', padding: '8px 18px' }}
          onClick={() => {
            playBubble();
            onResetProfile();
          }}
        >
          <Settings size={18} /> 이름 바꾸기
        </button>
      </div>

      {/* 카테고리 카드 윈도우 */}
      <div className="category-scroll-container">
        <div className="category-list-wrapper">
          {categories.map((cat) => (
            <div
              key={cat.key}
              onClick={() => handleSelect(cat.key)}
              style={{
                background: cat.color,
                border: `3px solid ${cat.border}`
              }}
              className="category-card-item float-effect"
            >
              <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>
                {cat.icon}
              </span>
              <h3 style={{
                fontSize: '1.7rem',
                color: '#4a3e4d',
                fontFamily: 'var(--font-kids)',
                marginTop: '4px'
              }}>
                {cat.title}
              </h3>
              <p style={{
                fontSize: '1.05rem',
                color: '#7b6c80',
                lineHeight: '1.4'
              }}>
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

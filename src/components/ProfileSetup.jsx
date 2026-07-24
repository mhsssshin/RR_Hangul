import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Smile } from 'lucide-react';
import { playBubble, speakWord } from '../utils/audio';

export default function ProfileSetup({ onComplete }) {
  const [childName, setChildName] = useState('');
  const [momName, setMomName] = useState('');
  const [dadName, setDadName] = useState('');

  useEffect(() => {
    speakWord("안녕! 반가워! 한글 놀이를 하기 전에 너의 이름을 먼저 알려줘!");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!childName.trim()) {
      speakWord("너의 이름을 적어줘!");
      return;
    }

    const finalMom = momName.trim() || '엄마';
    const finalDad = dadName.trim() || '아빠';

    const profile = {
      childName: childName.trim(),
      momName: finalMom,
      dadName: finalDad
    };

    localStorage.setItem('rorong_profile', JSON.stringify(profile));
    playBubble();
    
    // 로롱 요정의 기분 좋은 환영 인사
    speakWord("와! 만나서 반가워 친구야! 우리 함께 재미있는 한글 놀이하러 출바알~!");
    
    // 애니메이션 딜레이 후 부모 컴포넌트에 통보
    setTimeout(() => {
      onComplete(profile);
    }, 1500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      background: 'radial-gradient(circle, rgba(255,238,242,1) 0%, rgba(243,238,255,1) 100%)',
      borderRadius: '32px'
    }}>
      {/* 귀여운 로롱 요정 캐릭터 장식 */}
      <div style={{
        fontSize: '5rem',
        animation: 'float 3s ease-in-out infinite',
        marginBottom: '16px'
      }} className="float-effect">
        🧚‍♀️
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--pink-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center'
        }}>
          <Sparkles color="var(--yellow)" fill="var(--yellow)" />
          로롱한글 요술 공방
        </h2>
        <p style={{ fontSize: '1.3rem', color: '#6c5f70', marginTop: '8px' }}>
          친구와 엄마, 아빠의 이름을 적으면 마법 한글 카드가 만들어져요!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          padding: '32px',
          borderRadius: '32px',
          boxShadow: 'var(--shadow-md)',
          border: '3px solid var(--pink-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* 아이 이름 */}
        <div>
          <label style={{
            fontSize: '1.2rem',
            color: 'var(--pink-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            <Smile size={18} /> 내 이름은 무엇인가요? (필수)
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="예: 지민, 예서"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '1.3rem',
              borderRadius: '16px',
              border: '2.5px solid #ebdcf5',
              fontFamily: 'var(--font-kids)',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--pink-primary)'}
            onBlur={(e) => e.target.style.borderColor = '#ebdcf5'}
          />
        </div>

        {/* 엄마 이름 */}
        <div>
          <label style={{
            fontSize: '1.2rem',
            color: '#634fa6',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            <Heart size={18} fill="#ffb8c6" color="#ffb8c6" /> 엄마 이름은 무엇인가요?
          </label>
          <input
            type="text"
            maxLength={6}
            value={momName}
            onChange={(e) => setMomName(e.target.value)}
            placeholder="적지 않으면 '엄마'로 만들어져요"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '1.3rem',
              borderRadius: '16px',
              border: '2.5px solid #ebdcf5',
              fontFamily: 'var(--font-kids)',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#9a65f8'}
            onBlur={(e) => e.target.style.borderColor = '#ebdcf5'}
          />
        </div>

        {/* 아빠 이름 */}
        <div>
          <label style={{
            fontSize: '1.2rem',
            color: '#3486c6',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            <Smile size={18} /> 아빠 이름은 무엇인가요?
          </label>
          <input
            type="text"
            maxLength={6}
            value={dadName}
            onChange={(e) => setDadName(e.target.value)}
            placeholder="적지 않으면 '아빠'로 만들어져요"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '1.3rem',
              borderRadius: '16px',
              border: '2.5px solid #ebdcf5',
              fontFamily: 'var(--font-kids)',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#a3daff'}
            onBlur={(e) => e.target.style.borderColor = '#ebdcf5'}
          />
        </div>

        <button
          type="submit"
          className="kids-btn kids-btn-pink"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.5rem',
            borderRadius: '20px',
            marginTop: '10px',
            boxShadow: '0 8px 0 var(--pink-dark)'
          }}
        >
          로롱 나라로 출발! ✨
        </button>
      </form>
    </div>
  );
}

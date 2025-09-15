import React from 'react';

function AddressSearch({ onAddressSelect }) {
  const handleSearchClick = () => {
    // 카카오 우편번호 API 호출
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 선택된 주소 데이터를 부모 컴포넌트로 전달
        onAddressSelect(data);
      },
      onclose: function(state) {
        // 우편번호 찾기 화면이 닫힐 때 실행될 코드
        if (state === 'FORCE_CLOSE') {
          console.log('사용자가 강제로 닫았습니다.');
        } else if (state === 'COMPLETE_CLOSE') {
          console.log('검색이 완료되어 닫혔습니다.');
        }
      },
      // 우편번호 찾기 화면 크기 및 위치 설정
      width: '100%',
      height: '100%',
      maxSuggestItems: 5,
      theme: {
        bgColor: '#FFFFFF',
        searchBgColor: '#0B65C8',
        contentBgColor: '#FFFFFF',
        pageBgColor: '#FAFAFA',
        textColor: '#333333',
        queryTextColor: '#FFFFFF',
        postcodeTextColor: '#FA4256',
        emphTextColor: '#008BD3',
        outlineColor: '#E0E0E0'
      }
    }).open();
  };

  return (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
        아래 버튼을 클릭하여 주소를 검색하세요.
      </p>
      <button 
        className="search-button" 
        onClick={handleSearchClick}
      >
        📍 주소 검색하기
      </button>
    </div>
  );
}

export default AddressSearch;

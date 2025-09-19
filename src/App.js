import React, { useState } from 'react';
import AddressSearch from './components/AddressSearch';
import BatchAddressProcessor from './components/BatchAddressProcessor';
import BatchResultTable from './components/BatchResultTable';

function App() {
  const [addressData, setAddressData] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); // 'single' 또는 'batch'

  // 시도명을 풀네임으로 변환하는 함수
  const getFullCityName = (shortName) => {
    const cityMapping = {
      '서울': '서울특별시',
      '부산': '부산광역시',
      '대구': '대구광역시',
      '인천': '인천광역시',
      '광주': '광주광역시',
      '대전': '대전광역시',
      '울산': '울산광역시',
      '세종': '세종특별자치시',
      '경기': '경기도',
      '강원': '강원특별자치도',
      '충북': '충청북도',
      '충남': '충청남도',
      '전북': '전북특별자치도',
      '전남': '전라남도',
      '경북': '경상북도',
      '경남': '경상남도',
      '제주': '제주특별자치도'
    };
    
    return cityMapping[shortName] || shortName;
  };

  const handleAddressSelect = (data) => {
    console.log('단일 검색 - Postcode API 데이터:', data); // 디버깅용
    
    // 기본 필터링된 데이터 생성
    const filteredData = {
      lot_address: data.jibunAddress || data.address,
      road_address: data.roadAddress,
      zipcode: data.zonecode,
      lon: '',
      lat: '',
      city: getFullCityName(data.sido),
      district: data.sigungu,
      address_code: data.bcode
    };

    // 좌표 정보 가져오기 (카카오 Maps API 사용)
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      // 일괄 검색과 동일하게 도로명 주소 우선, 없으면 지번 주소 사용
      const searchAddress = data.roadAddress || data.jibunAddress || data.address;
      console.log('단일 검색 - Maps API 검색 주소:', searchAddress); // 디버깅용
      
      geocoder.addressSearch(searchAddress, function(result, status) {
        console.log('단일 검색 - Maps API 응답:', { searchAddress, result, status }); // 디버깅용
        
        if (status === window.kakao.maps.services.Status.OK) {
          const apiData = result[0];
          console.log('단일 검색 - Maps API 첫 번째 결과:', apiData); // 디버깅용
          
          // 우편번호는 road_address 또는 address에서 가져올 수 있음
          let zipcode = data.zonecode; // 우편번호 API에서 온 데이터 우선 사용
          if (!zipcode && apiData.road_address && apiData.road_address.zone_no) {
            zipcode = apiData.road_address.zone_no;
          } else if (!zipcode && apiData.address && apiData.address.zone_no) {
            zipcode = apiData.address.zone_no;
          }
          
          filteredData.lon = apiData.x;
          filteredData.lat = apiData.y;
          filteredData.zipcode = zipcode;
          
          console.log('단일 검색 - 최종 결과:', filteredData); // 디버깅용
          setAddressData({...filteredData});
        } else {
          // 좌표를 가져올 수 없는 경우에도 나머지 데이터는 표시
          console.log('단일 검색 - Maps API 검색 실패'); // 디버깅용
          setAddressData(filteredData);
        }
      });
    } else {
      // 카카오 Maps API가 로드되지 않은 경우
      console.log('단일 검색 - Maps API 로드되지 않음'); // 디버깅용
      setAddressData(filteredData);
    }
  };

  const handleBatchResult = (results) => {
    setBatchResults(results);
  };

  const clearBatchResults = () => {
    setBatchResults(null);
  };

  return (
    <div className="container">
      <h1 className="title">카카오 주소 검색</h1>
      
      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button 
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          🔍 단일 주소 검색
        </button>
        <button 
          className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          📋 일괄 주소 처리
        </button>
      </div>

      {/* 단일 주소 검색 */}
      {activeTab === 'single' && (
        <>
          <div className="search-section">
            <AddressSearch onAddressSelect={handleAddressSelect} />
          </div>

          {addressData && (
            <div className="result-section">
              <h2 className="result-title">선택된 주소 정보</h2>
              <div className="result-list">
                {Object.entries(addressData).map(([key, value]) => (
                  <div key={key} className="result-item">
                    <span className="result-label">{getLabel(key)}:</span>
                    <span className="result-value">{value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!addressData && (
            <div className="result-section">
              <div className="no-result">
                주소 검색 버튼을 클릭하여 주소를 선택해주세요.
              </div>
            </div>
          )}
        </>
      )}

      {/* 일괄 주소 처리 */}
      {activeTab === 'batch' && (
        <>
          <BatchAddressProcessor onBatchResult={handleBatchResult} />
          {batchResults && (
            <BatchResultTable 
              results={batchResults} 
              onClearResults={clearBatchResults}
            />
          )}
        </>
      )}
    </div>
  );
}

// 영어 키를 그대로 사용하는 함수
function getLabel(key) {
  return key;
}

export default App;

import React, { useState } from 'react';

function BatchAddressProcessor({ onBatchResult }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // 주소 문자열을 정리하는 함수
  const cleanAddress = (address) => {
    // 층수, 호수 등의 상세 정보 제거
    let cleaned = address
      .replace(/,\s*\d+층.*$/gi, '') // ", 3층" 등 제거
      .replace(/,\s*[가-힣]*\d+호.*$/gi, '') // ", 301호" 등 제거
      .replace(/,\s*제\d+층.*$/gi, '') // ", 제14층" 등 제거
      .replace(/,\s*[A-Z]*\d+동.*$/gi, '') // ", 2A동" 등 제거
      .replace(/,\s*별관.*$/gi, '') // ", 별관3층" 등 제거
      .replace(/,\s*상가동.*$/gi, '') // ", 상가동 102호" 등 제거
      .replace(/,\s*주\d+동.*$/gi, '') // ", 주2동" 등 제거
      .replace(/,\s*\d+동.*$/gi, '') // ", 1동" 등 제거
      .replace(/,\s*비-\d+호.*$/gi, '') // ", 비-1002호" 등 제거
      .replace(/\s*\([^)]*\).*$/gi, '') // "(유림스텐), 2층" 등 제거
      .trim();

    // 특별시/광역시/도 표준화 (2025년 기준으로 업데이트)
    cleaned = cleaned
      .replace(/^서울시/g, '서울')
      .replace(/^서울특별시/g, '서울')
      .replace(/^부산시/g, '부산')
      .replace(/^부산광역시/g, '부산')
      .replace(/^대구시/g, '대구')
      .replace(/^대구광역시/g, '대구')
      .replace(/^인천시/g, '인천')
      .replace(/^인천광역시/g, '인천')
      .replace(/^광주시/g, '광주')
      .replace(/^광주광역시/g, '광주')
      .replace(/^대전시/g, '대전')
      .replace(/^대전광역시/g, '대전')
      .replace(/^울산시/g, '울산')
      .replace(/^울산광역시/g, '울산')
      .replace(/^경기도/g, '경기')
      .replace(/^강원도/g, '강원')
      .replace(/^강원특별자치도/g, '강원') // 이미 특별자치도인 경우 줄임
      .replace(/^충북/g, '충북')
      .replace(/^충청북도/g, '충북')
      .replace(/^충남/g, '충남')
      .replace(/^충청남도/g, '충남')
      .replace(/^전북/g, '전북')
      .replace(/^전라북도/g, '전북')
      .replace(/^전북특별자치도/g, '전북') // 이미 특별자치도인 경우 줄임
      .replace(/^전남/g, '전남')
      .replace(/^전라남도/g, '전남')
      .replace(/^경북/g, '경북')
      .replace(/^경상북도/g, '경북')
      .replace(/^경남/g, '경남')
      .replace(/^경상남도/g, '경남')
      .replace(/^제주도/g, '제주')
      .replace(/^제주특별자치도/g, '제주'); // 이미 특별자치도인 경우 줄임

    return cleaned;
  };

  // 카카오 우편번호 API를 사용한 검색
  const searchAddressWithPostcode = (address) => {
    return new Promise((resolve) => {
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      new window.daum.Postcode({
        oncomplete: function(data) {
          document.body.removeChild(tempDiv);
          
          // 우편번호 API 데이터 구조
          const result = {
            lot_address: data.jibunAddress || data.address,
            road_address: data.roadAddress || '',
            zipcode: data.zonecode || '',
            lon: '',
            lat: '',
            city: data.sido || '',
            district: data.sigungu || '',
            address_code: data.bcode || ''
          };
          
          // Maps API로 좌표 정보 추가
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(data.roadAddress || data.address, function(geoResult, status) {
              if (status === window.kakao.maps.services.Status.OK && geoResult.length > 0) {
                result.lon = geoResult[0].x;
                result.lat = geoResult[0].y;
              }
              resolve(result);
            });
          } else {
            resolve(result);
          }
        },
        onclose: function() {
          document.body.removeChild(tempDiv);
          resolve(null); // 사용자가 닫은 경우
        },
        query: address,
        autoMapping: true,
        autoClose: true,
        container: tempDiv
      }).open();
    });
  };

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

  // 시도명 매핑 테이블
  const sidoMapping = {
    '서울': ['서울특별시', '서울시', '서울'],
    '부산': ['부산광역시', '부산시', '부산'],
    '대구': ['대구광역시', '대구시', '대구'],
    '인천': ['인천광역시', '인천시', '인천'],
    '광주': ['광주광역시', '광주시', '광주'],
    '대전': ['대전광역시', '대전시', '대전'],
    '울산': ['울산광역시', '울산시', '울산'],
    '세종': ['세종특별자치시', '세종시', '세종'],
    '경기': ['경기도', '경기'],
    '강원': ['강원특별자치도', '강원도', '강원'],
    '충북': ['충청북도', '충북'],
    '충남': ['충청남도', '충남'],
    '전북': ['전북특별자치도', '전라북도', '전북'],
    '전남': ['전라남도', '전남'],
    '경북': ['경상북도', '경북'],
    '경남': ['경상남도', '경남'],
    '제주': ['제주특별자치도', '제주도', '제주']
  };

  // 시도명이 매칭되는지 확인하는 함수
  const isSidoMatched = (inputSido, foundSido) => {
    if (!inputSido || !foundSido) return false;
    
    // 정확히 일치하는 경우
    if (inputSido === foundSido) return true;
    
    // 매핑 테이블에서 확인
    for (const [key, values] of Object.entries(sidoMapping)) {
      if (values.includes(inputSido) && values.includes(foundSido)) {
        return true;
      }
    }
    
    return false;
  };

  // 주소 유사도 검증 함수 (개선된 버전)
  const validateAddressMatch = (originalAddress, foundLotAddress, foundRoadAddress) => {
    if (!foundLotAddress && !foundRoadAddress) return 'none';
    
    // 원본 주소를 파싱
    const originalParts = originalAddress.replace(/,/g, ' ').split(/\s+/).filter(part => part.length > 0);
    const inputSido = originalParts[0] || '';
    const inputSigungu = originalParts[1] || '';
    const inputDong = originalParts[2] || '';
    
    console.log('신뢰도 검증:', {
      original: originalAddress,
      parsed: { inputSido, inputSigungu, inputDong },
      foundLot: foundLotAddress,
      foundRoad: foundRoadAddress
    });
    
    // 검색된 주소들을 확인 (지번주소와 도로명주소 모두)
    const addressesToCheck = [foundLotAddress, foundRoadAddress].filter(addr => addr);
    
    let bestMatch = 'low';
    
    for (const foundAddress of addressesToCheck) {
      if (!foundAddress) continue;
      
      const foundParts = foundAddress.split(/\s+/);
      const foundSido = foundParts[0] || '';
      const foundSigungu = foundParts[1] || '';
      
      let matchScore = 0;
      let totalChecks = 0;
      
      // 1. 시도 매칭 확인 (가중치: 높음)
      if (inputSido) {
        totalChecks += 3;
        if (isSidoMatched(inputSido, foundSido)) {
          matchScore += 3;
          console.log('시도 매칭 성공:', inputSido, '↔', foundSido);
        } else {
          console.log('시도 매칭 실패:', inputSido, '↔', foundSido);
        }
      }
      
      // 2. 시군구 매칭 확인 (가중치: 높음)
      if (inputSigungu) {
        totalChecks += 3;
        if (foundAddress.includes(inputSigungu) || foundSigungu.includes(inputSigungu)) {
          matchScore += 3;
          console.log('시군구 매칭 성공:', inputSigungu);
        } else {
          console.log('시군구 매칭 실패:', inputSigungu, 'in', foundAddress);
        }
      }
      
      // 3. 동/읍/면 매칭 확인 (가중치: 중간)
      if (inputDong && inputDong.length > 1) {
        totalChecks += 2;
        // 동명에서 숫자 제거하여 비교 (예: 역삼1동 → 역삼동)
        const cleanInputDong = inputDong.replace(/\d+/g, '');
        if (foundAddress.includes(inputDong) || foundAddress.includes(cleanInputDong)) {
          matchScore += 2;
          console.log('동 매칭 성공:', inputDong);
        } else {
          console.log('동 매칭 실패:', inputDong, 'in', foundAddress);
        }
      }
      
      // 4. 번지수 일부 매칭 (가중치: 낮음)
      const inputNumbers = originalAddress.match(/\d+/g) || [];
      const foundNumbers = foundAddress.match(/\d+/g) || [];
      if (inputNumbers.length > 0) {
        totalChecks += 1;
        const hasCommonNumber = inputNumbers.some(num => foundNumbers.includes(num));
        if (hasCommonNumber) {
          matchScore += 1;
          console.log('번지 매칭 성공');
        }
      }
      
      // 매칭 점수 계산
      const matchRatio = totalChecks > 0 ? matchScore / totalChecks : 0;
      console.log('매칭 점수:', matchScore, '/', totalChecks, '=', matchRatio);
      
      let currentMatch;
      if (matchRatio >= 0.8) {
        currentMatch = 'high';
      } else if (matchRatio >= 0.5) {
        currentMatch = 'medium';
      } else if (matchRatio > 0) {
        currentMatch = 'low';
      } else {
        currentMatch = 'none';
      }
      
      // 가장 높은 신뢰도를 선택
      if (currentMatch === 'high') {
        bestMatch = 'high';
        break; // high를 찾으면 더 이상 검사하지 않음
      } else if (currentMatch === 'medium' && bestMatch !== 'high') {
        bestMatch = 'medium';
      }
    }
    
    console.log('최종 신뢰도:', bestMatch);
    return bestMatch;
  };

  // 카카오 Maps API로 주소 검색 (도로명 우선 - 2단계 검색)
  const searchAddress = (address) => {
    return new Promise((resolve) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        // 카카오 Maps API가 없는 경우 기본값 반환
        resolve({
          lot_address: address,
          road_address: '',
          zipcode: '',
          lon: '',
          lat: '',
          city: '',
          district: '',
          address_code: '',
          match_confidence: 'low'
        });
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, function(result, status) {
        console.log('일괄 검색 - Maps API 1차 응답:', { 
          originalInput: address, 
          result, 
          status,
          resultCount: result ? result.length : 0
        }); // 디버깅용
        
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          // 도로명주소 타입 우선 선택
          let selectedResult = result.find(item => item.address_type === 'ROAD_ADDR') || result[0];
          
          console.log('일괄 검색 - Maps API 1차 선택된 결과:', selectedResult); // 디버깅용
          
          // 만약 선택된 결과가 지번주소이고 도로명주소 정보가 있다면, 도로명주소로 재검색
          if (selectedResult.address_type === 'REGION_ADDR' && selectedResult.road_address?.address_name) {
            const roadAddress = selectedResult.road_address.address_name;
            console.log('일괄 검색 - 도로명주소로 재검색:', roadAddress);
            
            geocoder.addressSearch(roadAddress, function(roadResult, roadStatus) {
              console.log('일괄 검색 - Maps API 2차 응답 (도로명):', { 
                searchAddress: roadAddress,
                result: roadResult, 
                status: roadStatus,
                resultCount: roadResult ? roadResult.length : 0
              });
              
              if (roadStatus === window.kakao.maps.services.Status.OK && roadResult.length > 0) {
                // 도로명주소 검색 결과에서 ROAD_ADDR 타입 우선 선택
                let roadSelectedResult = roadResult.find(item => item.address_type === 'ROAD_ADDR') || roadResult[0];
                console.log('일괄 검색 - Maps API 2차 선택된 결과:', roadSelectedResult);
                processResult(roadSelectedResult, address, resolve);
              } else {
                // 도로명주소 재검색 실패시 원래 결과 사용
                console.log('일괄 검색 - 도로명주소 재검색 실패, 원래 결과 사용');
                processResult(selectedResult, address, resolve);
              }
            });
          } else {
            // 이미 도로명주소이거나 도로명주소 정보가 없는 경우
            processResult(selectedResult, address, resolve);
          }
        } else {
          // 검색 실패 시 기본값 반환
          console.log('일괄 검색 - Maps API 검색 실패:', { address, status }); // 디버깅용
          resolve({
            lot_address: address,
            road_address: '',
            zipcode: '',
            lon: '',
            lat: '',
            city: '',
            district: '',
            address_code: '',
            match_confidence: 'none'
          });
        }
      });
    });
  };

  // 검색 결과를 처리하는 공통 함수
  const processResult = (data, originalAddress, resolve) => {
    // 주소 매칭 검증 (개선된 버전)
    const foundLotAddress = data.address?.address_name || '';
    const foundRoadAddress = data.road_address?.address_name || '';
    
    const matchConfidence = validateAddressMatch(originalAddress, foundLotAddress, foundRoadAddress);
    
    // 우편번호는 road_address 또는 address에서 가져올 수 있음
    let zipcode = '';
    if (data.road_address && data.road_address.zone_no) {
      zipcode = data.road_address.zone_no;
    } else if (data.address && data.address.zone_no) {
      zipcode = data.address.zone_no;
    }
    
    const resultData = {
      lot_address: foundLotAddress || originalAddress,
      road_address: foundRoadAddress,
      zipcode: zipcode,
      lon: data.x || '',
      lat: data.y || '',
      city: getFullCityName(data.address?.region_1depth_name || ''),
      district: data.address?.region_2depth_name || '',
      address_code: data.address?.b_code || '',
      match_confidence: matchConfidence
    };
    
    console.log('일괄 검색 - 최종 결과:', resultData); // 디버깅용
    resolve(resultData);
  };

  // 단일 검색과 동일한 방식으로 우편번호 API 사용
  const searchWithPostcode = (address) => {
    return new Promise((resolve) => {
      // 우편번호 검색 팝업을 숨겨진 상태로 실행
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);

      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          document.body.removeChild(container);
          resolve(null); // 타임아웃시 null 반환
        }
      }, 5000); // 5초 타임아웃

      new window.daum.Postcode({
        oncomplete: function(data) {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            document.body.removeChild(container);
            
            console.log('일괄 검색 - Postcode API 결과:', data);
            resolve(data);
          }
        },
        onclose: function() {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            document.body.removeChild(container);
            resolve(null);
          }
        },
        width: '100%',
        height: '100%',
        container: container,
        query: address,
        autoMapping: true,
        shorthand: false
      }).open();
    });
  };

  // 우편번호 API 데이터를 처리하여 단일 검색과 동일한 결과 생성
  const processPostcodeData = async (data) => {
    const filteredData = {
      lot_address: data.jibunAddress || data.address,
      road_address: data.roadAddress,
      zipcode: data.zonecode,
      lon: '',
      lat: '',
      city: getFullCityName(data.sido),
      district: data.sigungu,
      address_code: data.bcode,
      match_confidence: 'high' // 우편번호 API를 통한 검색은 항상 높은 신뢰도
    };

    // Maps API로 좌표 정보 가져오기 (단일 검색과 동일한 방식)
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const searchAddress = data.roadAddress || data.jibunAddress || data.address;
      console.log('일괄 검색 - Maps API 검색 주소:', searchAddress);
      
      const coordinates = await getMapsCoordinates(searchAddress);
      filteredData.lon = coordinates.lon;
      filteredData.lat = coordinates.lat;
    }

    console.log('일괄 검색 - 최종 결과:', filteredData);
    return filteredData;
  };

  // Maps API에서 좌표만 가져오는 함수 (도로명 우선)
  const getMapsCoordinates = (address) => {
    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, function(result, status) {
        console.log('일괄 검색 - Maps API 좌표 검색:', { address, result, status });
        
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          // 도로명주소 타입 우선 선택
          let selectedResult = result.find(item => item.address_type === 'ROAD_ADDR') || result[0];
          console.log('일괄 검색 - Maps API 좌표용 선택된 결과:', selectedResult);
          
          resolve({
            lon: selectedResult.x || '',
            lat: selectedResult.y || ''
          });
        } else {
          resolve({ lon: '', lat: '' });
        }
      });
    });
  };

  // 일괄 처리 함수 - Maps API만 사용 (팝업 없음)
  const processBatch = async () => {
    if (!inputText.trim()) {
      alert('주소 목록을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    
    // 주소 목록을 줄바꿈으로 분리
    const addresses = inputText
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0)
      .map(cleanAddress);

    setProgress({ current: 0, total: addresses.length });

    const results = [];

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      setProgress({ current: i + 1, total: addresses.length });
      
      try {
        console.log(`일괄 검색 시작: ${address}`);
        
        // 우편번호 API 사용하지 않고 Maps API로 직접 검색
        const result = await searchAddress(address);
        results.push({
          original_address: inputText.split('\n')[i]?.trim() || address,
          ...result
        });
        
        // API 호출 간격 조절
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`주소 처리 실패: ${address}`, error);
        results.push({
          original_address: inputText.split('\n')[i]?.trim() || address,
          lot_address: address,
          road_address: '',
          zipcode: '',
          lon: '',
          lat: '',
          city: '',
          district: '',
          address_code: '',
          match_confidence: 'none'
        });
      }
    }

    setIsProcessing(false);
    onBatchResult(results);
  };

  const handleSampleLoad = () => {
    const sampleAddresses = `서울 강남구 역삼동 835-6, 별관3층
경기 의정부시 녹양동 157-5, 3층
대구 북구 산격동 1666, 503호
대전 중구 선화동 369-4, 301호
서울 성북구 성북동1가 109-6`;
    setInputText(sampleAddresses);
  };

  return (
    <div className="batch-processor">
      <h3 className="batch-title">📋 주소 일괄 처리</h3>
      
      <div className="batch-input-section">
        <div className="input-header">
          <label>주소 목록 (한 줄에 하나씩 입력):</label>
          <button 
            type="button" 
            onClick={handleSampleLoad}
            className="sample-button"
          >
            샘플 로드
          </button>
        </div>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="주소를 한 줄에 하나씩 입력하세요.&#10;예)&#10;서울 강남구 역삼동 835-6&#10;경기 의정부시 녹양동 157-5"
          rows={10}
          className="batch-textarea"
          disabled={isProcessing}
        />
      </div>

      <div className="batch-controls">
        <button 
          onClick={processBatch}
          disabled={isProcessing || !inputText.trim()}
          className="process-button"
        >
          {isProcessing ? '처리 중...' : '일괄 처리 시작'}
        </button>
        
        {isProcessing && (
          <div className="progress-info">
            진행률: {progress.current} / {progress.total} 
            ({Math.round((progress.current / progress.total) * 100)}%)
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchAddressProcessor;

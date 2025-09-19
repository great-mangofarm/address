import React, { useState } from 'react';

function BatchResultTable({ results, onClearResults }) {
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'high', 'none'

  if (!results || results.length === 0) {
    return null;
  }

  // 필터링된 결과
  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.match_confidence === filter;
  });

  const lowConfidenceCount = results.filter(r => r.match_confidence === 'low').length;
  const mediumConfidenceCount = results.filter(r => r.match_confidence === 'medium').length;
  const highConfidenceCount = results.filter(r => r.match_confidence === 'high').length;
  const noneConfidenceCount = results.filter(r => r.match_confidence === 'none').length;

  // CSV 다운로드 함수
  const downloadCSV = () => {
    const headers = [
      'original_address',
      'lot_address', 
      'road_address', 
      'zipcode', 
      'lon', 
      'lat', 
      'city', 
      'district', 
      'address_code',
      'match_confidence'
    ];
    
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => `"${(row[header] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `address_batch_result_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON 다운로드 함수
  const downloadJSON = () => {
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `address_batch_result_${new Date().getTime()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="batch-results">
      <div className="results-header">
        <h3 className="results-title">
          📊 처리 결과 ({results.length}개)
          <span className="confidence-summary">
            - 높음: {highConfidenceCount}, 보통: {mediumConfidenceCount}, 낮음: {lowConfidenceCount}, 없음: {noneConfidenceCount}
          </span>
        </h3>
        <div className="results-controls">
          <div className="filter-controls">
            <label>필터: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">전체 ({results.length})</option>
              <option value="high">신뢰도 높음 ({highConfidenceCount})</option>
              <option value="medium">신뢰도 보통 ({mediumConfidenceCount})</option>
              <option value="low">신뢰도 낮음 ({lowConfidenceCount})</option>
              <option value="none">검색 실패 ({noneConfidenceCount})</option>
            </select>
          </div>
          <div className="results-actions">
            <button onClick={downloadCSV} className="download-button csv">
              📄 CSV 다운로드
            </button>
            <button onClick={downloadJSON} className="download-button json">
              📋 JSON 다운로드
            </button>
            <button onClick={onClearResults} className="clear-button">
              🗑️ 결과 지우기
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>순번</th>
              <th>원본 주소</th>
              <th>lot_address</th>
              <th>road_address</th>
              <th>zipcode</th>
              <th>lon</th>
              <th>lat</th>
              <th>city</th>
              <th>district</th>
              <th>address_code</th>
              <th>신뢰도</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className={result.match_confidence === 'low' || result.match_confidence === 'none' ? 'low-confidence' : ''}>
                <td>{index + 1}</td>
                <td className="original-address">{result.original_address}</td>
                <td>{result.lot_address}</td>
                <td>{result.road_address}</td>
                <td>{result.zipcode}</td>
                <td>{result.lon}</td>
                <td>{result.lat}</td>
                <td>{result.city}</td>
                <td>{result.district}</td>
                <td>{result.address_code}</td>
                <td>
                  <span className={`confidence-badge ${result.match_confidence}`}>
                    {result.match_confidence === 'high' ? '높음' : 
                     result.match_confidence === 'medium' ? '보통' :
                     result.match_confidence === 'low' ? '낮음' : '없음'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BatchResultTable;

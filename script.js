// DOM 요소 참조
const marketSelect = document.getElementById('market');
const dateInput = document.getElementById('date');
const countInput = document.getElementById('count');
const searchBtn = document.getElementById('search-btn');
const coinSummary = document.getElementById('coin-summary');
const marketSummary = document.getElementById('market-summary');
const tableBody = document.getElementById('table-body');

// 차트 객체 참조
let priceChart = null;
let volumeChart = null;
let changeRateChart = null;

// 현재 날짜를 기본값으로 설정
const today = new Date();
dateInput.value = today.toISOString().split('T')[0];

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    // 조회 버튼 이벤트 리스너
    searchBtn.addEventListener('click', fetchData);
    
    // 페이지 로드 시 기본 데이터 로드
    fetchData();
});

// 데이터 로딩 함수
async function fetchData() {
    try {
        showLoading();
        
        const market = marketSelect.value;
        const date = dateInput.value;
        const count = parseInt(countInput.value);
        
        // 업비트 API URL (실제로는 CORS 정책으로 인해 서버 프록시가 필요할 수 있음)
        // 먼저 로컬 파일에서 데이터를 찾고, 없으면 API 호출
        let data = await fetchLocalData(market, date);
        
        if (!data) {
            // 로컬 데이터가 없으면 API 호출
            data = await fetchApiData(market, date, count);
        }
        
        if (data && Array.isArray(data)) {
            // 데이터 처리
            processData(data, market);
        } else {
            throw new Error('데이터 형식이 올바르지 않습니다.');
        }
        
    } catch (error) {
        console.error('데이터 로딩 오류:', error);
        alert(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// 로컬 파일에서 데이터 가져오기
async function fetchLocalData(market, date) {
    try {
        const formattedDate = date.replace(/-/g, '');
        const fileName = `${market}_${formattedDate}.json`;
        
        // 날짜 객체로 변환하여 폴더 경로 생성
        const dateParts = date.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const folderPath = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        const response = await fetch(`artifact/${folderPath}/${fileName}`);
        
        if (!response.ok) {
            console.log(`로컬 파일을 찾을 수 없습니다: ${fileName}`);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('로컬 데이터 로딩 오류:', error);
        return null;
    }
}

// 업비트 API 호출
async function fetchApiData(market, date, count) {
    try {
        // 날짜를 UTC 형식으로 변환
        const dateObj = new Date(date);
        const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59));
        const to = utcDate.toISOString();
        
        // CORS 문제를 피하기 위해 서버 프록시가 필요할 수 있음
        // 실제 서비스에서는 백엔드를 통해 API를 호출해야 합니다
        const apiUrl = `https://api.upbit.com/v1/candles/days?market=${market}&count=${count}&to=${to}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 데이터 로딩 오류:', error);
        throw error;
    }
}

// 데이터 처리
function processData(data, market) {
    // 데이터 정렬 (날짜 오름차순)
    data.sort((a, b) => new Date(a.candle_date_time_kst) - new Date(b.candle_date_time_kst));
    
    // 차트 데이터 준비
    updateCharts(data);
    
    // 테이블 데이터 업데이트
    updateTable(data);
    
    // 요약 정보 업데이트
    updateSummary(data, market);
}

// 차트 업데이트
function updateCharts(data) {
    // 차트 데이터 준비
    const labels = data.map(item => item.candle_date_time_kst.substring(0, 10));
    
    // 가격 데이터
    const priceData = {
        labels: labels,
        datasets: [
            {
                label: '종가',
                data: data.map(item => item.trade_price),
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                fill: true,
                tension: 0.1
            },
            {
                label: '고가',
                data: data.map(item => item.high_price),
                borderColor: '#34a853',
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            },
            {
                label: '저가',
                data: data.map(item => item.low_price),
                borderColor: '#ea4335',
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            }
        ]
    };
    
    // 거래량 데이터
    const volumeData = {
        labels: labels,
        datasets: [{
            label: '거래량',
            data: data.map(item => item.candle_acc_trade_volume),
            backgroundColor: data.map(item => item.change_rate >= 0 ? 'rgba(52, 168, 83, 0.5)' : 'rgba(234, 67, 53, 0.5)'),
            borderColor: data.map(item => item.change_rate >= 0 ? '#34a853' : '#ea4335'),
            borderWidth: 1
        }]
    };
    
    // 변동률 데이터
    const changeRateData = {
        labels: labels,
        datasets: [{
            label: '변동률 (%)',
            data: data.map(item => (item.change_rate * 100).toFixed(2)),
            backgroundColor: data.map(item => item.change_rate >= 0 ? 'rgba(52, 168, 83, 0.5)' : 'rgba(234, 67, 53, 0.5)'),
            borderColor: data.map(item => item.change_rate >= 0 ? '#34a853' : '#ea4335'),
            borderWidth: 1
        }]
    };
    
    // 가격 차트 생성 또는 업데이트
    if (priceChart) {
        priceChart.data = priceData;
        priceChart.update();
    } else {
        const priceCtx = document.getElementById('price-chart').getContext('2d');
        priceChart = new Chart(priceCtx, {
            type: 'line',
            data: priceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '가격 차트 (KRW)'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toLocaleString()} KRW`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' KRW';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 거래량 차트 생성 또는 업데이트
    if (volumeChart) {
        volumeChart.data = volumeData;
        volumeChart.update();
    } else {
        const volumeCtx = document.getElementById('volume-chart').getContext('2d');
        volumeChart = new Chart(volumeCtx, {
            type: 'bar',
            data: volumeData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '거래량 차트'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `거래량: ${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 변동률 차트 생성 또는 업데이트
    if (changeRateChart) {
        changeRateChart.data = changeRateData;
        changeRateChart.update();
    } else {
        const changeRateCtx = document.getElementById('change-rate-chart').getContext('2d');
        changeRateChart = new Chart(changeRateCtx, {
            type: 'bar',
            data: changeRateData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '일별 변동률 (%)'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `변동률: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 테이블 업데이트
function updateTable(data) {
    tableBody.innerHTML = '';
    
    // 최신 데이터부터 표시 (역순)
    const reversedData = [...data].reverse();
    
    reversedData.forEach(item => {
        const row = document.createElement('tr');
        
        // 날짜
        const dateCell = document.createElement('td');
        dateCell.textContent = item.candle_date_time_kst.substring(0, 10);
        row.appendChild(dateCell);
        
        // 시가
        const openCell = document.createElement('td');
        openCell.textContent = item.opening_price.toLocaleString();
        row.appendChild(openCell);
        
        // 고가
        const highCell = document.createElement('td');
        highCell.textContent = item.high_price.toLocaleString();
        row.appendChild(highCell);
        
        // 저가
        const lowCell = document.createElement('td');
        lowCell.textContent = item.low_price.toLocaleString();
        row.appendChild(lowCell);
        
        // 종가
        const closeCell = document.createElement('td');
        closeCell.textContent = item.trade_price.toLocaleString();
        row.appendChild(closeCell);
        
        // 거래량
        const volumeCell = document.createElement('td');
        volumeCell.textContent = item.candle_acc_trade_volume.toLocaleString();
        row.appendChild(volumeCell);
        
        // 변동률
        const changeRateCell = document.createElement('td');
        const changeRate = (item.change_rate * 100).toFixed(2);
        changeRateCell.textContent = `${changeRate}%`;
        changeRateCell.style.color = changeRate >= 0 ? '#34a853' : '#ea4335';
        row.appendChild(changeRateCell);
        
        tableBody.appendChild(row);
    });
}

// 요약 정보 업데이트
function updateSummary(data, market) {
    // 마지막 데이터가 최신 데이터
    const latestData = data[data.length - 1];
    
    // 기본 정보 계산
    const currentPrice = latestData.trade_price;
    const yesterdayPrice = latestData.prev_closing_price;
    const dailyChange = latestData.change_price;
    const dailyChangeRate = (latestData.change_rate * 100).toFixed(2);
    const dailyVolume = latestData.candle_acc_trade_volume.toLocaleString();
    const dailyTradeValue = (latestData.candle_acc_trade_price / 1000000).toFixed(2);
    
    // 추가 분석 정보 계산
    // 최근 7일 변동률
    const last7Days = data.slice(-7);
    const weeklyChanges = last7Days.map(item => item.change_rate);
    const weeklyChangeRate = weeklyChanges.reduce((sum, rate) => sum + rate, 0) * 100;
    
    // 최근 30일 또는 전체 기간의 최고/최저가
    const maxPrice = Math.max(...data.map(item => item.high_price));
    const minPrice = Math.min(...data.map(item => item.low_price));
    const priceRange = ((maxPrice - minPrice) / minPrice * 100).toFixed(2);
    
    // 변동성 (표준편차)
    const prices = data.map(item => item.trade_price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const volatility = (Math.sqrt(variance) / mean * 100).toFixed(2);
    
    // 코인 요약 정보 업데이트
    coinSummary.innerHTML = `
        <div class="info-row">
            <div class="info-label">현재 시세:</div>
            <div class="info-value">${currentPrice.toLocaleString()} KRW</div>
        </div>
        <div class="info-row">
            <div class="info-label">전일 대비:</div>
            <div class="info-value" style="color: ${dailyChange >= 0 ? '#34a853' : '#ea4335'}">
                ${dailyChange >= 0 ? '+' : ''}${dailyChange.toLocaleString()} KRW (${dailyChangeRate}%)
            </div>
        </div>
        <div class="info-row">
            <div class="info-label">고가:</div>
            <div class="info-value">${latestData.high_price.toLocaleString()} KRW</div>
        </div>
        <div class="info-row">
            <div class="info-label">저가:</div>
            <div class="info-value">${latestData.low_price.toLocaleString()} KRW</div>
        </div>
        <div class="info-row">
            <div class="info-label">거래량:</div>
            <div class="info-value">${dailyVolume} ${market.split('-')[1]}</div>
        </div>
        <div class="info-row">
            <div class="info-label">거래대금:</div>
            <div class="info-value">${dailyTradeValue} 백만 KRW</div>
        </div>
    `;
    
    // 시장 분석 정보 업데이트
    marketSummary.innerHTML = `
        <div class="info-row">
            <div class="info-label">최근 7일 변동률:</div>
            <div class="info-value" style="color: ${weeklyChangeRate >= 0 ? '#34a853' : '#ea4335'}">
                ${weeklyChangeRate >= 0 ? '+' : ''}${weeklyChangeRate.toFixed(2)}%
            </div>
        </div>
        <div class="info-row">
            <div class="info-label">최고가:</div>
            <div class="info-value">${maxPrice.toLocaleString()} KRW</div>
        </div>
        <div class="info-row">
            <div class="info-label">최저가:</div>
            <div class="info-value">${minPrice.toLocaleString()} KRW</div>
        </div>
        <div class="info-row">
            <div class="info-label">가격 범위:</div>
            <div class="info-value">${priceRange}%</div>
        </div>
        <div class="info-row">
            <div class="info-label">변동성:</div>
            <div class="info-value">${volatility}%</div>
        </div>
        <div class="info-row">
            <div class="info-label">조회 기간:</div>
            <div class="info-value">${data[0].candle_date_time_kst.substring(0, 10)} ~ ${data[data.length - 1].candle_date_time_kst.substring(0, 10)}</div>
        </div>
    `;
}

// 로딩 표시 함수
function showLoading() {
    const loading = document.querySelector('.loading');
    if (!loading) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading active';
        loadingDiv.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loadingDiv);
    } else {
        loading.classList.add('active');
    }
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.classList.remove('active');
    }
}

// 추가 스타일 요소 생성
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
    }
    .info-label {
        font-weight: 600;
        color: #555;
    }
    .info-value {
        font-weight: 600;
    }
    `;
    document.head.appendChild(style);
}); 
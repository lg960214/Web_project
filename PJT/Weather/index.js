async function setRenderBackground(){
    // body의 background 주소를 넣어도 OK
    // 하지만 일부러 axios 요청으로 이미지를 받아올 것

    // blob : 이미지, 사운드, 비디오 등 멀티미디어 데이터를 다룰 때 사용

    const result = await axios.get('https://picsum.photos/1280/720', {
        responseType : "blob",
    });
    // URL.createObjectURL -> 임시 URL을 만듦 (페이지 내에서만 유효)
    // 받아온 데이터를 임시 URL을 만들어, 그 URL을 body에 넣음
    const imageURL = URL.createObjectURL(result.data);
    document.querySelector('body').style.backgroundImage = `url(${imageURL})`;

}


// 시간 갱신

function setTime(){
    const timer = document.querySelector('.timer');


    setInterval(() => {
        // date 함수
        const date = new Date();
        // console.log(date);
        // console.log(date.getHours());
        timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        
    }, 1000)
}


function getMemo(){
    // localStorage로부터 가져와서 memo에 넣어주는 작업
    const memo = document.querySelector('.memo');
    memo.textContent = localStorage.getItem('todo');
}

function setMemo(){
    const memoInput = document.querySelector('.memo-input');
    memoInput.addEventListener('keyup', function(e){
        // e.code 입력 시 -> 작성한 키보드 조회
        console.log(e);
        console.log(e.target); // e.target = 요소 그 자체를 의미
        console.log(e.target.value);

        // e.code가 Enter인 경우에만 메모를 갖고 올 수 있도록
        if(e.code === 'Enter' && e.target.value) {
            // 요소를 지정
            const memo = document.querySelector('.memo');
            memo.textContent = e.target.value;

            // 메모가 날아가지 않도록 저장
            // 원래는 백엔드 -> DB에 저장해서 가져오는 작업
            // 브라우저에도 간단한 저장소 개념이 있음 -> local strage
            
            // LocalStorage사용법
            // localStorage.setItem('키', '넣을 값')
            localStorage.setItem('todo', e.target.value);

            // localStorage.getItem('키') => 값을 가져옴
            // getMemo로 분리

            e.target.value = "";
        }
    })
    
    getMemo();

}

function getPosition(){
    // navigator.geolocation -> 일반 callback 함수임 따라서
    // Promise화 해서 return
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    })
}


async function getWeather(latitude, longitude){
    const API_KEY = "56b88ec9a907b742edd388472938a0f2";

    // 위도 경도가 존재할 경우
    if(latitude && longitude){
        // 날씨 API 호출
        const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        const result = await axios.get(url);
        console.log(result);
        return result;
    }
    // 위도 경도가 빈 문자열일 경우
    else{
        // 날씨 API 호출 (위도, 경도 x)
        const city_name = 'Seoul';
        const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city_name}&appid=${API_KEY}`
        const result = await axios.get(url);
        console.log(result);
        return result;
    }
}

async function renderWeather(){
    // renderWeaher에서 getPosition을 호출해서 위도 경도를 받아온다
    let latitude = '';
    let longitude = '';
    try{
        // getPosition().then(li => {
        //     console.log(li);
        // }).catch(error => console.log(error));

        const position = await getPosition();

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

    } catch (error){
        console.log(error);
    }

    // 날씨 요청 => 위도, 경도를 인자로 전달
    const weatherResponse = await getWeather(latitude, longitude);
    
    const input_data = [];

    let standard = parseInt(((new Date()).getHours()-6)/3);
    if (standard < 0){
        standard = 0;
    }
    

    for (let i = 0; i < 5; i++){
        let info_ = {};
        let raw_info = weatherResponse.data.list[standard];

        info_.date = raw_info.dt_txt.split(' ')[0];
        info_.desc = raw_info.weather[0].main;
        info_.degree = (raw_info.main.temp - 273.15).toFixed(1);
        
        input_data.push(info_);
        standard += 8;
    }
    // 날짜, 날씨 상세, 온도
    
    return input_data;
}



function deleteMemo(){
    // 이벤트 위임
    // document.querySelector('body')
    
    // 똑같은 함수를 수백만 개에 addEventListener 가정 -> 속도 저하
    
    //e.target.ClassList가 hello인 경우에 ~ 이벤트 실행

    //이것을 이벤트 위임이라고 함

    document.addEventListener('click', function(e){

        //localStorage를 지워야하고 HTML 파트도 지워야한다.
        if (e.target.classList.contains('memo')){
            localStorage.removeItem('todo');
        }
    })
}

function matchIcon(weatherData) {
    if (weatherData === "Clear") return "./images/039-sun.png";
    if (weatherData === "Clouds") return "./images/001-cloud.png";
    if (weatherData === "Rain") return "./images/003-rainy.png";
    if (weatherData === "Snow") return "./images/006-snowy.png";
    if (weatherData === "Thunderstorm") return "./images/008-storm.png";
    if (weatherData === "Drizzle") return "./images/031-snowflake.png";
    if (weatherData === "Atmosphere") return "./images/033-hurricane.png";
    }
    


async function adjust(input_){
    const target = document.querySelectorAll('.weather-box');
    
    const datum = await input_;
    
    for (let i = 0; i < 5; i++){
        target[i].querySelector('.date').textContent = datum[i].date;    
        target[i].querySelector('.desc').textContent = datum[i].desc;
        target[i].querySelector('img').setAttribute("src", matchIcon(datum[i].desc));
        target[i].querySelector('.degree').textContent = datum[i].degree + " °C";
    }


}


function allRender(){
    setRenderBackground();
    setTime();
    setMemo();
    getMemo();
    deleteMemo();
    const input_ = renderWeather();

    adjust(input_);


    // 5초마다 해당 콜백함수 반복
    setInterval(() => {
        setRenderBackground();
    }, 5000)

}

allRender();

const action = document.querySelector('.modal-button').addEventListener('click',function(){
    const target = document.querySelector('.modal-dialog');
    
    target.innerHTML = document.querySelector('.img').innerHTML;
    target.innerHTML += `<div class="desc">` + document.querySelector('.date').innerHTML + `</div>`;
    
    const text = `<div class="wise">
    <br>
    햇빛은 달콤하고, 비는 상쾌하고, <br>
    바람은 시원하며, 눈은 기분을 들뜨게 만든다. <br>
    세상에 나쁜 날씨란 없다. <br>
    서로 다른 종류의 좋은 날씨만 있을 뿐이다. <br>
    <br>
    - 존 러스킨
    </div>`
    
    target.innerHTML += text;

})
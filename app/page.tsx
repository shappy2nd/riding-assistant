"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao?: { maps: {
      load: (callback: () => void) => void;
      Map: new (container: HTMLElement, options: { center: unknown; level: number }) => { setCenter: (position: unknown) => void; addControl: (control: unknown, position: unknown) => void };
      LatLng: new (lat: number, lng: number) => unknown;
      Marker: new (options: { position: unknown }) => { setMap: (map: unknown) => void };
      MapTypeControl: new () => unknown; ZoomControl: new () => unknown;
      ControlPosition: { TOPRIGHT: unknown; RIGHT: unknown };
    }};
  }
}

const SEOUL = { lat: 37.5665, lng: 126.978 };

type Weather = {
  temperature: number;
  apparent: number;
  wind: number;
  gust: number;
  rain: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
  score: number;
  summary: string;
  temperatureNote: string;
  windNote: string;
  rainNote: string;
};

export default function Home() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ setCenter: (position: unknown) => void } | null>(null);
  const markerInstance = useRef<{ setMap: (map: unknown) => void } | null>(null);
  const [key, setKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [status, setStatus] = useState<"setup" | "loading" | "ready" | "error">("setup");
  const [message, setMessage] = useState("카카오 JavaScript 키를 입력하면 지도가 열립니다.");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherMessage, setWeatherMessage] = useState("위치를 확인하면 실제 날씨를 불러옵니다.");

  useEffect(() => {
    const savedKey = window.localStorage.getItem("riding-kakao-js-key") ?? "";
    if (savedKey) { setKey(savedKey); setDraftKey(savedKey); }
  }, []);

  useEffect(() => {
    if (!key || !mapElement.current) return;
    setStatus("loading");
    setMessage("카카오 지도를 불러오는 중입니다…");
    document.querySelector("script[data-kakao-map]")?.remove();
    delete window.kakao;
    const script = document.createElement("script");
    script.dataset.kakaoMap = "true";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.onload = () => {
      if (!window.kakao || !mapElement.current) return showMapError();
      window.kakao.maps.load(() => {
        if (!window.kakao || !mapElement.current) return showMapError();
        const center = new window.kakao.maps.LatLng(SEOUL.lat, SEOUL.lng);
        const map = new window.kakao.maps.Map(mapElement.current, { center, level: 6 });
        map.addControl(new window.kakao.maps.MapTypeControl(), window.kakao.maps.ControlPosition.TOPRIGHT);
        map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
        mapInstance.current = map;
        setStatus("ready");
        setMessage("지도가 연결되었습니다. 현재 위치를 찾고 있습니다…");
        locateUser();
      });
    };
    script.onerror = showMapError;
    document.head.appendChild(script);
    return () => script.remove();
  }, [key]);

  function showMapError() {
    setStatus("error");
    setMessage("지도를 열지 못했습니다. 키와 등록된 사이트 주소를 확인해 주세요.");
  }

  function locateUser() {
    if (!navigator.geolocation) {
      setMessage("위치 기능을 지원하지 않아 서울시청을 표시합니다.");
      void loadWeather(SEOUL.lat, SEOUL.lng, "서울시청 기준");
      return;
    }
    setMessage("현재 위치를 찾는 중입니다…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (!window.kakao || !mapInstance.current) return;
      const position = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
      mapInstance.current.setCenter(position);
      markerInstance.current?.setMap(null);
      const marker = new window.kakao.maps.Marker({ position });
      marker.setMap(mapInstance.current);
      markerInstance.current = marker;
      setMessage("현재 위치를 지도에 표시했습니다.");
      void loadWeather(coords.latitude, coords.longitude, "현재 위치 기준");
    }, () => {
      setMessage("위치 권한이 없어 서울시청을 표시합니다.");
      void loadWeather(SEOUL.lat, SEOUL.lng, "서울시청 기준");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  async function loadWeather(lat: number, lng: number, label: string) {
    setWeatherMessage(`${label} 날씨를 불러오는 중입니다…`);
    try {
      const params = new URLSearchParams({
        latitude: String(lat), longitude: String(lng), timezone: "auto", wind_speed_unit: "ms",
        current: "temperature_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m",
        daily: "sunrise,sunset,precipitation_probability_max"
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) throw new Error("weather request failed");
      const data = await response.json();
      const current = data.current;
      const sunrise = data.daily.sunrise[0] as string;
      const sunset = data.daily.sunset[0] as string;
      const rainChance = Number(data.daily.precipitation_probability_max[0] ?? 0);
      const apparent = Number(current.apparent_temperature);
      const wind = Number(current.wind_speed_10m);
      const gust = Number(current.wind_gusts_10m);
      const rain = Number(current.rain ?? current.precipitation ?? 0);
      const code = Number(current.weather_code);
      let score = 100;
      if (apparent <= 0) score -= 30; else if (apparent < 5) score -= 20; else if (apparent < 10) score -= 8;
      if (apparent >= 35) score -= 40; else if (apparent >= 30) score -= 25; else if (apparent >= 27) score -= 10;
      if (wind >= 15) score -= 40; else if (wind >= 10) score -= 28; else if (wind >= 7) score -= 18; else if (wind >= 4) score -= 7;
      if (gust >= 20) score -= 20; else if (gust >= 14) score -= 10;
      if (rain > 0) score -= 35;
      if (rainChance >= 70) score -= 25; else if (rainChance >= 40) score -= 15; else if (rainChance >= 20) score -= 6;
      if (code >= 95) score -= 40; else if (code >= 71 && code <= 86) score -= 35;
      const now = new Date();
      if (now < new Date(sunrise) || now > new Date(sunset)) score -= 20;
      score = Math.max(0, Math.min(100, Math.round(score)));
      const summary = score >= 85 ? "라이딩하기 아주 좋은 날이에요" : score >= 70 ? "가볍게 달리기 좋은 날이에요" : score >= 50 ? "주의하며 짧게 달리세요" : score >= 30 ? "오늘은 라이딩을 권하지 않아요" : "안전을 위해 라이딩을 미루세요";
      setWeather({
        temperature: Number(current.temperature_2m), apparent, wind, gust, rain, rainChance,
        sunrise, sunset, score, summary,
        temperatureNote: apparent >= 30 ? "더위 주의" : apparent <= 5 ? "방한 준비" : "쾌적해요",
        windNote: wind >= 10 ? "강풍 주의" : wind >= 7 ? "바람 주의" : wind >= 4 ? "약간 강해요" : "약한 바람",
        rainNote: rain > 0 ? "현재 비가 와요" : rainChance >= 40 ? "우비를 챙기세요" : "비 가능성 낮음"
      });
      setWeatherMessage(`${label} · ${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 갱신`);
    } catch {
      setWeatherMessage("날씨를 불러오지 못했습니다. 잠시 후 현재 위치를 다시 눌러주세요.");
    }
  }

  function saveKey() {
    const cleanKey = draftKey.trim();
    if (!cleanKey) return setMessage("JavaScript 키를 입력해 주세요.");
    window.localStorage.setItem("riding-kakao-js-key", cleanKey);
    setKey(cleanKey);
  }

  function resetKey() {
    window.localStorage.removeItem("riding-kakao-js-key");
    window.location.reload();
  }

  return <main>
    <header className="topbar">
      <div className="brand"><span className="brandMark">↗</span><div><strong>내 라이딩 비서</strong><span>오늘의 라이딩을 더 안전하게</span></div></div>
      <div className="live"><span /> 라이딩 준비</div>
    </header>
    <section className="dashboard">
      <div className="intro">
        <div><p className="eyebrow">RIDE SMART · RIDE SAFE</p><h1>출발 전에<br /><em>길부터 확인하세요.</em></h1><p className="introText">현재 위치를 중심으로 실제 카카오 지도를 확인하고 라이딩을 준비할 수 있습니다.</p></div>
        <div className="scoreCard"><span>현재 라이딩 지수</span><strong>{weather?.score ?? "--"}<small>점</small></strong><p>{weather?.summary ?? "위치를 확인하고 있어요"}</p><small className="weatherSource">{weatherMessage}</small></div>
      </div>
      <div className="stats">
        <article><span>기온 · 체감</span><strong>{weather ? `${Math.round(weather.temperature)}° · ${Math.round(weather.apparent)}°` : "--"}</strong><small>{weather?.temperatureNote ?? "불러오는 중"}</small></article><article><span>바람 · 돌풍</span><strong>{weather ? `${weather.wind.toFixed(1)} m/s` : "--"}</strong><small>{weather ? `${weather.windNote} · 돌풍 ${weather.gust.toFixed(1)}` : "불러오는 중"}</small></article><article><span>오늘 강수확률</span><strong>{weather ? `${weather.rainChance}%` : "--"}</strong><small>{weather?.rainNote ?? "불러오는 중"}</small></article><article><span>일몰</span><strong>{weather ? new Date(weather.sunset).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--"}</strong><small>야간 라이트 확인</small></article>
      </div>
      <section className="mapCard">
        <div className="mapHeader"><div><p className="eyebrow">LIVE MAP</p><h2>내 주변 라이딩 지도</h2><p>{message}</p></div><button className="locateButton" onClick={locateUser} disabled={status !== "ready"}>◎ 현재 위치</button></div>
        <div className="mapWrap">
          <div ref={mapElement} className="map" aria-label="카카오 지도" />
          {(status === "setup" || status === "error") && <div className="setupPanel"><div className="kakaoBadge">KAKAO MAP</div><h3>{status === "error" ? "지도를 열지 못했어요" : "지도 연결하기"}</h3><p>카카오 Developers에서 복사한 <b>JavaScript 키</b>를 아래 칸에 붙여 넣으세요.</p><label htmlFor="kakao-key">JavaScript 키</label><input id="kakao-key" type="password" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="키를 여기에 붙여 넣기" autoComplete="off" /><button onClick={saveKey}>카카오 지도 열기</button><small>키는 이 기기의 브라우저에만 저장됩니다.</small></div>}
          {status === "loading" && <div className="loadingPanel"><span className="spinner" />지도를 준비하고 있습니다</div>}
        </div>
        <div className="mapFooter"><span>위치 사용을 허용하면 내 위치에 표시가 생깁니다.</span>{key && <button onClick={resetKey}>카카오 키 다시 입력</button>}</div>
      </section>
    </section>
  </main>;
}

import { readFileSync } from "node:fs";

const [htmlPath = "parking.html", cssPath = "parking.css"] = process.argv.slice(2);
const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");

const venueAddress = "서울특별시 강남구 테헤란로81길 14";
const parkingLots = [
  "서울 선릉과 정릉 민영 주차장",
  "삼성제일민영주차장",
  "삼성제일주차장",
  "아마노 토펙신사옥 주차장",
  "테헤란로69길노상공영주차장",
  "송현빌딩 주차장",
  "시큐어파킹 JUSTCO 삼성점 민영 주차장",
  "테헤란로26길주차장",
  "나이스파크 강남 저스트코타워 주차장",
];

const checks = [
  ["Korean document language", /<html[^>]+lang=["']ko["']/i.test(html)],
  ["parking stylesheet link", /<link[^>]+href=["']parking\.css["']/i.test(html)],
  ["venue address", html.includes(venueAddress)],
  ["venue coordinates", html.includes("37.508067198284") && html.includes("127.05714966107")],
  ["venue map image", /img\/map_capture\.png/.test(html) && /alt=["'][^"']*행사장/.test(html)],
  ["warning copy", html.includes("❗ 본 건물에는 주차가 불가합니다.") && html.includes("죄송하지만 인근 유료주차장 이용을 부탁드립니다.")],
  ["all nearby parking lots", parkingLots.every((lot) => html.includes(lot))],
  ["parking links target blank", [...html.matchAll(/<a\b[^>]*href=["']https:\/\/map\.naver\.com\/p\/search\/[^"']+["'][^>]*>/gi)].every(([tag]) => /target=["']_blank["']/i.test(tag))],
  ["parking links noopener", [...html.matchAll(/<a\b[^>]*href=["']https:\/\/map\.naver\.com\/p\/search\/[^"']+["'][^>]*>/gi)].every(([tag]) => /rel=["']noopener["']/i.test(tag))],
  ["touch target", /min-height\s*:\s*44px/.test(css)],
  ["focus style", /:focus-visible\s*\{[^}]*outline\s*:/.test(css)],
  ["mobile overflow guard", /overflow-x\s*:\s*hidden/.test(css)],
];

let failed = false;
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  failed ||= !passed;
}

process.exit(failed ? 1 : 0);

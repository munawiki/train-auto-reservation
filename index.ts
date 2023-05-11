import puppeteer, { Page } from "puppeteer";
import { Time, Region } from "./variables";
import dotenv from "dotenv";

dotenv.config();

const ID = process.env.ID;
const PASSWORD = process.env.PASSWORD;

if (!ID || !PASSWORD) throw new Error("ID or PASSWORD is not defined");

const START: Region = "수서"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포
const END: Region = "울산통도사"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포

const DATE = "2023.05.13";
const TIME: Time = "00"; // 00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22
const WANT_START_TIME = "00"; // 원하는 출발 시간 시작
const WANT_START_MINUTE = "00"; // 원하는 출발 분 시작
const WANT_END_TIME = "24"; // 원하는 출발 시간 끝
const WANT_END_MINUTE = "00"; // 원하는 출발 분 끝

(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1980,
      height: 1080,
    },
  });

  const [page] = await browser.pages();

  // ----------------------------------------------
  // 로그인
  await page.goto("https://etk.srail.kr/cmc/01/selectLoginForm.do");
  await page.type("#srchDvNm01", ID);
  await page.type("#hmpgPwdCphd01", PASSWORD);

  await page.click(
    "#login-form > fieldset > div.input-area.loginpage.clear > div.fl_l > div.con.srchDvCd1 > div > div.fl_r > input"
  );

  await page.waitForNavigation();

  // ----------------------------------------------
  // 메인 페이지
  const mainPage = await page.url();

  // 팝업창 닫기
  const popup = new Promise((x) => page.once("popup", x));
  popup.then((popup) => (popup as Page).close());

  await page.select("#dptRsStnCd", Region[START]);
  await page.select("#arvRsStnCd", Region[END]);
  await page.$eval(
    "#search-form input.calendar1",
    (el, date) => {
      el.value = date;
    },
    DATE
  );
  await page.select("#dptTm", `${TIME}0000`);
  await page.click("#search-form > fieldset > a");
  await page.waitForNavigation();

  // ----------------------------------------------
  // 예매 페이지

  while (true) {
    while (
      await page.$$eval(
        "table > tbody > tr",
        (
          el,
          DATE,
          WANT_START_TIME,
          WANT_START_MINUTE,
          WANT_END_TIME,
          WANT_END_MINUTE
        ) => {
          // 일반석
          const reservations = [...el]
            .filter((v) => v.children[6].children[0].textContent === "예약하기")
            .map((v): [string, HTMLElement] => [
              v.children[3].textContent?.slice(-5) || "00:00",
              v.children[6].children[0] as HTMLElement,
            ])
            .filter(([time, el]) => {
              const gotTime = new Date(`${DATE} ${time}`).getTime();
              const wantStartTime = new Date(
                `${DATE} ${WANT_START_TIME}:${WANT_START_MINUTE}`
              ).getTime();
              const wantEndTime = new Date(
                `${DATE} ${WANT_END_TIME}:${WANT_END_MINUTE}`
              ).getTime();

              return gotTime >= wantStartTime && gotTime <= wantEndTime;
            })
            .sort((a, b) => Number(a[0]) - Number(b[0]));

          if (reservations.length > 0) {
            reservations[0][1].click();
            return false;
          }

          // 특실

          const _reservations = [...el]
          .filter((v) => v.children[5].children[0].textContent === "예약하기")
          .map((v): [string, HTMLElement] => [
            v.children[3].textContent?.slice(-5) || "00:00",
            v.children[5].children[0] as HTMLElement,
          ])
          .filter(([time, el]) => {
            const gotTime = new Date(`${DATE} ${time}`).getTime();
            const wantStartTime = new Date(
              `${DATE} ${WANT_START_TIME}:${WANT_START_MINUTE}`
            ).getTime();
            const wantEndTime = new Date(
              `${DATE} ${WANT_END_TIME}:${WANT_END_MINUTE}`
            ).getTime();

            return gotTime >= wantStartTime && gotTime <= wantEndTime;
          })
          .sort((a, b) => Number(a[0]) - Number(b[0]));

        if (_reservations.length > 0) {
          reservations[0][1].click();
          return false;
        }

          return true;
        },
        DATE,
        WANT_START_TIME,
        WANT_START_MINUTE,
        WANT_END_TIME,
        WANT_END_MINUTE
      )
    ) {
      await page.reload();
    }

    await page.waitForNavigation();
    const alertBox = await page.$('.alert_box');

    if(alertBox) {
      console.log('예약 완료')
      break;
    }else{
      console.log('재시도')
      await page.goBack();
    }
  }
})();

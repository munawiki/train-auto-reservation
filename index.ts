import puppeteer, { Page } from "puppeteer";
import { Time, Region } from "./variables";

const ID = "YOUR ID";
const PASSWORD = "YOUR PASSWORD";

const START: Region = "동대구"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포
const END: Region = "수서"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포
const DATE = "2023.01.02";
const TIME: Time = "00"; // 00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22

(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

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

  // 팝업창 닫기
  // const popup = await new Promise((x) => page.once("popup", x));
  // await (popup as Page).close();
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
  while (
    await page.$$eval("table > tbody td:nth-child(7) a", (el) => {
      const reservations = [...el].filter((v) => v.textContent === "예약하기");

      if (reservations.length > 0) {
        reservations[0].click();
        return false;
      }

      return true;
    })
  ) {
    await page.reload();
  }
})();

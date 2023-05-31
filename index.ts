import puppeteer, { Page } from "puppeteer";
import { Time, Region } from "./variables";
import dotenv from "dotenv";

dotenv.config();

const ID = process.env.ID;
const PASSWORD = process.env.PASSWORD;

if (!ID || !PASSWORD) throw new Error("ID or PASSWORD is not defined");

const START: Region = "수서"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포
const END: Region = "울산통도사"; // 서울, 수서, 동탄, 평택지제, 천안아산, 오송, 대전, 김천구미, 서대구, 동대구, 신경주, 울산통도사, 부산, 공주, 익산, 정읍, 광주송정, 나주, 목포

const DATE = "2023.05.04";
const TIME: Time = "18"; // 00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22
const WANT_START_TIME = "18"; // 원하는 출발 시간 시작
const WANT_START_MINUTE = "10"; // 원하는 출발 분 시작
const WANT_END_TIME = "22"; // 원하는 출발 시간 끝
const WANT_END_MINUTE = "00"; // 원하는 출발 분 끝

// export const handleReservation = async (
//   _event: Electron.IpcMainEvent,
//   {
//     account,
//     accountType,
//     date,
//     fromStation,
//     password,
//     toStation,
//     fromTime,
//     toTime
//   }: ReservationAPIParams
// ): Promise<void> => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: {
//       width: 1280,
//       height: 720
//     }
//   })
//   const [page] = await browser.pages()

//   // 로그인
//   await login(page, { accountType, account, password })
//   await page.waitForNavigation()

//   const mainUrl = page.url()

//   // 팝업창 닫기
//   const popup = new Promise((x) => page.once('popup', x))
//   popup.then((popup) => (popup as Page).close())

//   while (true) {
//     // 옵션 고르기
//     await selectOptions(page, {
//       fromStation,
//       toStation,
//       date: dayjs(date).format('YYYY.MM.DD'),
//       hour: Math.floor(dayjs(`${date} ${fromTime}`).hour() / 2) * 2
//     })

//     while (true) {
//       await page.waitForNavigation()

//       const rows = await page.$$('table > tbody > tr')

//       const timeCols = await Promise.all(
//         rows.map(async (v) => [
//           await v.$eval('td:nth-child(4) > em', (el) => el.textContent),
//           await v.$eval('td:nth-child(5) > em', (el) => el.textContent)
//         ])
//       )

//       const reservableTimeConditions = timeCols.map(([from, to]) => {
//         const srtFromDateTime = dayjs(`${date} ${from}`)
//         const srtToDateTime =
//           to?.split(':')[0] === '00' ? dayjs(`${date} ${to}`).add(1, 'day') : dayjs(`${date} ${to}`)

//         const userFromTime = dayjs(`${date} ${fromTime}`)
//         const userToTime = dayjs(`${date} ${toTime}`)

//         return srtFromDateTime.isAfter(userFromTime) && srtToDateTime.isBefore(userToTime)
//       })

//       const reservableRows = rows.filter((_, i) => reservableTimeConditions[i])

//       const reservableEconomySeatsConditions = await Promise.all(
//         reservableRows.map((v) =>
//           v.$eval('td:nth-child(7) > a', (el) => el.textContent === '예약하기')
//         )
//       )

//       const reservableEconomySeats = reservableRows.filter(
//         (_, i) => reservableEconomySeatsConditions[i]
//       )

//       if (reservableEconomySeats.length > 0) {
//         await reservableEconomySeats[0].$eval('td:nth-child(7) > a', (el) => el.click())
//         await page.waitForNavigation()

//         const strong = await page.$(
//           '#wrap > div.container.container-e > div > div.sub_con_area > div.alert_box > strong'
//         )

//         const isReservation = await strong?.evaluate(
//           (el) => el.textContent === '10분 내에 결제하지 않으면 예약이 취소됩니다.'
//         )

//         if (!isReservation) {
//           page.goto(mainUrl)
//           await page.waitForNavigation()
//           break
//         }

//         const url = page.url()
//         const pageID = url.split('?')[1].split('=')[1]

//         sendNotification(
//           `예약 가능한 좌석이 있습니다. 15분 안에 결제하세요. https://etk.srail.kr/hpg/hra/02/selectReservationList.do?pageId=${pageID}`
//         )

//         return browser.close()
//       } else {
//         page.reload()
//       }
//     }
//   }
// }

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
})();

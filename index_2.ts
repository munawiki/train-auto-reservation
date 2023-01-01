import puppeteer, { ElementHandle } from "puppeteer";

(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

  // 로그인
  await page.goto("https://etk.srail.kr/cmc/01/selectLoginForm.do");
  await page.type("#srchDvNm01", "");
  await page.type("#hmpgPwdCphd01", "");

  await page.click(
    "#login-form > fieldset > div.input-area.loginpage.clear > div.fl_l > div.con.srchDvCd1 > div > div.fl_r > input"
  );

  await page.waitForNavigation();

  // ----------------------------------------------
  // 메인 페이지

  // const popup = await new Promise((x) => page.once("popup", x));
  // await (popup as Page).close();

  await page.select("#dptRsStnCd", "0551");
  await page.select("#arvRsStnCd", "0015");
  await page.$eval("#search-form input.calendar1", (el) => {
    el.value = "2023.01.02";
  });
  await page.select("#dptTm", "000000");
  await page.click("#search-form > fieldset > a");
  await page.waitForNavigation();

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

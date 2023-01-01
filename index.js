const Nightmare = require("nightmare");
const nightmare = new Nightmare({ show: true });

(async function () {
  await nightmare.useragent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
  );
  await nightmare.goto("https://etk.srail.kr/cmc/01/selectLoginForm.do");
  await nightmare.click(
    "#login-form > fieldset > div.input-area.loginpage.clear > div.fl_l > div.con.srchDvCd1 > div > div.fl_r > input"
  );

  await nightmare.wait(3000);

  // await nightmare.select("#dptRsStnCd", "0551");
  // await nightmare.select("#arvRsStnCd", "0015");
  // await nightmare.evaluate(() => {
  //   document.querySelector("#search-form input.calendar1").value = "2023.01.02";
  // });
  // await nightmare.select("#dptTm", "000000");
  // await nightmare.click("#search-form > fieldset > a");
  // await nightmare.wait(2000);

  // const tableExists = await nightmare.exists(
  //   "#result-form > fieldset > div.tbl_wrap.th_thead"
  // );

  // if (tableExists) {
  //   const arrs = await nightmare.evaluate(() => {
  //     return [
  //       ...document.querySelectorAll(
  //         "#result-form > fieldset > div.tbl_wrap.th_thead > table > tbody td:nth-child(7) > a"
  //       ),
  //     ]
  //       .map((el, idx) => [el.innerText, idx])
  //       .filter((el) => el[0] === "예약하기")
  //       .map((el) => el[1]);
  //   });

  //   if (arrs.length > 0) {
  //     await nightmare.click(
  //       `#result-form > fieldset > div.tbl_wrap.th_thead > table > tbody > tr:nth-child(${
  //         arrs[0] + 1
  //       }) > td:nth-child(7) > a`
  //     );

  //     await nightmare.wait(10000);
  //   }
  // } else {
  //   console.log("없어용");
  //   nightmare.end();
  // }
})();

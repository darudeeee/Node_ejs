require("dotenv").config(); // dotenv 라이브러리를 불러와서 .env 파일의 내용을 환경 변수로 설정
const express = require("express"); // express 라이브러리를 불러와서 애플리케이션 인스턴스를 생성
const expressLayouts = require("express-ejs-layouts"); // express-ejs-layouts 라이브러리를 불러 ejs 사용
const connectDb = require("./config/db");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const app = express(); // Express 애플리케이션 인스턴스(객체)를 생성
const port = process.env.PORT || 3000; // .env 파일에 정의된 PORT 값을 가져오거나, 값이 없으면 기본 포트 번호 3000을 사용

connectDb();

app.use(expressLayouts); // express-ejs-layouts 미들웨어를 사용하여 EJS 템플릿 레이아웃 기능을 활성화
app.set("view engine", "ejs"); // EJS를 애플리케이션의 템플릿(HTML 동적 생성) 엔진으로 설정
app.set("views", "./views"); // 뷰 파일들이 위치한 디렉토리 설정
// 이 위 아래로 순서 중요
app.use(express.static("public")); // 'public' 폴더를 정적(고정된 값) 파일을 제공하는 폴더로 설정하여 파일들에 직접 접근할 수 있음

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(methodOverride("_method"));

app.use("/", require("./routes/main")); // '/' 경로에 대한 요청을 처리하기 위해 ./routes/main 파일에서 정의된 라우트를 사용
app.use("/", require("./routes/admin"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`); // 지정된 포트에서 서버를 시작하고, 서버가 실행 중임을 콘솔에 출력
});

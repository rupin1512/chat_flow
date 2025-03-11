document.addEventListener("DOMContentLoaded", function () {
  // 초기 설정 및 요소 참조
  const homeScreen = document.getElementById("home-screen");
  const voiceModal = document.getElementById("voice-modal");
  const genderModal = document.getElementById("gender-modal");
  const ageModal = document.getElementById("age-modal");
  const profileModal = document.getElementById("profile-modal");
  const chatScreen = document.getElementById("chat-screen");
  const startBtn = document.getElementById("start-btn");
  const voiceOption = document.getElementById("voice-option");
  const textOption = document.getElementById("text-option");
  const modeNextBtn = document.getElementById("mode-next-btn");
  const genderNextBtn = document.getElementById("gender-next-btn");
  const ageNextBtn = document.getElementById("age-next-btn");
  const startChatBtn = document.getElementById("start-chat-btn");
  const backBtn = document.getElementById("back-btn");
  const profileInfoBtn = document.getElementById("profile-info-btn");
  const profileInfo = document.querySelector(".profile-info");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const systemMessage = document.getElementById("system-message");
  const voiceBtn = document.getElementById("voice-btn");
  const voiceIndicator = document.getElementById("voice-indicator");

  // 사용자 프로필 관련 요소
  const selectedGenderEl = document.getElementById("selected-gender");
  const selectedAgeEl = document.getElementById("selected-age");
  const fakeName = document.getElementById("fake-name");
  const fakeId = document.getElementById("fake-id");
  const profileName = document.getElementById("profile-name");
  const profileId = document.getElementById("profile-id");

  // 사용자 선택 옵션들
  const genderBtns = document.querySelectorAll(".option-btn[data-value]");
  const ageBtns = document.querySelectorAll(".age-buttons .option-btn");

  // 상태 변수
  let userProfile = {
    gender: "",
    age: "",
    name: "",
    id: "",
  };

  let chatMode = "text"; // 기본값은 텍스트 모드
  let scenarioStep = 0; // 현재 시나리오 단계
  let isTyping = false; // 타이핑 인디케이터 상태

  // 가짜 이름 및 주민번호 생성 함수
  function generateFakeProfile(gender, age) {
    // 성별에 따른 이름 리스트
    const maleNames = ["김철수", "이민호", "박준영", "정우성", "최동현"];
    const femaleNames = ["김영희", "이지은", "박수진", "정유미", "최지현"];

    // 랜덤 이름 선택
    const nameList = gender === "male" ? maleNames : femaleNames;
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];

    // 주민등록번호 앞자리 (생년월일)
    let birthYear = "";
    switch (age) {
      case "under20":
        birthYear = (2010 - Math.floor(Math.random() * 10))
          .toString()
          .slice(-2);
        break;
      case "20s":
        birthYear = (2000 - Math.floor(Math.random() * 10))
          .toString()
          .slice(-2);
        break;
      case "30-40s":
        birthYear = (1990 - Math.floor(Math.random() * 15))
          .toString()
          .slice(-2);
        break;
      case "50s":
        birthYear = (1970 - Math.floor(Math.random() * 10))
          .toString()
          .slice(-2);
        break;
      case "over60":
        birthYear = (1960 - Math.floor(Math.random() * 15))
          .toString()
          .slice(-2);
        break;
      default:
        birthYear = "90";
    }

    // 월/일 랜덤 생성
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

    // 성별 구분 번호 (남자: 1,3 / 여자: 2,4)
    const genderNum =
      gender === "male"
        ? parseInt(birthYear) < 50
          ? "1"
          : "3"
        : parseInt(birthYear) < 50
        ? "2"
        : "4";

    // 랜덤 번호 생성
    const randomNums = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    // 주민등록번호 형식: YYMMDD-GXXXXXX
    const fakeId = `${birthYear}${month}${day}-${genderNum}${randomNums}`;

    return {
      name: randomName,
      id: fakeId,
    };
  }

  // 보이스피싱 시나리오
  const bankFraudScenario = [
    {
      text: "안녕하세요. 여기는 금융감독원 특별조사팀 조사관 박지훈입니다. 본인이 맞으신가요?",
      warning: false,
    },
    {
      text: "최근 고객님의 계좌에서 의심스러운 거래가 발견되었습니다. 혹시 어제 오후 3시경에 250만원을 송금하신 적이 있으신가요?",
      warning: false,
    },
    {
      text: "아니시라구요? 그렇다면 현재 고객님의 계좌가 해킹 당했을 가능성이 높습니다. 지금 바로 조치를 취해드리겠습니다.",
      warning: false,
    },
    {
      text: "먼저 본인 확인을 위해 성함과 주민등록번호를 알려주시겠어요?",
      warning: true,
    },
    {
      text: "네, 확인되었습니다. 그럼 지금 사용중인 은행과 계좌번호도 알려주세요. 해당 계좌로 접근을 차단하겠습니다.",
      warning: true,
    },
    {
      text: "마지막으로 본인 명의 휴대폰으로 인증번호를 발송했습니다. 받으신 인증번호를 알려주시면 즉시 계좌 보호 조치를 취하겠습니다.",
      warning: true,
    },
    {
      text: "죄송합니다만, 인증번호가 올바르지 않습니다. 다시 한번 확인해서 알려주시겠어요?",
      warning: true,
    },
    {
      text: "알려주신 정보로 확인 결과, 현재 고객님 계좌에서 해외로 송금이 진행 중입니다. 즉시 차단하기 위해 OTP 번호가 필요합니다.",
      warning: true,
    },
  ];

  // 시작 버튼 클릭 이벤트
  startBtn.addEventListener("click", function () {
    homeScreen.classList.remove("active");
    voiceModal.classList.add("active");
  });

  // 모드 선택 이벤트
  voiceOption.addEventListener("click", function () {
    voiceOption.classList.add("selected");
    textOption.classList.remove("selected");
    chatMode = "voice";
    modeNextBtn.disabled = false;
  });

  textOption.addEventListener("click", function () {
    textOption.classList.add("selected");
    voiceOption.classList.remove("selected");
    chatMode = "text";
    modeNextBtn.disabled = false;
  });

  // 모드 선택 후 다음 단계
  modeNextBtn.addEventListener("click", function () {
    voiceModal.classList.remove("active");
    genderModal.classList.add("active");
  });

  // 성별 선택 이벤트
  genderBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      genderBtns.forEach((b) => b.classList.remove("selected"));
      this.classList.add("selected");
      userProfile.gender = this.dataset.value;
      genderNextBtn.disabled = false;
    });
  });

  // 성별 선택 후 다음 단계
  genderNextBtn.addEventListener("click", function () {
    selectedGenderEl.textContent =
      userProfile.gender === "male" ? "남성" : "여성";
    genderModal.classList.remove("active");
    ageModal.classList.add("active");
  });

  // 나이 선택 이벤트
  ageBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      ageBtns.forEach((b) => b.classList.remove("selected"));
      this.classList.add("selected");
      userProfile.age = this.dataset.value;
      ageNextBtn.disabled = false;
    });
  });

  // 나이 선택 후 다음 단계
  ageNextBtn.addEventListener("click", function () {
    let displayAge = "";
    switch (userProfile.age) {
      case "under20":
        displayAge = "20대 미만";
        break;
      case "20s":
        displayAge = "20대";
        break;
      case "30-40s":
        displayAge = "30-40대";
        break;
      case "50s":
        displayAge = "50대";
        break;
      case "over60":
        displayAge = "60대 이상";
        break;
    }

    selectedAgeEl.textContent = displayAge;

    // 가짜 프로필 생성
    const fakeProfile = generateFakeProfile(
      userProfile.gender,
      userProfile.age
    );
    userProfile.name = fakeProfile.name;
    userProfile.id = fakeProfile.id;

    // 프로필 정보 표시
    fakeName.textContent = userProfile.name;
    fakeId.textContent = userProfile.id;
    profileName.textContent = `이름: ${userProfile.name}`;
    profileId.textContent = `주민등록번호: ${userProfile.id}`;

    ageModal.classList.remove("active");
    profileModal.classList.add("active");

    // 프로필 생성 애니메이션 시작
    const typingElements = document.querySelectorAll(".typing-effect");
    typingElements.forEach((el, index) => {
      el.style.width = "0";
      setTimeout(() => {
        el.style.width = "100%";
      }, index * 1000);
    });
  });

  // 채팅 시작 버튼
  startChatBtn.addEventListener("click", function () {
    profileModal.classList.remove("active");
    chatScreen.classList.add("active");

    // 음성 모드일 경우 마이크 버튼 표시
    if (chatMode === "voice") {
      voiceBtn.classList.add("active");
    }

    // 첫 메시지 표시
    setTimeout(() => {
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addMessage(bankFraudScenario[scenarioStep].text, "other");
        scenarioStep++;
      }, 2000);
    }, 1000);
  });

  // 뒤로가기 버튼
  backBtn.addEventListener("click", function () {
    if (confirm("체험을 종료하시겠습니까? 처음으로 돌아갑니다.")) {
      resetApp();
    }
  });

  // 프로필 정보 버튼
  profileInfoBtn.addEventListener("click", function () {
    profileInfo.classList.toggle("active");
  });

  // 채팅 외부 영역 클릭 시 프로필 정보 닫기
  document.addEventListener("click", function (e) {
    if (!profileInfoBtn.contains(e.target) && !profileInfo.contains(e.target)) {
      profileInfo.classList.remove("active");
    }
  });

  // 메시지 전송 버튼
  sendBtn.addEventListener("click", sendMessage);

  // 엔터키로 메시지 전송
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // 음성 버튼 (음성 모드일 때만 표시)
  voiceBtn.addEventListener("click", function () {
    voiceIndicator.classList.add("active");

    // 음성 인식 시뮬레이션 (실제로는 Web Speech API 등을 사용)
    setTimeout(() => {
      voiceIndicator.classList.remove("active");
      // 랜덤 대답 생성
      const randomResponses = [
        "네, 맞습니다",
        "아니요, 그런 적 없습니다",
        "무슨 말씀이신지...",
        "정확히 어떤 내용인가요?",
        "제 정보는 알려드릴 수 없습니다",
      ];
      const randomResponse =
        randomResponses[Math.floor(Math.random() * randomResponses.length)];
      addMessage(randomResponse, "user");
      processUserResponse();
    }, 3000);
  });

  // 메시지 전송 함수
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      addMessage(message, "user");
      messageInput.value = "";
      processUserResponse();
    }
  }

  // 사용자 응답 처리 함수
  function processUserResponse() {
    // 다음 시나리오로 진행
    if (scenarioStep < bankFraudScenario.length) {
      // 경고 메시지 표시 여부 확인
      if (bankFraudScenario[scenarioStep - 1].warning) {
        systemMessage.classList.add("active");
        setTimeout(() => {
          systemMessage.classList.remove("active");
        }, 5000);
      }

      // 다음 메시지 표시
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          addMessage(bankFraudScenario[scenarioStep].text, "other");
          scenarioStep++;
        }, 2000);
      }, 1000);
    } else {
      // 시나리오 종료 (체험 완료)
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          addMessage(
            "체험이 완료되었습니다. 보이스피싱은 항상 개인정보와 금융정보를 요구합니다. 어떤 상황에서도 개인정보, 계좌번호, 인증번호, OTP 등을 알려주지 마세요.",
            "other"
          );

          // 완료 메시지 후 리셋 버튼 표시
          const resetBtn = document.createElement("button");
          resetBtn.textContent = "처음으로 돌아가기";
          resetBtn.className = "primary-btn";
          resetBtn.style.margin = "1rem auto";
          resetBtn.style.display = "block";
          chatMessages.appendChild(resetBtn);

          resetBtn.addEventListener("click", resetApp);
        }, 2000);
      }, 1000);
    }
  }

  // 메시지 추가 함수
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";

    // 현재 시간 포맷팅
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeDiv.textContent = `${hours}:${minutes}`;

    messageDiv.appendChild(timeDiv);
    chatMessages.appendChild(messageDiv);

    // 스크롤 최하단으로 이동
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 타이핑 인디케이터 표시 함수
  function showTypingIndicator() {
    if (!isTyping) {
      isTyping = true;
      const typingDiv = document.createElement("div");
      typingDiv.className = "typing-indicator";
      typingDiv.id = "typing";

      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        typingDiv.appendChild(dot);
      }

      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // 타이핑 인디케이터 숨김 함수
  function hideTypingIndicator() {
    const typingDiv = document.getElementById("typing");
    if (typingDiv) {
      typingDiv.remove();
      isTyping = false;
    }
  }

  // 앱 초기화 함수
  function resetApp() {
    // 모든 화면 숨기기
    homeScreen.classList.add("active");
    voiceModal.classList.remove("active");
    genderModal.classList.remove("active");
    ageModal.classList.remove("active");
    profileModal.classList.remove("active");
    chatScreen.classList.remove("active");

    // 채팅 내용 초기화
    chatMessages.innerHTML = "";

    // 상태 초기화
    userProfile = { gender: "", age: "", name: "", id: "" };
    chatMode = "text";
    scenarioStep = 0;
    isTyping = false;

    // 선택 옵션 초기화
    voiceOption.classList.remove("selected");
    textOption.classList.remove("selected");
    genderBtns.forEach((btn) => btn.classList.remove("selected"));
    ageBtns.forEach((btn) => btn.classList.remove("selected"));

    // 버튼 비활성화
    modeNextBtn.disabled = true;
    genderNextBtn.disabled = true;
    ageNextBtn.disabled = true;

    // 기타 요소 초기화
    profileInfo.classList.remove("active");
    systemMessage.classList.remove("active");
    voiceIndicator.classList.remove("active");
    voiceBtn.classList.remove("active");
  }
});

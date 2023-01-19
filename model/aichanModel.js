const axios = require("axios");
const { API_KEY_OPEN_AI } = require("../config");

const AichanHandler = async (text, msg) => {
  //Waiting Aichan
  msg.reply("Aichan lagi memproses jawaban kamu, tunggu sebentar ya...");

  // ChatGPT
  const question = text;
  const response = await ChatGPTRequest(question);

  // Cek Result
  if (!response.success) {
    return msg.reply(response.message);
  }
  return msg.reply(response.data);
};

const ChatGPTRequest = async (text) => {
  const result = {
    success: false,
    data: null,
    message: "",
  };

  return await axios({
    method: "post",
    url: "https://api.openai.com/v1/completions",
    data: {
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 1000,
      temperature: 0,
    },
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": "in-ID",
      Authorization: `Bearer ${API_KEY_OPEN_AI}`,
    },
  })
    .then((response) => {
      if (response.status == 200) {
        result.success = true;
        result.data =
          response.data?.choices?.[0]?.text || "Gomene... Aichan gatau :(";
      } else {
        result.message = "Failed response";
      }

      return result;
    })
    .catch((error) => {
      result.message = "Error : " + error.message;
      return result;
    });
};

module.exports = {
  AichanHandler,
};

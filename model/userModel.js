const fs = require("fs");
const dataPath = "./data/dataUser.json";

// Util Function
const SaveUserData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};
const GetUserData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

// Cek User
const ChekUserData = (phone) => {
  const existUser = GetUserData();
  return existUser[phone] ? "valid" : "invalid";
};

// Cek Status User
const ChekStatusUser = (phone) => {
  const existUser = GetUserData();
  return existUser[phone].status;
};

// Tambah User
const AddUserData = (phone, status, text) => {
  const existUser = GetUserData();
  existUser[phone] = {
    status: status,
    last_msg: text,
  };
  SaveUserData(existUser);
  return "valid";
};

// Update User
const UpdateUserData = (phone, status, text) => {
  const existUser = GetUserData();
  // Readfile
  fs.readFile(dataPath, "utf8", () => {
    // Set Data Update
    existUser[phone] = {
      status: status,
      last_msg: text,
    };
    // Save Update
    SaveUserData(existUser);
  });
  return "valid";
};

module.exports = {
  ChekUserData,
  ChekStatusUser,
  AddUserData,
  UpdateUserData,
};

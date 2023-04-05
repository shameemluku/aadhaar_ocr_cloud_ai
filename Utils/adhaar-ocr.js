require("dotenv").config();
const vision = require("@google-cloud/vision");

// Create a client
const client = new vision.ImageAnnotatorClient();

const parseFront = async (file) => {
  let parsedData = {};
  let passGov = false;
  let gotName = false;
  const request = {
    image: {
      content: Buffer.from(file, "base64"),
    },
  };

  let results = await client.textDetection(request);
  const result = results[0].textAnnotations[0].description;

  // console.log(result);

  for await (row of result.split("\n")) {
    if (
      row?.replaceAll(/[^0-9]/g, "").match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)
    ) {
      parsedData["UID"] = row?.replaceAll(/[^0-9]/g, "");
    } else if (
      row.toUpperCase().match("DOB") ||
      row.toUpperCase().match("DATE OF BIRTH") ||
      row.toUpperCase().match("YEAR OF BIRTH") ||
      row.toUpperCase().match("D.O.B") ||
      row.includes("जन्म")
    ) {
      parsedData["DOB"] = row.replaceAll(" ", "").split(":")[1];
    } else if (row.toUpperCase().match("MALE")) {
      if (row.toUpperCase().match("FEMALE")) {
        parsedData["Gender"] = "Female";
      } else {
        parsedData["Gender"] = "Male";
      }
    }

    if (
      (!gotName &&
        !passGov &&
        row.toUpperCase().match("GOVERNMENT OF INDIA")) ||
      row.toUpperCase().includes("GOVERNMENT") ||
      row.toUpperCase().includes("GOVERN") ||
      row.toUpperCase().includes("INDIA") ||
      row.includes("भारत सरकार") ||
      row.includes("तिथि")
    ) {
      passGov = true;
    } else if (
      !gotName &&
      passGov &&
      /^[a-zA-Z. ]*$/.test(row) &&
      /^[A-Z]*$/.test(row[0])
    ) {
      parsedData["Name"] = row;
      gotName = true;
    }
  }

  return parsedData;
};

const parseBack = async (file) => {
  let flag = 0;
  let address = "";
  let uidBack = "";

  const request = {
    image: {
      content: Buffer.from(file, "base64"),
    },
  };

  let results = await client.textDetection(request);

  const result = results[0].textAnnotations[0].description;

  // console.log(result);

  for await (row of result.split("\n")) {
    if (
      flag === 0 &&
      (row.match(/Address:/g) ||
        row.match(/Address/g) ||
        row.match(/ADDRESS:/g))
    ) {
      let splitted = row.split(":");

      address +=
        splitted.length > 2
          ? row.split(":")[1] + row.split(":")[2]
          : row.split(":")[1];
      flag = 1;
    } else if (flag === 1) {
      if (
        !row
          ?.replaceAll(/[^0-9]/g, "")
          .match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/) ||
        row?.replace(/[^a-zA-Z]/g, "")?.length !== 0
      ) {
        if (row.toUpperCase().includes("WWW")) {
          return { address, uid: uidBack };
        }
        if (row.toUpperCase().replaceAll(/[^0-9]/g, "") === "1947") {
          return { address, uid: uidBack };
        }
        if (row.length <= 1) {
          return { address, uid: uidBack };
        }
        address += `${row}`;
      } else {
        uidBack = row?.replaceAll(/[^0-9]/g, "");
        return { address, uid: uidBack };
      }
    }
  }

  return { address, uid: uidBack };
};

const execute = async (front, back) => {
  
  let parsedData = {};
  let uidBack = "";
  let address = "";
  let back_data;
  let reponse;

  await Promise.allSettled([parseFront(front, parsedData), parseBack(back)])
    .then((results) => {
      parsedData = results[0].value;
      address = results[1]?.value?.address;
      uidBack = results[1]?.value?.uid;
      parsedData["address"] =
        address[0] === " " ? address.replace(" ", "") : address;

      let pincode = address?.match(/\d{6}/gm);
      if (pincode && pincode?.length !== 0) parsedData["pincode"] = pincode[0];
      reponse = {
        status: true,
        data: parsedData,
        message: "Parsing Successfull",
      };
    })
    .catch((err) => {
      console.log(err);
      reponse = {
        status: false,
        message: "Parsing failed",
        error: err?.message,
      };
    });

    return reponse;

};
module.exports = {
  execute,
};

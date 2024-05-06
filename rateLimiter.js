const express = require("express");

const app = express();

const clients = {};
let paths = {};
const limit = 50;
// {
//   "api/s": {
//     123: [0,1,2,4],
//     234: []
//   }
//   "api/l": {
//     123:[],
//   }
// }
// {
//   start: 77777;
//   end: 77777+ 1000*60;
//   count: ;
// }

const rateLimitter = function (path, clientId) {
  const d = new Date();
  let time = d.getTime();
  if (!clients[clientId]) {
    clients[clientId] = {
      start: time,
      end: time + 1000 * 60,
      count: 1,
    };
  }
  if (clients[clientId].count >= 100) {
    return false;
  }
  if (clients[clientId].end < time) {
    clients[clientId].start = time;
    clients[clientId].end = time + 1000 * 60;
    clients[clientId].count = 1;
  } else {
    clients[clientId].count++;
  }

  if (!paths[path]) {
    paths[path] = {
      clientId: [],
    };
    paths[path][clientId].push(time);
    return true;
  }
  const obj = paths[path];
  if (obj[clientId]) {
    let count = 0;
    for (let i = obj[clientId].length - 1; i >= 0; i--) {
      if (obj[clientId][i] >= time - 1000 * 60) {
        count++;
      } else {
        break;
      }
    }
    if (count > 50) {
      return false;
    }
    paths[path][clientId].push(time);
    return true;
  }
  paths[path][clientId] = [];
  paths[path][clientId].push(time);
  return true;
};

app.use("/", (req, res) => {
  res.json({
    data: `${rateLimitter(req.path, req.clientId)}`,
  });
});

app.listen(3000, (error) => {
  if (!error) console.log("Server is Successfully Running,and App is listening on port " + 3000);
  else console.log("Error occurred, server can't start", error);
});

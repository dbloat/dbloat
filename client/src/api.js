let base64 = require('base-64');
module.exports = {
  async callApiFirst (path, auth)  {
    const response = await fetch(path, { headers: { "Authorization": auth } }  );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.error);
    return body;
  },
  async callApi (path)  {
    let auth = localStorage.getItem('auth');
    const response = await fetch(path, { headers: { "Authorization": auth } }  );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.error);
    return body;
  },
  async callPostApi (path, data)  {
    let auth = localStorage.getItem('auth');
    const response = await fetch(path, {method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json", "Authorization": auth } });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.error);
    return body;
  },
  async callPostApiFirst (path, data, auth)  {
    const response = await fetch(path, {method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json", "Authorization": auth } });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.error);
    return body;
  },
  createAuth(user,pass) {
    return 'Basic ' + base64.encode(user + ":" +pass);
  }
};

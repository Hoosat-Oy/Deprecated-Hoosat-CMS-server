import https from 'https';


const checkSession = async (token) => {
  try {
    let uri = encodeURI(process.env.AUTHENTICATION_API + "/authentication/confirm");
    const result = await fetch(uri, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json; charset=utf-8",
      }),
      body: JSON.stringify({
        token: token
      })
    });
    const response = await result.json();
    return response;
  } catch (error) {
    if(process.env.NODE_ENV === "development") console.log(error);
    throw new Error(error);
  }
}

const getAccount = async (id) => {
  try {
    let uri = encodeURI(process.env.AUTHENTICATION_API + `/account/${id}`);
    const result = await fetch(uri, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json; charset=utf-8",
      })
    });
    const response = await result.json();
    return response.account;
  } catch (error) {
    if(process.env.NODE_ENV === "development") console.log(error);
    throw new Error(error);
  }
}

export default {
  checkSession,
  getAccount
}


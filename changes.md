```json
{
  "REST": "https://api.citynet.ai",
  "MASTER_KEY": "Q1nhJleILCtC9UtjWw46dnM4MKfL8cV2"
}
/* exemple false login */
{
    "valid": false,
    "param": "password",
    "message": "incorrect password"
}
```

```javascript
// login
export function login(url, data) {
  return fetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Base64.encode(`${data.email}:${data.password}`)}`
    },
    body: JSON.stringify(data)
  });
}
// post request
export function post(url, data) {
  const headers = [];
  headers['Content-Type'] = 'application/json';
  headers.Accept = 'application/json';

  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

//delete request
export function remove(url) {
  const headers = [];
  headers['Content-Type'] = 'application/json';
  headers.Accept = 'application/json';

  return fetch(url, {
    method: 'DELETE',
    headers
  });
}

// upload file
export function upload(url, data) {
  return fetch(url, {
    method: 'PUT',
    body: data
  });
}

// put
export function put(url, data) {
  const headers = [];
  headers['Content-Type'] = 'application/json';
  headers.Accept = 'application/json';

  return fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
```

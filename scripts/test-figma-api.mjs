async function run() {
  const url = 'https://api.figma.com/v1/images/BUnPpoy5RamuIhyqzuSeiL?ids=4:15&format=png&scale=2';
  const res = await fetch(url);
  console.log('Status without token:', res.status);
  const json = await res.json().catch(() => null);
  console.log('Body:', json);
}
run();

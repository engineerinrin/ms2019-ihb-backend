import app from './app';

const port: number = 3000;
const hostname: string = 'localhost';

app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});

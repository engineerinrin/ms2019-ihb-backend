import app from './app';
import { hostname, port } from './utils/config';

app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});

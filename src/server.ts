import mongoose from 'mongoose';
import { listen } from 'socket.io';
import app from './app';
import { startRemovalWork, stopRemovalWork } from './services/report';
import { hostname, port } from './utils/config';
import { dbUrl } from './utils/config';

const server = app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});

const io = listen(server);

io.on('connection', (socket: SocketIO.Socket) => {
  console.log('user connection');

  socket.on('startRemovalWork', async (reportId: string, name: string) => {
    const supportingUsers = await startRemovalWork(reportId, name);
    socket.join(reportId);
    socket.emit('startRemovalWork:receive', reportId);
    io.sockets.to(reportId).emit('syncSupportingUsers:receive', supportingUsers);
  });

  socket.on('stopRemovalWork', async (reportId: string, name: string) => {
    const supportingUsers = await stopRemovalWork(reportId, name);
    socket.emit('stopRemovalWork:receive');
    io.sockets.to(reportId).emit('syncSupportingUsers:receive', supportingUsers);
    socket.leave(reportId);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.disconnect();
  });
});

mongoose.connect(dbUrl, { useNewUrlParser: true });
